import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function reachQuiz(page: Page) {
  await page.goto('/?experience=motion');
  for (let count = 0; count < 20; count++) {
    if (await page.locator('.rq-locked').count()) break;
    await page.getByRole('button', { name: '다음 문장 →' }).click();
  }
  await expect(page.locator('.rq-locked')).toBeVisible();
  await expect(page.getByRole('group', { name: '정답 고르기' })).toHaveCount(0);
  await page.getByRole('button', { name: '○ 여기까지 읽었어요' }).click();
  await page.getByRole('button', { name: '잠깐 놀기 ✧' }).click();
}

test('wrong answer falls, recovers, permits retry, and preserves original and position', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await reachQuiz(page);
  const original = await page.locator('.mr-text').textContent();
  const position = await page.locator('.mr-book-top').textContent();
  await page.getByRole('button', { name: '1 가방', exact: true }).click();
  await expect(page.locator('.rq-stage')).toHaveClass(/is-breaking/);
  await expect(page.locator('.rq-cracks')).toBeAttached();
  await expect(page.locator('.rq-feedback')).toContainText('감점 없이');
  await expect(page.locator('.rq-stage')).not.toHaveClass(/is-breaking/, { timeout: 5000 });
  expect(await page.locator('.mr-text').textContent()).toBe(original);
  expect(await page.locator('.mr-book-top').textContent()).toBe(position);
  await expect.poll(() => page.locator('[data-quiz-letter]').evaluateAll(letters => letters.every(letter => {
    const transform = getComputedStyle(letter).transform;
    return transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)';
  }))).toBe(true);
  await page.getByRole('button', { name: '2 젖은 소매', exact: true }).click();
  await expect(page.locator('.rq-feedback')).toContainText('맞아요!');
  await page.getByText('원문 근거 펼치기', { exact: true }).click();
  await expect(page.locator('.rq-after blockquote')).toContainText('민서는 젖은 소매를 등 뒤로 감췄다.');
  await page.screenshot({ path: 'test-results/quiz-desktop.png', fullPage: true });
  await page.getByRole('button', { name: '다음 문장 →' }).click();
  await expect(page.locator('.rq')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('reduced motion has static feedback and skipping never blocks reading on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await reachQuiz(page);
  await page.getByRole('button', { name: '1 가방', exact: true }).click();
  await expect(page.locator('.rq-feedback')).toContainText('조금 달랐어요');
  await expect(page.locator('.rq-cracks')).toHaveCount(0);
  expect(await page.locator('[data-quiz-letter][style]').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/quiz-mobile.png', fullPage: true });
  await page.getByRole('button', { name: '닫고 계속 읽기 ↗' }).click();
  await expect(page.locator('.rq-skipped')).toBeVisible();
  await page.getByRole('button', { name: '다음 문장 →' }).click();
});

test('moving away during the fall cancels it without a late effect on the next page', async ({ page }) => {
  await reachQuiz(page);
  await page.getByRole('button', { name: '1 가방', exact: true }).click();
  await expect(page.locator('.rq-stage')).toHaveClass(/is-breaking/);
  await page.getByRole('button', { name: '다음 문장 →' }).click();
  await expect(page.locator('.rq-cracks')).toHaveCount(0);
  await expect(page.locator('[data-quiz-letter]')).toHaveCount(0);
  await expect(page.locator('.mr-text')).toBeVisible();
});
