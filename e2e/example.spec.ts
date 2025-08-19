import { test, expect } from '@playwright/test';

test('renders a simple page', async ({ page }) => {
  await page.setContent('<h1>hello world</h1>');
  await expect(page.getByRole('heading', { name: 'hello world' })).toBeVisible();
});
