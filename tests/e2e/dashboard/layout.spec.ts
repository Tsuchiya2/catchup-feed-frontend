import { test, expect } from '../support/test';

/**
 * Viewport-dependent layout regressions on 概況.
 *
 * `flex-1` on a container that stretches to the viewport has produced the same
 * regression twice: D-38 (記事詳細 footer) and D-39 (this grid — dropping to
 * two panels made the grid two auto rows, which `align-content: stretch` then
 * inflated, stranding ~123px between 明朝の候補 and 受信状況 at 390px). Both
 * fixes were "make `flex-1` desk-only", and neither regression was caught by a
 * test: no other e2e in this repo sets a viewport, so nothing exercised the
 * < 640px single-column path that the user actually reads on their phone.
 *
 * This spec closes that gap. It asserts the panels are separated by the grid's
 * own `gap-[26px]` and nothing more — a stretched row shows up here as a gap
 * several times too large.
 */

/** The 本文 grid's `gap-[26px]`; the only space that belongs between panels. */
const PANEL_GAP_PX = 26;

/** iPhone 14/15 logical viewport — the primary reading device (CLAUDE.md). */
const PHONE = { width: 390, height: 844 };

test.describe('Dashboard layout', () => {
  test('separates the stacked panels by exactly the grid gap at 390px', async ({
    page,
    authenticated: _auth,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/dashboard');

    const upcoming = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: '明朝の候補' }) });
    const reception = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: '受信状況' }) });

    await expect(upcoming).toBeVisible();
    await expect(reception).toBeVisible();

    const upcomingBox = await upcoming.boundingBox();
    const receptionBox = await reception.boundingBox();
    expect(upcomingBox).not.toBeNull();
    expect(receptionBox).not.toBeNull();

    // Single column at this width, so 受信状況 sits below 明朝の候補.
    expect(receptionBox!.y).toBeGreaterThan(upcomingBox!.y);

    const gap = receptionBox!.y - (upcomingBox!.y + upcomingBox!.height);
    // Precision 0 = within half a pixel, so sub-pixel layout rounding cannot
    // flake the test while a stretched row (was 122.88px) still fails loudly.
    expect(gap).toBeCloseTo(PANEL_GAP_PX, 0);
  });

  test('keeps the panels side by side at 1440px', async ({ page, authenticated: _auth }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');

    const upcoming = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: '明朝の候補' }) });
    const reception = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: '受信状況' }) });

    const upcomingBox = await upcoming.boundingBox();
    const receptionBox = await reception.boundingBox();
    expect(upcomingBox).not.toBeNull();
    expect(receptionBox).not.toBeNull();

    // Two columns: the panels share a top edge instead of stacking. This is
    // the half `desk:flex-1` must not change.
    expect(receptionBox!.y).toBeCloseTo(upcomingBox!.y, 0);
    expect(receptionBox!.x).toBeGreaterThan(upcomingBox!.x + upcomingBox!.width);
  });
});
