import { test, expect } from '@playwright/test';

test.describe('memberships feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the memberships page', async ({ page }) => {
    await page.goto('/memberships');
    await expect(page).toHaveURL(/\/memberships/);
  });
});
