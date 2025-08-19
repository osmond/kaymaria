import { test, expect } from '@playwright/test';

test('plant detail page renders', async ({ page }) => {
  await page.goto('/app/plants/1');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
