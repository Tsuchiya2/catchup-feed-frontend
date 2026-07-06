import { defineConfig, devices } from '@playwright/test';
import { APP_PORT, MOCK_API_URL } from './tests/e2e/support/constants';

/**
 * Playwright E2E configuration.
 *
 * Right-sized for a single-admin dashboard (CLAUDE.md):
 * - chromium only
 * - the backend API is never contacted: NEXT_PUBLIC_API_URL points at a
 *   dead port and every spec installs route-interception mocks
 *   (tests/e2e/support/api-mock.ts). Tests are deterministic and run
 *   fully offline.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']]
    : [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${APP_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${APP_PORT}`,
    url: `http://localhost:${APP_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
    env: {
      // Dead port: nothing listens here. Any request that escapes the
      // route mocks fails fast instead of leaking to a real backend.
      NEXT_PUBLIC_API_URL: MOCK_API_URL,
    },
  },
});
