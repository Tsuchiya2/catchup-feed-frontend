import { test, expect } from '../support/test';
import { TEST_CREDENTIALS } from '../support/auth';

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // The page h1 is the brand; the form card title is plain text
    await expect(page.getByRole('heading', { name: 'Catchup Feed' })).toBeVisible();
    await expect(page.getByText('Enter your credentials to access your account')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should block submission of an invalid email', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('whatever');
    await page.getByRole('button', { name: 'Login' }).click();

    // input[type=email] native constraint validation blocks the submit
    const isValid = await page
      .getByLabel('Email')
      .evaluate((el) => (el as HTMLInputElement).checkValidity());
    expect(isValid).toBe(false);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login with valid credentials and land on the dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(TEST_CREDENTIALS.email);
    await page.getByLabel('Password').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should stay unauthenticated on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(TEST_CREDENTIALS.email);
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Login' }).click();

    // The API client reacts to the 401 by clearing tokens and reloading
    // /login, so the user remains on the login page, unauthenticated.
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // Protected routes are still inaccessible
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated access to a protected route to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
    await expect(page.getByText('Enter your credentials to access your account')).toBeVisible();
  });

  test('should redirect an authenticated user away from the login page', async ({
    page,
    authenticated: _authenticated,
  }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
