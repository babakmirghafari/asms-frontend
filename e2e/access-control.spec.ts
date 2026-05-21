import { test, expect } from '@playwright/test';

test.describe('access-control feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the access-control page', async ({ page }) => {
    await page.goto('/access-control');
    await expect(page).toHaveURL(/\/access-control/);
  });
});
