import { test, expect } from '@playwright/test';

test('insights page renders', async ({ page }) => {
  await page.goto('/app/insights');
  await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible();
});
