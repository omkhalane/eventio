import { expect, test } from '@playwright/test';

test('loads the Eventio web app', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Eventio/);
  await expect(page.locator('#root')).toBeVisible();
});
