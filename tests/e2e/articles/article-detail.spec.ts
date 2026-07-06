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

    const originalLink = page.getByRole('link', { name: /read original article/i });
    await expect(originalLink).toBeVisible();
    await expect(originalLink).toHaveAttribute('href', 'https://blog.example.test/posts/25');
    await expect(originalLink).toHaveAttribute('target', '_blank');
  });

  test('should navigate back to the article list', async ({ page }) => {
    await page.goto('/articles');
    await page.getByRole('link', { name: /Article: Go 1\.25 Released/ }).click();
    await expect(page).toHaveURL(/\/articles\/25/);

    await page.getByRole('button', { name: /back to articles/i }).click();
    await expect(page).toHaveURL(/\/articles(\?|$)/);
  });

  test('should show not-found state for a missing article', async ({ page }) => {
    await page.goto('/articles/99999');

    await expect(page.getByText(/not found|error/i).first()).toBeVisible();
  });
});
