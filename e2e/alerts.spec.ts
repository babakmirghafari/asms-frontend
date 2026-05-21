import { test, expect } from '@playwright/test';

test.describe('alerts feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the alerts page', async ({ page }) => {
    await page.goto('/alerts');
    await expect(page).toHaveURL(/\/alerts/);
  });
});
