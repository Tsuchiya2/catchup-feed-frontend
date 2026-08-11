/**
 * Friends (subscribers) management: CRUD with soft delete (deactivation).
 */
import { test, expect } from '../support/test';

test.describe('Friends List', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/subscribers');
  });

  test('should list friends with active/deactivated status', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '友人' })).toBeVisible();
    // 3 active (Alice, Bob, Dave), 1 deactivated (Carol)
    await expect(page.getByText('有効 3 名 ／ 無効化 1 名')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Alice', exact: true })).toBeVisible();
    // Carol stays visible after soft delete (history preserved)
    await expect(page.getByRole('heading', { name: 'Carol', exact: true })).toBeVisible();
  });

  test('should add a friend', async ({ page }) => {
    await page.getByRole('button', { name: '友人を追加' }).first().click();
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
    await expect(page.getByText('有効 4 名 ／ 無効化 1 名')).toBeVisible();
  });

  test('should edit a friend', async ({ page }) => {
    await page.getByRole('button', { name: '友人を編集: Alice' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByTestId('subscriber-name-input').fill('Alice Updated');
    await page.getByTestId('subscriber-save-button').click();

    await expect(page.getByRole('heading', { name: 'Alice Updated', exact: true })).toBeVisible();
  });

  test('should deactivate a friend (soft delete keeps the card)', async ({ page }) => {
    await page.getByRole('button', { name: '友人を無効化: Bob' }).click();
    await expect(page.getByTestId('subscriber-deactivate-dialog')).toBeVisible();

    const deactivateRequest = page.waitForRequest(
      (req) => req.method() === 'DELETE' && /\/subscribers\/2$/.test(new URL(req.url()).pathname)
    );
    await page.getByTestId('subscriber-deactivate-confirm-button').click();
    await deactivateRequest;

    // Soft delete: Bob is still listed, but the counts shift
    await expect(page.getByText('有効 2 名 ／ 無効化 2 名')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bob', exact: true })).toBeVisible();
  });

  test('should navigate to the friend detail page via Manage', async ({ page }) => {
    await page.getByRole('link', { name: 'Alice を管理' }).click();

    await expect(page).toHaveURL(/\/subscribers\/1/);
    await expect(page.getByText('フィードトークン')).toBeVisible();
  });

  test('should show empty state when there are no friends', async ({ page, api }) => {
    api.subscribers = [];
    await page.goto('/subscribers');

    await expect(page.getByText('友人はまだいません')).toBeVisible();
  });
});
