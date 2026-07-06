import { test, expect } from '../support/test';

test.describe('Source Search', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/sources');
  });

  test('should display the search input', async ({ page }) => {
    await expect(page.getByPlaceholder('Search by name or URL...')).toBeVisible();
  });

  test('should search sources by name (debounced /sources/search request)', async ({ page }) => {
    const searchRequest = page.waitForRequest(
      (req) => req.url().includes('/sources/search') && req.url().includes('keyword=Hacker')
    );

    await page.getByPlaceholder('Search by name or URL...').fill('Hacker');
    await searchRequest;

    await expect(page.getByRole('heading', { name: 'Hacker News' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Go Blog' })).not.toBeVisible();
    await expect(page).toHaveURL(/keyword=Hacker/);
  });

  test('should search sources by URL', async ({ page }) => {
    await page.getByPlaceholder('Search by name or URL...').fill('ycombinator');

    await expect(page.getByRole('heading', { name: 'Hacker News' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Go Blog' })).not.toBeVisible();
  });

  test('should show no-results message for an unmatched keyword', async ({ page }) => {
    await page.getByPlaceholder('Search by name or URL...').fill('zzz-no-such-source');

    await expect(page.getByText('No sources found')).toBeVisible();
  });
});
