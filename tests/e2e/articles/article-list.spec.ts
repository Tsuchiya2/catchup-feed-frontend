import { test, expect } from '../support/test';

test.describe('Article List', () => {
  test.beforeEach(async ({ authenticated: _auth }) => {});

  test('should display the article list with metadata', async ({ page }) => {
    await page.goto('/articles');

    await expect(page.getByRole('heading', { name: 'Articles' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Go 1.25 Released' })).toBeVisible();
    // Card shows the AI summary excerpt
    await expect(page.getByText(/AI summary for article 25/)).toBeVisible();
  });

  test('should navigate to article detail when clicking an article', async ({ page }) => {
    await page.goto('/articles');

    await page.getByRole('link', { name: /Article: Go 1\.25 Released/ }).click();

    await expect(page).toHaveURL(/\/articles\/25/);
    await expect(page.getByRole('heading', { name: 'Go 1.25 Released', level: 1 })).toBeVisible();
  });

  test('should paginate (25 articles, 10 per page)', async ({ page }) => {
    await page.goto('/articles');
    await expect(page.getByRole('heading', { name: 'Go 1.25 Released' })).toBeVisible();

    const nextButton = page.getByRole('button', { name: 'Go to next page' });
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    await expect(page).toHaveURL(/page=2/);
    // Page 2 holds articles 15..6
    await expect(page.getByRole('heading', { name: 'Sample Article 15' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Go 1.25 Released' })).not.toBeVisible();
  });

  test('should show empty state when no articles exist', async ({ page, api }) => {
    api.articles = [];
    await page.goto('/articles');

    await expect(page.getByText('No articles yet')).toBeVisible();
  });

  test('should show an error message when the API fails', async ({ page }) => {
    await page.route(/\/articles\?/, (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ error: 'boom', message: 'boom' }),
      })
    );
    await page.goto('/articles');

    await expect(page.getByText(/error|failed|boom/i).first()).toBeVisible();
  });
});
