import type { Metadata } from 'next';
import { IBM_Plex_Mono, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';
import { PWAUpdateNotification } from '@/components/common/PWAUpdateNotification';
import { FeatureGate } from '@/components/common/FeatureGate';

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

/**
 * Get the base URL for metadata
 * Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > localhost
 */
function getMetadataBase(): URL {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(process.env.NEXT_PUBLIC_APP_URL);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL('http://localhost:3000');
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'Catchup Feed',
  description: '早朝に技術情報を10分間の音声でお届け。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Catchup Feed',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Catchup Feed',
    description: '早朝に技術情報を10分間の音声でお届け。',
    url: 'https://pulse.catchup-feed.com',
    siteName: 'Catchup Feed',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Catchup Feed',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catchup Feed',
    description: '早朝に技術情報を10分間の音声でお届け。',
    images: ['/og-image.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSansJp.variable} ${ibmPlexMono.variable}`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            {/* PWA Components - Only render when PWA feature is enabled */}
            <FeatureGate feature="pwa">
              <PWAInstallPrompt />
              <PWAUpdateNotification />
            </FeatureGate>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
