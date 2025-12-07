import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileText, Rss, Zap } from 'lucide-react';

/**
 * Landing Page
 *
 * Public homepage that introduces Catchup Feed and provides a link to login.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <Image
              src="/catch-feed-icon.webp"
              alt="Catchup Feed"
              width={64}
              height={64}
              className="rounded-2xl shadow-lg"
            />
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Catchup Feed</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Your personalized news aggregator. Stay updated with the latest articles from your
              favorite sources, all in one place.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Centralized Articles</h3>
              <p className="text-sm text-muted-foreground">
                All your news in one convenient location
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Rss className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Multiple Sources</h3>
              <p className="text-sm text-muted-foreground">
                Aggregate content from various RSS feeds
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Never miss important news from your sources
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Catchup Feed. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
