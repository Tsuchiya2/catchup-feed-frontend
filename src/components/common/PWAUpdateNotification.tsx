'use client';

/**
 * PWA Update Notification Component
 *
 * Displays a notification when a new version of the PWA is available.
 * Uses Serwist to detect updates and provides a reload button.
 *
 * Features:
 * - Detects service worker updates
 * - Shows notification when update is available
 * - Allows user to reload and apply update
 * - Can be dismissed
 *
 * @module components/common/PWAUpdateNotification
 */

import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * PWA Update Notification Component
 *
 * Shows a notification when a service worker update is available
 * and allows the user to reload the page to apply the update.
 */
export function PWAUpdateNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Only run in browser and when service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let serwist: InstanceType<typeof import('@serwist/window').Serwist> | null = null;

    // Import Serwist Window dynamically
    import('@serwist/window')
      .then(({ Serwist }) => {
        // Check if running in production and PWA is enabled
        if (process.env.NODE_ENV !== 'production') {
          return;
        }

        serwist = new Serwist('/sw.js');

        // Listen for waiting event
        serwist.addEventListener('waiting', (event) => {
          console.log('New service worker is waiting');
          setWaitingWorker(event.sw ?? null);
          setShowNotification(true);
        });

        // Listen for controlling event (new SW has taken control)
        serwist.addEventListener('controlling', () => {
          console.log('New service worker is controlling');
          window.location.reload();
        });

        // Register the service worker
        serwist.register().catch((error) => {
          console.error('Service worker registration failed:', error);
        });
      })
      .catch((error) => {
        console.error('Failed to load Serwist:', error);
      });

    // Also listen for updates using native API as fallback
    const checkForUpdates = () => {
      navigator.serviceWorker
        .getRegistration()
        .then((registration) => {
          if (registration?.waiting) {
            setWaitingWorker(registration.waiting);
            setShowNotification(true);
          }
        })
        .catch((error) => {
          console.error('Failed to check for service worker updates:', error);
        });
    };

    // Check for updates on load
    checkForUpdates();

    // Check for updates every 5 minutes
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      // Note: Serwist event listeners are automatically cleaned up when the
      // service worker is unregistered or replaced
    };
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) {
      return;
    }

    // Tell the waiting service worker to take control immediately
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });

    // The page will reload when the new service worker takes control
    setShowNotification(false);
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96"
      role="alert"
      aria-labelledby="pwa-update-title"
      aria-describedby="pwa-update-description"
    >
      <div className="relative border border-console-line-3 bg-console-panel p-4">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 p-1 text-console-ink-weak transition-colors duration-[120ms] ease-out hover:text-console-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
          aria-label="更新通知を閉じる"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="pr-6">
          <div className="mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-console-cyan" aria-hidden="true" />
            <h3 id="pwa-update-title" className="text-[13.5px] font-bold text-console-ink">
              更新があります
            </h3>
          </div>

          <p
            id="pwa-update-description"
            className="mb-4 text-[12.5px] leading-[1.9] text-console-ink-weak"
          >
            Catchup Feed の新しいバージョンがあります。再読み込みすると最新の状態になります。
          </p>

          {/* Update button */}
          <button
            onClick={handleUpdate}
            className="w-full bg-console-sel-bg px-4 py-2 text-[13px] font-bold text-console-sel-ink transition-colors duration-[120ms] ease-out hover:bg-console-sel-hover focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
            type="button"
          >
            再読み込み
          </button>
        </div>
      </div>
    </div>
  );
}
