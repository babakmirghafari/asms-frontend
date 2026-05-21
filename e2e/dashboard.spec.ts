import { test, expect } from '@playwright/test';

test.describe('Dashboard feature', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth token to bypass guard
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
