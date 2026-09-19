import { test, expect } from '@playwright/test';

// Verify that the example webpage loads with the expected title and heading.
test('homepage should load successfully', async ({ page }) => {
  // Open the webpage that will be tested.
  await page.goto('https://example.com');

  // Verify that the page title contains the expected text.
  await expect(page).toHaveTitle(/Example Domain/);

  // Verify that the main heading is visible to the user.
  await expect(
    page.getByRole('heading', { name: 'Example Domain' })
  ).toBeVisible();
});