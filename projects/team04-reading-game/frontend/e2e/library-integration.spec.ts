import { expect, test } from '@playwright/test'

test('the new library opens the existing EPUB and motion readers', async ({ page }) => {
  await page.goto('/library')
  await page.getByRole('textbox', { name: '닉네임' }).fill('독자')
  await page.getByRole('button', { name: '소설', exact: true }).click()
  await page.getByRole('button', { name: '시작하기' }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/library')
  const epub = page.getByRole('link', { name: /안개 궤도/ })
  await expect(epub).toBeVisible()
  await expect(page.getByRole('button', { name: /등대지기의 편지/ })).toBeVisible()
  await epub.click()
  await expect(page).toHaveURL(/\/epub\?book=/)
  await page.getByRole('link', { name: '서재로 돌아가기' }).click()
  await expect(page).toHaveURL(/\/library$/)

  await page.getByRole('link', { name: '움직이는 글 읽기' }).click()
  await expect(page.locator('.mr-text')).toBeVisible()
  await page.getByRole('link', { name: '서재로 돌아가기' }).click()
  await expect(page).toHaveURL(/\/library$/)
})
