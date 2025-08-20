import { test, expect } from '@playwright/test';

test('plants grid is responsive', async ({ page }) => {
  // mock plants API to supply sample items
  await page.route('**/api/plants', route => {
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', name: 'Aloe', room: 'Kitchen' },
        { id: '2', name: 'Fern', room: 'Office' },
      ]),
    });
  });

  // mobile viewport should stack cards vertically
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto('/app/plants');
  const first = page.locator('[data-testid="plants-grid"] a').first();
  const second = page.locator('[data-testid="plants-grid"] a').nth(1);
  const firstSmall = await first.boundingBox();
  const secondSmall = await second.boundingBox();
  expect(firstSmall && secondSmall && secondSmall.y > firstSmall.y).toBeTruthy();

  // wider viewport should display cards side by side
  await page.setViewportSize({ width: 800, height: 800 });
  await page.reload();
  const firstLarge = await first.boundingBox();
  const secondLarge = await second.boundingBox();
  expect(
    firstLarge &&
      secondLarge &&
      Math.abs((secondLarge.y ?? 0) - (firstLarge.y ?? 0)) < 5,
  ).toBeTruthy();
});
