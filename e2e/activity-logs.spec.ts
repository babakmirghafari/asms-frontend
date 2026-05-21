import { test, expect } from '@playwright/test';

test.describe('activity-logs feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the activity-logs page', async ({ page }) => {
    await page.goto('/activity-logs');
    await expect(page).toHaveURL(/\/activity-logs/);
  });
});
