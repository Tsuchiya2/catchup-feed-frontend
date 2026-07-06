import { test, expect } from '../support/test';

test.describe('Source List', () => {
  test.beforeEach(async ({ authenticated: _auth }) => {});

  test('should display sources with metadata', async ({ page }) => {
    await page.goto('/sources');

    await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Go Blog' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hacker News' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Visit feed: https://go.dev/blog/feed.atom' })
    ).toBeVisible();
  });

  test('should show empty state when no sources are configured', async ({ page, api }) => {
    api.sources = [];
    await page.goto('/sources');

    await expect(page.getByText('No sources configured')).toBeVisible();
  });

  test('should show an error message when the API fails', async ({ page }) => {
    await page.route(/\/sources$/, (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ error: 'boom', message: 'boom' }),
      })
    );
    await page.goto('/sources');

    await expect(page.getByText(/error|failed|boom/i).first()).toBeVisible();
  });

  test('should open the Add Source dialog', async ({ page }) => {
    await page.goto('/sources');

    await page.getByRole('button', { name: 'Add Source' }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByTestId('source-name-input')).toBeVisible();
    await expect(page.getByTestId('source-url-input')).toBeVisible();
  });

  test('should create a new source', async ({ page }) => {
    await page.goto('/sources');
    await page.getByRole('button', { name: 'Add Source' }).click();

    await page.getByTestId('source-name-input').fill('New Feed');
    await page.getByTestId('source-url-input').fill('https://new.example.test/rss');
    await page.getByTestId('source-category-input').fill('tech');
    await page.getByTestId('source-lang-input').fill('en');
    await page.getByTestId('source-save-button').click();

    await expect(page.getByRole('heading', { name: 'New Feed' })).toBeVisible();
  });
});
