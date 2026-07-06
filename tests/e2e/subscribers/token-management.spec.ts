/**
 * Feed token management on the friend detail page.
 *
 * The critical behaviour is D-5: tokens are stored hashed, so the plaintext
 * subscription URL is displayed exactly once at issue time and can never be
 * shown again. Revocation is irreversible.
 */
import { test, expect } from '../support/test';
import { ISSUED_FEED_URL } from '../support/mock-data';

test.describe('Feed Token Management', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/subscribers/1');
    await expect(page.getByText('Feed Tokens')).toBeVisible();
  });

  test('should list tokens without any plaintext (D-5)', async ({ page }) => {
    // Alice has one active and one revoked token
    await expect(page.getByText('Token #101')).toBeVisible();
    await expect(page.getByText('Token #102')).toBeVisible();
    await expect(page.getByText('Active', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Revoked', { exact: true })).toBeVisible();

    // The one-time-display warning is explained up front
    await expect(page.getByText(/shown only once at issue time/i)).toBeVisible();
  });

  test('should issue a token and show the subscription URL exactly once', async ({ page }) => {
    await page.getByTestId('token-issue-button').click();

    // One-time dialog with the plaintext feed URL and an explicit warning
    const dialog = page.getByTestId('issued-token-dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('issued-token-feed-url')).toHaveText(ISSUED_FEED_URL);
    await expect(dialog.getByRole('alert')).toContainText(/only once/i);

    // D-5 UX: Escape must NOT dismiss the dialog (accidental loss protection)
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();

    // Copy button is present
    await expect(page.getByTestId('copy-feed-url-button')).toBeVisible();

    // Explicit close is required
    await dialog.getByRole('button', { name: /I saved the URL/i }).click();
    await expect(dialog).not.toBeVisible();

    // After closing, the plaintext URL is gone from the page for good
    await expect(page.getByText(ISSUED_FEED_URL)).toHaveCount(0);

    // The new token appears in the list as metadata only
    await expect(page.getByText('Token #9000')).toBeVisible();
  });

  test('should revoke a token after an irreversible-warning confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Revoke token #101' }).click();

    const dialog = page.getByTestId('token-revoke-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/cannot be undone/i);

    const revokeRequest = page.waitForRequest(
      (req) => req.method() === 'DELETE' && /\/tokens\/101$/.test(new URL(req.url()).pathname)
    );
    await dialog.getByRole('button', { name: 'Revoke permanently' }).click();
    await revokeRequest;

    await expect(dialog).not.toBeVisible();
    // Both of Alice's tokens are now revoked
    await expect(page.getByText('Revoked', { exact: true })).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Revoke token #101' })).not.toBeVisible();
  });

  test('should not allow issuing tokens for a deactivated friend', async ({ page }) => {
    await page.goto('/subscribers/3'); // Carol is deactivated

    await expect(page.getByText('Feed Tokens')).toBeVisible();
    await expect(page.getByTestId('token-issue-button')).toBeDisabled();
    await expect(page.getByText(/deactivated; new tokens cannot be issued/i)).toBeVisible();
  });

  test('should show recent accesses for the friend', async ({ page }) => {
    await expect(page.getByText('Recent Accesses')).toBeVisible();
    // Alice's latest access is an episode download
    await expect(page.getByText('downloaded episode #42')).toBeVisible();
    // Bob's accesses are not shown on Alice's page
    await expect(page.getByText('downloaded episode #12')).not.toBeVisible();
  });
});
