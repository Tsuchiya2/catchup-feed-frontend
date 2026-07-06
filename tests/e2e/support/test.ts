/**
 * Shared e2e test harness.
 *
 * - `api`: auto-installed backend mock (route interception; see ApiMock).
 *   Mutate its arrays before the first navigation to change the dataset,
 *   or register `page.route()` in a spec for one-off overrides.
 * - `authenticated`: opt-in fixture that plants a valid mock JWT
 *   (cookie + localStorage) before the page loads.
 */
import { test as base, expect } from '@playwright/test';
import { ApiMock } from './api-mock';
import { authenticate } from './auth';

interface Fixtures {
  api: ApiMock;
  authenticated: void;
}

export const test = base.extend<Fixtures>({
  // Note: Playwright fixture callbacks receive a `use` continuation; it is
  // renamed here to avoid a react-hooks/rules-of-hooks false positive.
  api: [
    async ({ context }, provide) => {
      const api = new ApiMock();
      await api.install(context);
      await provide(api);
    },
    { auto: true },
  ],
  authenticated: async ({ context, baseURL }, provide) => {
    await authenticate(context, baseURL!);
    await provide();
  },
});

export { expect };
