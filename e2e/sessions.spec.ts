import { test, expect } from '@playwright/test';

test.describe('sessions feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the sessions page', async ({ page }) => {
    await page.goto('/sessions');
    await expect(page).toHaveURL(/\/sessions/);
  });
});
