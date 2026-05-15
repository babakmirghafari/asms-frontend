import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginAs(page);
  });

  test('loads dashboard page when authenticated', async ({ page }) => {
    await page.route('**/asms/v1/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
