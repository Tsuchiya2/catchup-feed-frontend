'use client';

/**
 * PWA Install Prompt Component
 *
 * Displays a custom install prompt when the browser's beforeinstallprompt event fires.
 * Allows users to install the PWA with a single click.
 *
 * Features:
 * - Listens for beforeinstallprompt event
 * - Shows custom install UI
 * - Persists dismissal state in localStorage
 * - Accessible with keyboard navigation
 *
 * @module components/common/PWAInstallPrompt
 */

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY = 'pwa-install-prompt-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Helper to safely access localStorage
 */
function safeLocalStorage() {
  try {
    return {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
    };
  } catch {
    // localStorage unavailable (private browsing, etc.)
    return {
      getItem: () => null,
      setItem: () => {},
    };
  }
}

/**
 * PWA Install Prompt Component
 *
 * Shows a prompt to install the app when the browser supports PWA installation
 * and the user hasn't dismissed it recently.
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const storage = safeLocalStorage();

    // Check if the prompt was dismissed recently
    const dismissedAt = storage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      if (now - dismissedTime < DISMISS_DURATION) {
        return; // Don't show prompt if dismissed recently
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();

      // Save the event so it can be triggered later
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    // Save dismissal time to localStorage
    const storage = safeLocalStorage();
    storage.setItem(STORAGE_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
    >
      <div className="relative border border-console-line-3 bg-console-panel p-4">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 p-1 text-console-ink-weak transition-colors duration-[120ms] ease-out hover:text-console-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
          aria-label="インストール案内を閉じる"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="pr-6">
          <div className="mb-2 flex items-center gap-2">
            <Download className="h-4 w-4 text-console-cyan" aria-hidden="true" />
            <h3 id="pwa-install-title" className="text-[13.5px] font-bold text-console-ink">
              Catchup Feed をインストール
            </h3>
          </div>

          <p
            id="pwa-install-description"
            className="mb-4 text-[12.5px] leading-[1.9] text-console-ink-weak"
          >
            ホーム画面に追加すると、オフラインでも素早く開けるようになります。
          </p>

          {/* Install button */}
          <button
            onClick={handleInstallClick}
            className="w-full bg-console-sel-bg px-4 py-2 text-[13px] font-bold text-console-sel-ink transition-colors duration-[120ms] ease-out hover:bg-console-sel-hover focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-console-cyan"
            type="button"
          >
            インストール
          </button>
        </div>
      </div>
    </div>
  );
}
