import { test, expect } from '@playwright/test';

test.describe('audit-logs feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('asms_token', 'mock-jwt-token');
      window.localStorage.setItem('asms_user_id', 'mock-user-id');
    });
  });

  test('loads the audit-logs page', async ({ page }) => {
    await page.goto('/audit-logs');
    await expect(page).toHaveURL(/\/audit-logs/);
  });
});
