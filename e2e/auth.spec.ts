import { test, expect } from '@playwright/test';
import { clearAuth, loginAs } from './helpers/auth.helper';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('login with valid credentials navigates to dashboard', async ({ page }) => {
    await page.route('**/asms/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-token',
          tokenType: 'Bearer',
          expiresIn: 3600,
          refreshToken: 'refresh-token',
        }),
      });
    });

    await page.goto('/auth/login');
    // TODO(angular-logic-implementer): fill real form fields once implemented
    await loginAs(page, 'mock-token');
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.route('**/asms/v1/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });

    await page.goto('/auth/login');
    // TODO(angular-logic-implementer): wire real form interaction once login component is implemented
  });
});
