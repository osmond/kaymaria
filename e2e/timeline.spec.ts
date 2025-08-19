import { test, expect } from '@playwright/test';

test('timeline page renders', async ({ page }) => {
  await page.goto('/app/timeline');
  await expect(page.getByRole('heading', { level: 1, name: 'Timeline' })).toBeVisible();
});
