/**
 * Source deletion flow.
 *
 * Replaces the old source-delete-performance.spec.ts: performance
 * measurement is out of scope for this single-admin system (right-sizing
 * principle), so only the functional behaviour is verified.
 */
import { test, expect } from '../support/test';
import { fulfillJsonError } from '../support/api-mock';

test.describe('Source Delete', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/sources');
    await expect(page.getByRole('heading', { name: 'Go Blog' })).toBeVisible();
  });

  test('should delete a source after confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete source: Go Blog' }).click();

    await expect(page.getByTestId('source-delete-dialog')).toBeVisible();

    const deleteRequest = page.waitForRequest(
      (req) => req.method() === 'DELETE' && /\/sources\/1$/.test(new URL(req.url()).pathname)
    );
    await page.getByTestId('source-delete-confirm-button').click();
    await deleteRequest;

    await expect(page.getByRole('heading', { name: 'Go Blog' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hacker News' })).toBeVisible();
  });

  test('should keep the source when cancelling the dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete source: Go Blog' }).click();
    await expect(page.getByTestId('source-delete-dialog')).toBeVisible();

    await page.getByTestId('source-delete-cancel-button').click();

    await expect(page.getByTestId('source-delete-dialog')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Go Blog' })).toBeVisible();
  });

  test('should surface an error when deletion fails', async ({ page }) => {
    await page.route(/\/sources\/1$/, (route) => fulfillJsonError(route, 400, { error: 'delete failed' }));

    await page.getByRole('button', { name: 'Delete source: Go Blog' }).click();
    await page.getByTestId('source-delete-confirm-button').click();

    await expect(page.getByTestId('source-delete-error')).toBeVisible();

    // Close the dialog; the source is still present
    await page.getByTestId('source-delete-cancel-button').click();
    await expect(page.getByRole('heading', { name: 'Go Blog' })).toBeVisible();
  });
});
