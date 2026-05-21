import { test, expect } from '@playwright/test';

test.describe('permission-groups feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the permission-groups page', async ({ page }) => {
    await page.goto('/permission-groups');
    await expect(page).toHaveURL(/\/permission-groups/);
  });
});
