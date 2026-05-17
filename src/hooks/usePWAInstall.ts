import { useEffect, useState } from 'react';

/**
 * Captures the browser's `beforeinstallprompt` event so the app can show a
 * custom "Install App" button at the right moment rather than relying on the
 * default browser mini-infobar.
 *
 * Desktop Chromium (Chrome, Edge, Arc, Brave, Opera) fires this event when all
 * PWA installability criteria are met. Safari and Firefox do not; the hook
 * simply returns `canInstall: false` on those browsers.
 *
 * Usage:
 *   const { canInstall, install, installed } = usePWAInstall();
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface UsePWAInstallReturn {
  /** True when the browser has fired `beforeinstallprompt` and the app is
   *  installable but has not yet been installed in this session. */
  canInstall: boolean;
  /** Call this to show the native install dialog. Resolves with the user's
   *  choice ('accepted' | 'dismissed'). No-ops if not installable. */
  install: () => Promise<'accepted' | 'dismissed' | null>;
  /** True after the user accepts the install prompt in this session. */
  installed: boolean;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      // Prevent the default mini-infobar so we control when to show the prompt.
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setDeferredPrompt(null);
      setInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | null> => {
    if (!deferredPrompt) return null;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    if (outcome === 'accepted') setInstalled(true);

    return outcome;
  };

  return {
    canInstall: deferredPrompt !== null && !installed,
    install,
    installed,
  };
}
