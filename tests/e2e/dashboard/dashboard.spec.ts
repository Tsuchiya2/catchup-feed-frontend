import { test, expect } from '../support/test';
import { fulfillJsonError } from '../support/api-mock';
import { ARTICLE_COUNT } from '../support/mock-data';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/dashboard');
  });

  test('should display statistics from the API', async ({ page }) => {
    // 明朝の候補 links to the full article list with the total count
    await expect(page.getByRole('heading', { name: '明朝の候補' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: `${ARTICLE_COUNT} 件すべて見る` })
    ).toBeVisible();
    // 受信状況 panel shows per-friend last access (real data)
    await expect(page.getByRole('heading', { name: '受信状況' })).toBeVisible();
  });

  test('should display recent articles', async ({ page }) => {
    await expect(page.getByText('Go 1.25 Released')).toBeVisible();
  });

  test('should show the console rail navigation', async ({ page }) => {
    const rail = page.locator('aside');
    for (const item of ['概況', '記事', 'ソース', '書籍', '友人', '視聴者', 'アクセスログ', '復習']) {
      await expect(rail.getByRole('link', { name: item, exact: true })).toBeVisible();
    }
  });

  test('should navigate to friends via the rail', async ({ page }) => {
    await page.locator('aside').getByRole('link', { name: '友人', exact: true }).click();
    await expect(page).toHaveURL(/\/subscribers/);
    await expect(page.getByRole('heading', { name: '友人' })).toBeVisible();
  });

  test('should show an error message when the stats API fails', async ({ page }) => {
    // Page-level route overrides the context-level ApiMock route
    await page.route(/\/articles\?/, (route) => fulfillJsonError(route, 400, { error: 'bad request' }));

    await page.goto('/dashboard');
    await expect(page.getByText('記事の取得に失敗しました').first()).toBeVisible();
  });
});
