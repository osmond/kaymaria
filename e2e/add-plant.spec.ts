import { test, expect } from '@playwright/test';

test('add plant page renders', async ({ page }) => {
  await page.goto('/app/plants/new');
  await expect(page.getByRole('heading', { name: 'Add Plant' })).toBeVisible();
});
