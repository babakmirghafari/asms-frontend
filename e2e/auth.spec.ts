import { test, expect } from '@playwright/test';

test.describe('Authentication feature', () => {
  test('loads the login page', async ({ page }) => {
    await page.goto('/auth');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth/);
  });
});
