import { test, expect } from '../support/test';

test.describe('Article Search', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/articles');
  });

  test('should display the search input', async ({ page }) => {
    await expect(page.getByPlaceholder('Search by title or summary...')).toBeVisible();
  });

  test('should search articles by keyword (debounced /articles/search request)', async ({
    page,
  }) => {
    const searchRequest = page.waitForRequest(
      (req) => req.url().includes('/articles/search') && req.url().includes('keyword=Go')
    );

    await page.getByPlaceholder('Search by title or summary...').fill('Go 1.25');
    await searchRequest;

    await expect(page.getByRole('heading', { name: 'Go 1.25 Released' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sample Article 24' })).not.toBeVisible();
    await expect(page).toHaveURL(/keyword=Go/);
  });

  test('should show no-results message for an unmatched keyword', async ({ page }) => {
    await page.getByPlaceholder('Search by title or summary...').fill('zzz-no-such-article');

    await expect(page.getByText('No articles found')).toBeVisible();
  });

  test('should clear filters and return to the full list', async ({ page }) => {
    await page.getByPlaceholder('Search by title or summary...').fill('zzz-no-such-article');
    await expect(page.getByText('No articles found')).toBeVisible();

    await page.getByRole('button', { name: 'Clear All Filters' }).click();

    await expect(page.getByRole('heading', { name: 'Go 1.25 Released' })).toBeVisible();
  });
});
