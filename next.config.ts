import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import withSerwistInit from '@serwist/next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // Use empty turbopack config to allow Turbopack while having webpack plugins (Serwist)
  // Serwist uses webpack for service worker generation
  turbopack: {},
  async headers() {
    // Get API URL from environment variable or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // 'unsafe-eval' is only required by the Next.js dev tooling (HMR/overlay);
    // strip it from production CSP to reduce the XSS surface.
    const isProduction = process.env.NODE_ENV === 'production';

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            // Single source of truth for CSP (M-1). The previously unused
            // src/config/security.config.ts duplicate was removed to avoid drift.
            //
            // - 'unsafe-inline' stays: Next.js injects an inline bootstrap script;
            //   nonce plumbing is overkill for a single-user dashboard.
            // - 'unsafe-eval' is only needed by the Next.js dev overlay / HMR, so
            //   it is dropped from production builds to shrink the XSS surface.
            // - object-src/base-uri/form-action lock down plugin, <base>, and form
            //   hijacking vectors that default-src does not cover.
            value: [
              "default-src 'self'",
              isProduction
                ? "script-src 'self' 'unsafe-inline'"
                : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              `connect-src 'self' ${apiUrl}`,
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withSerwist(nextConfig));
