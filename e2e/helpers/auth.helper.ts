import { Page } from '@playwright/test';

export async function loginAs(page: Page, token = 'mock-jwt-token') {
  await page.evaluate((t) => localStorage.setItem('auth_token', t), token);
}

export async function clearAuth(page: Page) {
  await page.evaluate(() => localStorage.removeItem('auth_token'));
}
