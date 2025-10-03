import { test, expect } from '@playwright/test';

test.describe('Login Page Screenshots', () => {
  test('should match login page screenshot', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Take a screenshot and compare
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match login page with validation error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in email but leave password empty
    await page.fill('input[type="email"]', 'test@example.com');

    // Try to submit (HTML5 validation will block it, but we can test the state)
    await page.click('button[type="submit"]');

    // Wait a moment for any UI changes
    await page.waitForTimeout(500);

    // Take screenshot
    await expect(page).toHaveScreenshot('login-page-with-email.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match login page with password visibility toggled', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in the password
    await page.fill('input[type="password"]', 'testpassword');

    // Click the password visibility toggle
    await page.click('button[aria-label="toggle password visibility"]');

    // Wait for the toggle animation
    await page.waitForTimeout(300);

    // Take screenshot showing visible password
    await expect(page).toHaveScreenshot('login-page-password-visible.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
