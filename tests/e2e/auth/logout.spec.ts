import { test, expect } from '../support/test';
import { AUTH_TOKEN_KEY } from '../support/auth';

test.describe('Logout Flow', () => {
  test('should logout and clear session data', async ({ page, authenticated: _auth }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.getByTestId('header-logout-button').click();

    await expect(page).toHaveURL(/\/login/);

    // Session data is gone
    const token = await page.evaluate((key) => window.localStorage.getItem(key), AUTH_TOKEN_KEY);
    expect(token).toBeNull();
    const cookies = await page.context().cookies();
    const authCookie = cookies.find((c) => c.name === AUTH_TOKEN_KEY);
    expect(authCookie?.value || '').toBe('');
  });

  test('should not allow access to protected routes after logout', async ({
    page,
    authenticated: _auth,
  }) => {
    await page.goto('/dashboard');
    await page.getByTestId('header-logout-button').click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/subscribers');
    await expect(page).toHaveURL(/\/login/);
  });
});
