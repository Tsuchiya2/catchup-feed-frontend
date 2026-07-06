/**
 * Source kind (Phase 2 multi-modal ingestion): rss / youtube / podcast.
 *
 * Covers the §9-3 frontend follow-up: kind selection in the create form
 * (default 'rss', YouTube feed-URL help text) and the kind badge on cards.
 */
import { test, expect } from '../support/test';

test.describe('Source Kind', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/sources');
    await expect(page.getByRole('heading', { name: 'Go Blog' })).toBeVisible();
  });

  test('shows the kind badge on existing sources (explicit rss)', async ({ page }) => {
    const goBlogCard = page.getByRole('listitem', { name: 'Source: Go Blog' });
    await expect(goBlogCard.getByTestId('source-kind-badge')).toHaveText('RSS');
  });

  test('falls back to the RSS badge when kind is missing (pre-Phase 2 backend)', async ({
    page,
  }) => {
    // The Hacker News mock omits `kind` on purpose (see mock-data.ts).
    const hnCard = page.getByRole('listitem', { name: 'Source: Hacker News' });
    await expect(hnCard.getByTestId('source-kind-badge')).toHaveText('RSS');
  });

  test('creates a YouTube source with kind and format help', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Source' }).click();

    const kindSelect = page.getByTestId('source-kind-select');
    await expect(kindSelect).toHaveValue('rss');
    // Help text only appears for the youtube kind
    await expect(page.getByText(/youtube\.com\/feeds\/videos\.xml/)).not.toBeVisible();

    await kindSelect.selectOption('youtube');
    await expect(
      page.getByText('https://www.youtube.com/feeds/videos.xml?channel_id=...')
    ).toBeVisible();

    await page.getByTestId('source-name-input').fill('Some Channel');
    await page
      .getByTestId('source-url-input')
      .fill('https://www.youtube.com/feeds/videos.xml?channel_id=UC123');
    await page.getByTestId('source-category-input').fill('tech');

    const createRequest = page.waitForRequest(
      (req) => req.method() === 'POST' && new URL(req.url()).pathname === '/sources'
    );
    await page.getByTestId('source-save-button').click();
    const request = await createRequest;
    expect(request.postDataJSON()).toMatchObject({ kind: 'youtube' });

    const newCard = page.getByRole('listitem', { name: 'Source: Some Channel' });
    await expect(newCard).toBeVisible();
    await expect(newCard.getByTestId('source-kind-badge')).toHaveText('YouTube');
  });

  test('pre-selects the current kind in the edit dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit source: Go Blog' }).click();

    await expect(page.getByTestId('source-edit-dialog')).toBeVisible();
    await expect(page.getByTestId('source-kind-select')).toHaveValue('rss');
  });
});
