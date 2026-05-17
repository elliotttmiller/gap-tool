import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Desktop-only PWA update notification.
 *
 * `vite-plugin-pwa` (Workbox) detects when a new service worker has finished
 * installing in the background. This banner appears at the top of the viewport,
 * above the app header, so advisors are clearly prompted to reload and pick up
 * the latest build.
 *
 * The banner is dismissed either by clicking "Update now" (which reloads) or
 * the × close button (which defers until the next natural page load).
 */
export function PWAUpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Poll every 60 minutes so long-running sessions still receive updates.
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-between gap-4 bg-brand-600 px-6 py-3 shadow-lg"
    >
      <p className="text-sm font-medium text-white">
        A new version of NorthStar is available.
      </p>

      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex items-center gap-1.5 rounded-md bg-white/20 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/30"
        >
          <RefreshCw className="h-4 w-4" />
          Update now
        </button>

        <button
          onClick={() => setNeedRefresh(false)}
          aria-label="Dismiss update notification"
          className="rounded-md p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
