import { test, expect } from '../support/test';
import { fulfillJsonError } from '../support/api-mock';

test.describe('Article List', () => {
  test.beforeEach(async ({ authenticated: _auth }) => {});

  test('should display the article list with metadata', async ({ page }) => {
    await page.goto('/articles');

    await expect(page.getByRole('heading', { name: '記事' })).toBeVisible();
    await expect(page.getByText('Go 1.25 Released')).toBeVisible();
    // Row shows the AI summary excerpt
    await expect(page.getByText(/AI summary for article 25/)).toBeVisible();
  });

  test('should navigate to article detail when clicking an article', async ({ page }) => {
    await page.goto('/articles');

    await page.getByRole('link', { name: /記事: Go 1\.25 Released/ }).click();

    await expect(page).toHaveURL(/\/articles\/25/);
    await expect(page.getByRole('heading', { name: 'Go 1.25 Released', level: 1 })).toBeVisible();
  });

  test('should paginate (25 articles, 10 per page)', async ({ page }) => {
    await page.goto('/articles');
    await expect(page.getByText('Go 1.25 Released')).toBeVisible();

    const nextButton = page.getByRole('button', { name: '次のページへ' });
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    await expect(page).toHaveURL(/page=2/);
    // Page 2 holds articles 15..6
    await expect(page.getByText('Sample Article 15')).toBeVisible();
    await expect(page.getByText('Go 1.25 Released')).not.toBeVisible();
  });

  test('should show empty state when no articles exist', async ({ page, api }) => {
    api.articles = [];
    await page.goto('/articles');

    await expect(page.getByText('記事はまだありません')).toBeVisible();
  });

  test('should show an error message when the API fails', async ({ page }) => {
    await page.route(/\/articles\?/, (route) => fulfillJsonError(route, 400, { error: 'boom' }));
    await page.goto('/articles');

    await expect(page.getByText(/失敗|エラー|boom/i).first()).toBeVisible();
  });
});
