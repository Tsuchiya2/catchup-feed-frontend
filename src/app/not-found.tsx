import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

/**
 * Not Found Page (404)
 *
 * Displayed when a route doesn't exist.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        {/* 404 Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Search className="h-8 w-8" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-2 text-6xl font-bold text-muted-foreground">404</div>

        {/* Error Message */}
        <h1 className="mb-2 text-2xl font-bold">Page Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Button */}
        <Button asChild>
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
