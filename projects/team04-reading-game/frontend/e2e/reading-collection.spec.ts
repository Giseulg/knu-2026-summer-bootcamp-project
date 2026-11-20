import { expect, test } from '@playwright/test'

test('confirmed clues unlock a character, persist its village placement, and link to the original', async ({ page }) => {
  await page.goto('/')
  await page.locator('#nick').fill('독자')
  await page.getByRole('button', { name: '소설', exact: true }).click()
  await page.getByRole('button', { name: '시작하기' }).click()
  await page.getByRole('link', { name: '문장 단서 찾기' }).click()
  await page.getByRole('button', { name: /문단 담기/ }).click()
  await page.getByRole('button', { name: /여기까지 읽었어요/ }).click()

  for (let step = 0; step < 25; step++) {
    if ((await page.locator('.mr-book-top').innerText()).includes('구간 2 / 4')) break
    await page.getByRole('button', { name: /다음 문장/ }).click()
  }
  await expect(page.locator('.mr-book-top')).toContainText('구간 2 / 4')
  await page.getByRole('button', { name: /문단 담기/ }).click()
  await page.getByText('단서 잇기', { exact: false }).click()
  await expect(page.getByRole('button', { name: '단서 연결하고 캐릭터 만나기' })).toHaveCount(0)
  await page.getByRole('button', { name: /여기까지 읽었어요/ }).click()
  await page.getByRole('textbox', { name: '두 문장을 읽고 어떤 생각이 들었나요?' }).fill('앞의 단서와 새 장면이 연결됐다.')
  await page.getByRole('button', { name: '단서 연결하고 캐릭터 만나기' }).click()
  await page.getByRole('link', { name: /내 캐릭터에서 마을에 배치하기/ }).click()
  await expect(page.getByText('앞의 단서와 새 장면이 연결됐다.')).toBeVisible()
  await page.getByLabel('마을 배치 위치').selectOption({ label: '왼쪽 산책길' })
  await page.getByRole('link', { name: '마을에서 보기' }).click()
  await page.reload()
  await page.getByRole('link', { name: '빗길 수집가' }).click()
  await expect(page.getByLabel('마을 배치 위치')).toHaveValue('0')
  await page.getByRole('link', { name: '단서 1 원문으로' }).click()
  await expect(page.locator('.mr-book-top')).toContainText('구간 1 / 4')
  await expect(page.getByRole('button', { name: '1번째 문단 선택' })).toHaveAttribute('aria-pressed', 'true')
})
