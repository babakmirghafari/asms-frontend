import { test, expect } from '@playwright/test';

test.describe('users feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the users page', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/users/);
  });
});
