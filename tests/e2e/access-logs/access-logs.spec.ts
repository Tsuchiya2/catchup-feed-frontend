/**
 * Access log screen: per-friend summary with neglect detection plus a
 * filterable timeline. The neglect badges are the point of the screen —
 * the project goal is feedback, so silent friends must stand out.
 */
import { test, expect } from '../support/test';

test.describe('Access Logs', () => {
  test.beforeEach(async ({ page, authenticated: _auth }) => {
    await page.goto('/access-logs');
    await expect(page.getByRole('heading', { name: 'アクセスログ' })).toBeVisible();
  });

  test('should show the per-friend summary with neglect badges', async ({ page }) => {
    const table = page.getByRole('table', { name: '友人ごとのアクセス集計' });
    await expect(table).toBeVisible();

    // Every neglect level is represented in the mock data
    await expect(table.getByText('未アクセス')).toBeVisible(); // Dave
    await expect(table.getByText('25日 放置')).toBeVisible(); // Bob (>= 21d alert)
    await expect(table.getByText('1日前').first()).toBeVisible(); // Alice (ok)
    await expect(table.getByText('無効化済')).toBeVisible(); // Carol

    // Attention sorting: never > alert > ok > deactivated
    const rows = table.locator('tbody tr');
    await expect(rows.nth(0)).toContainText('Dave'); // never accessed
    await expect(rows.nth(1)).toContainText('Bob'); // 25d silent
    await expect(rows.nth(2)).toContainText('Alice'); // ok
    await expect(rows.nth(3)).toContainText('Carol'); // deactivated
  });

  test('should show the chronological timeline', async ({ page }) => {
    const timeline = page.getByRole('list', { name: 'アクセスログのタイムライン' });
    await expect(timeline).toBeVisible();

    await expect(timeline.getByText(/第42号をダウンロード/)).toBeVisible();
    await expect(timeline.getByText('フィードを取得').first()).toBeVisible();
    await expect(timeline.getByText('Alice').first()).toBeVisible();
    await expect(timeline.getByText('Bob').first()).toBeVisible();
  });

  test('should filter the timeline by friend via the select', async ({ page }) => {
    const filterRequest = page.waitForRequest(
      (req) => req.url().includes('/access-logs') && req.url().includes('subscriber_id=2')
    );
    await page.getByLabel('タイムラインを友人で絞り込む').selectOption('2');
    await filterRequest;

    await expect(page).toHaveURL(/subscriber=2/);
    const timeline = page.getByRole('list', { name: 'アクセスログのタイムライン' });
    await expect(timeline.getByText('Bob').first()).toBeVisible();
    await expect(timeline.getByText('Alice')).toHaveCount(0);
  });

  test('should filter the timeline by clicking a summary row', async ({ page }) => {
    await page.getByTestId('summary-row-1').click();

    await expect(page).toHaveURL(/subscriber=1/);
    const timeline = page.getByRole('list', { name: 'アクセスログのタイムライン' });
    await expect(timeline.getByText('Alice').first()).toBeVisible();
    await expect(timeline.getByText('Bob')).toHaveCount(0);
  });

  test('should show empty messages when there is no data', async ({ page, api }) => {
    api.accessLogs = [];
    api.accessLogSummary = [];
    await page.goto('/access-logs');

    await expect(page.getByText('友人はまだ登録されていません', { exact: false })).toBeVisible();
    await expect(page.getByText('アクセスはまだ記録されていません。')).toBeVisible();
  });
});
