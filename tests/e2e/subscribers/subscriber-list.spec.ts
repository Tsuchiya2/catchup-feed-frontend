/**
 * Friends (subscribers) management: CRUD with soft delete (deactivation).
 */
import { test, expect } from '../support/test';

test.describe('Friends List', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/subscribers');
  });

  test('should list friends with active/deactivated status', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Friends' })).toBeVisible();
    // 3 active (Alice, Bob, Dave), 1 deactivated (Carol)
    await expect(page.getByText('3 active, 1 deactivated')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Alice', exact: true })).toBeVisible();
    // Carol stays visible after soft delete (history preserved)
    await expect(page.getByRole('heading', { name: 'Carol', exact: true })).toBeVisible();
  });

  test('should add a friend', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Friend' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByTestId('subscriber-name-input').fill('Erin');
    await page.getByTestId('subscriber-email-input').fill('erin@example.com');
    await page.getByTestId('subscriber-note-input').fill('Coworker');

    const createRequest = page.waitForRequest(
      (req) => req.method() === 'POST' && new URL(req.url()).pathname === '/subscribers'
    );
    await page.getByTestId('subscriber-save-button').click();
    await createRequest;

    await expect(page.getByRole('heading', { name: 'Erin', exact: true })).toBeVisible();
    await expect(page.getByText('4 active, 1 deactivated')).toBeVisible();
  });

  test('should edit a friend', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit friend: Alice' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByTestId('subscriber-name-input').fill('Alice Updated');
    await page.getByTestId('subscriber-save-button').click();

    await expect(page.getByRole('heading', { name: 'Alice Updated', exact: true })).toBeVisible();
  });

  test('should deactivate a friend (soft delete keeps the card)', async ({ page }) => {
    await page.getByRole('button', { name: 'Deactivate friend: Bob' }).click();
    await expect(page.getByTestId('subscriber-deactivate-dialog')).toBeVisible();

    const deactivateRequest = page.waitForRequest(
      (req) => req.method() === 'DELETE' && /\/subscribers\/2$/.test(new URL(req.url()).pathname)
    );
    await page.getByTestId('subscriber-deactivate-confirm-button').click();
    await deactivateRequest;

    // Soft delete: Bob is still listed, but the counts shift
    await expect(page.getByText('2 active, 2 deactivated')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bob', exact: true })).toBeVisible();
  });

  test('should navigate to the friend detail page via Manage', async ({ page }) => {
    await page.getByRole('link', { name: 'Manage Alice' }).click();

    await expect(page).toHaveURL(/\/subscribers\/1/);
    await expect(page.getByText('Feed Tokens')).toBeVisible();
  });

  test('should show empty state when there are no friends', async ({ page, api }) => {
    api.subscribers = [];
    await page.goto('/subscribers');

    await expect(page.getByText('No friends yet')).toBeVisible();
  });
});
