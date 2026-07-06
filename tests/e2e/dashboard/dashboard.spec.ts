import { test, expect } from '../support/test';
import { ARTICLE_COUNT } from '../support/mock-data';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/dashboard');
  });

  test('should display statistics from the API', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Total Articles = pagination.total, Total Sources = list length
    // (the stat value is the only .text-2xl node in each card)
    await expect(page.getByText('Total Articles')).toBeVisible();
    await expect(
      page.locator('div.text-2xl').filter({ hasText: new RegExp(`^${ARTICLE_COUNT}$`) })
    ).toBeVisible();
    await expect(page.getByText('Total Sources')).toBeVisible();
    await expect(page.locator('div.text-2xl').filter({ hasText: /^3$/ })).toBeVisible();
  });

  test('should display recent articles', async ({ page }) => {
    await expect(page.getByText('Go 1.25 Released')).toBeVisible();
  });

  test('should show the main navigation', async ({ page }) => {
    const nav = page.getByTestId('header-nav-desktop');
    for (const item of ['Dashboard', 'Articles', 'Sources', 'Friends', 'Access Logs']) {
      await expect(nav.getByRole('link', { name: item })).toBeVisible();
    }
  });

  test('should navigate to friends via the navigation menu', async ({ page }) => {
    await page.getByTestId('header-nav-desktop').getByRole('link', { name: 'Friends' }).click();
    await expect(page).toHaveURL(/\/subscribers/);
    await expect(page.getByRole('heading', { name: 'Friends' })).toBeVisible();
  });

  test('should show an error message when the stats API fails', async ({ page }) => {
    // Page-level route overrides the context-level ApiMock route
    await page.route(/\/articles\?/, (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ error: 'bad request', message: 'bad request' }),
      })
    );

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText(/error|failed|bad request/i).first()).toBeVisible();
  });
});
