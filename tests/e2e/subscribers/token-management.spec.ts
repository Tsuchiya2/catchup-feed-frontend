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
    await expect(page.getByText('フィードトークン')).toBeVisible();
  });

  test('should list tokens without any plaintext (D-5)', async ({ page }) => {
    // Alice has one active and one revoked token
    await expect(page.getByText('TOKEN #101')).toBeVisible();
    await expect(page.getByText('TOKEN #102')).toBeVisible();
    await expect(page.getByText('有効', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('失効済', { exact: true })).toBeVisible();

    // The one-time-display warning is explained up front
    await expect(page.getByText(/発行時の一度だけ/)).toBeVisible();
  });

  test('should issue a token and show the subscription URL exactly once', async ({ page }) => {
    await page.getByTestId('token-issue-button').click();

    // One-time dialog with the plaintext feed URL and an explicit warning
    const dialog = page.getByTestId('issued-token-dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('issued-token-feed-url')).toHaveText(ISSUED_FEED_URL);
    await expect(dialog.getByRole('alert')).toContainText(/今回の一度だけ/);

    // D-5 UX: Escape must NOT dismiss the dialog (accidental loss protection)
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();

    // Copy button is present
    await expect(page.getByTestId('copy-feed-url-button')).toBeVisible();

    // Explicit close is required
    await dialog.getByRole('button', { name: /URL を保存した/ }).click();
    await expect(dialog).not.toBeVisible();

    // After closing, the plaintext URL is gone from the page for good
    await expect(page.getByText(ISSUED_FEED_URL)).toHaveCount(0);

    // The new token appears in the list as metadata only
    await expect(page.getByText('TOKEN #9000')).toBeVisible();
  });

  test('should revoke a token after an irreversible-warning confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'トークン #101 を失効' }).click();

    const dialog = page.getByTestId('token-revoke-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/失効は取り消せません/);

    const revokeRequest = page.waitForRequest(
      (req) => req.method() === 'DELETE' && /\/tokens\/101$/.test(new URL(req.url()).pathname)
    );
    await dialog.getByRole('button', { name: '完全に失効させる' }).click();
    await revokeRequest;

    await expect(dialog).not.toBeVisible();
    // Both of Alice's tokens are now revoked
    await expect(page.getByText('失効済', { exact: true })).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'トークン #101 を失効' })).not.toBeVisible();
  });

  test('should not allow issuing tokens for a deactivated friend', async ({ page }) => {
    await page.goto('/subscribers/3'); // Carol is deactivated

    await expect(page.getByText('フィードトークン')).toBeVisible();
    await expect(page.getByTestId('token-issue-button')).toBeDisabled();
    await expect(page.getByText(/無効化されているため、新しいトークンは発行できません/)).toBeVisible();
  });

  test('should show recent accesses for the friend', async ({ page }) => {
    await expect(page.getByText('最近のアクセス')).toBeVisible();
    // Alice's latest access is an episode download
    await expect(page.getByText(/第42号をダウンロード/)).toBeVisible();
    // Bob's accesses are not shown on Alice's page
    await expect(page.getByText(/第12号をダウンロード/)).not.toBeVisible();
  });
});
