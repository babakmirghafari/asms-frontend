import { test, expect } from '@playwright/test';

test.describe('permissions feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the permissions page', async ({ page }) => {
    await page.goto('/permissions');
    await expect(page).toHaveURL(/\/permissions/);
  });
});
