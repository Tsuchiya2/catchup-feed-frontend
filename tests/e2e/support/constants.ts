/**
 * Shared constants between playwright.config.ts and the e2e support code.
 */

/**
 * Port for the Next.js dev server under test. Dedicated port so a manually
 * started `npm run dev` on 3000 (with a real NEXT_PUBLIC_API_URL) is never
 * accidentally reused.
 */
export const APP_PORT = 3100;

/**
 * Dead endpoint the app is pointed at via NEXT_PUBLIC_API_URL; nothing
 * listens there and every request to it is intercepted by ApiMock.
 */
export const MOCK_API_URL = 'http://127.0.0.1:9010';
