import { test, expect } from '../support/test';

test.describe('Article Detail', () => {
  test.beforeEach(async ({ authenticated: _auth }) => {});

  test('should display article details with AI summary', async ({ page }) => {
    await page.goto('/articles/25');

    await expect(page.getByRole('heading', { name: 'Go 1.25 Released', level: 1 })).toBeVisible();
    await expect(page.getByText(/AI summary for article 25/)).toBeVisible();
  });

  test('should link to the original article', async ({ page }) => {
    await page.goto('/articles/25');

    const originalLink = page.getByRole('link', { name: '原文' });
    await expect(originalLink).toBeVisible();
    await expect(originalLink).toHaveAttribute('href', 'https://blog.example.test/posts/25');
    await expect(originalLink).toHaveAttribute('target', '_blank');
  });

  test('should navigate back to the article list', async ({ page }) => {
    await page.goto('/articles');
    await page.getByRole('link', { name: /記事: Go 1\.25 Released/ }).click();
    await expect(page).toHaveURL(/\/articles\/25/);

    // Status-band breadcrumb links back to the list
    await page
      .locator('a[href="/articles"]')
      .filter({ hasText: '記事' })
      .first()
      .click();
    await expect(page).toHaveURL(/\/articles(\?|$)/);
  });

  test('should show not-found state for a missing article', async ({ page }) => {
    await page.goto('/articles/99999');

    await expect(
      page.getByText(/記事が見つかりませんでした|記事の取得に失敗しました/).first()
    ).toBeVisible();
  });
});
