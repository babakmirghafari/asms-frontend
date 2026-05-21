import { test, expect } from '@playwright/test';

test.describe('auth-policies feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the auth-policies page', async ({ page }) => {
    await page.goto('/auth-policies');
    await expect(page).toHaveURL(/\/auth-policies/);
  });
});
