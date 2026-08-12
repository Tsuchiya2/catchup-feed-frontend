import { test, expect } from '../support/test';
import { TEST_CREDENTIALS } from '../support/auth';

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    await expect(
      page.getByText('このサービスは個人利用の範囲で運用しております。')
    ).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
  });

  test('should block submission of an invalid email', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('メールアドレス').fill('invalid-email');
    await page.getByLabel('パスワード').fill('whatever');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // input[type=email] native constraint validation blocks the submit
    const isValid = await page
      .getByLabel('メールアドレス')
      .evaluate((el) => (el as HTMLInputElement).checkValidity());
    expect(isValid).toBe(false);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login with valid credentials and land on the dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.getByLabel('パスワード').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: '明朝の候補' })).toBeVisible();
  });

  test('should stay unauthenticated on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.getByLabel('パスワード').fill('wrong-password');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // The API client reacts to the 401 by clearing tokens and reloading
    // /login, so the user remains on the login page, unauthenticated.
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();

    // Protected routes are still inaccessible
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated access to a protected route to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
    await expect(
      page.getByText('このサービスは個人利用の範囲で運用しております。')
    ).toBeVisible();
  });

  test('should redirect an authenticated user away from the login page', async ({
    page,
    authenticated: _authenticated,
  }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
