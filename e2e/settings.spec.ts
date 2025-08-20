import { test, expect } from '@playwright/test';

test('settings page renders', async ({ page }) => {
  await page.goto('/app/settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
});
