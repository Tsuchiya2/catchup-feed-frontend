/**
 * E2E auth helpers.
 *
 * The app's auth is a JWT stored in localStorage (API client) plus a
 * `catchup_feed_auth_token` cookie (route-protection proxy). The proxy only
 * decodes the token and checks `exp` — it never verifies the signature
 * (verification is the backend's job, and the backend is fully mocked in
 * e2e) — so a locally minted unsigned JWT is enough to authenticate.
 */
import type { BrowserContext } from '@playwright/test';

/** Cookie read by src/proxy.ts and localStorage key read by TokenManager. */
export const AUTH_TOKEN_KEY = 'catchup_feed_auth_token';

/** Credentials used by login-flow specs (accepted by the mocked /auth/token). */
export const TEST_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'correct-password',
};

function base64url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/**
 * Mint a structurally valid (but unsigned) JWT.
 *
 * @param expiresInSeconds - Offset from now for the `exp` claim.
 *   Negative = already expired.
 */
export function makeMockJwt(expiresInSeconds = 60 * 60): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'admin',
    email: TEST_CREDENTIALS.email,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  return `${base64url(header)}.${base64url(payload)}.e2e-mock-signature`;
}

/**
 * Authenticate the browser context before any page load:
 * - cookie for the route-protection proxy
 * - localStorage token for the API client (Authorization header)
 *
 * @returns the minted JWT
 */
export async function authenticate(context: BrowserContext, baseURL: string): Promise<string> {
  const token = makeMockJwt();
  await context.addCookies([{ name: AUTH_TOKEN_KEY, value: token, url: baseURL }]);
  await context.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    [AUTH_TOKEN_KEY, token] as const
  );
  return token;
}
