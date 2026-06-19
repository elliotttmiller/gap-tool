import { MonitorDown } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

/**
 * Desktop-only PWA install button.
 *
 * Renders a header-style button only when the browser has signalled that the
 * app is installable (`beforeinstallprompt`). Hidden on browsers that do not
 * support the install flow (Firefox, Safari) or after the app has already
 * been installed.
 */
export function InstallPWAButton() {
  const { canInstall, install, installed } = usePWAInstall();
  const [loading, setLoading] = useState(false);

  // Nothing to show when the browser hasn't offered an install prompt or the
  // app is already installed in this session.
  if (!canInstall || installed) return null;

  async function handleInstall() {
    setLoading(true);
    try {
      await install();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleInstall}
      disabled={loading}
      aria-label="Install NorthStar as a desktop app"
      className="flex items-center gap-2 rounded-md px-3 py-2 text-[#94a3b8] transition-colors hover:bg-white/5 hover:text-[#ffffff] disabled:opacity-50"
    >
      <MonitorDown className="h-5 w-5" />
      <span className="text-sm font-medium">{loading ? 'Installing…' : 'Install App'}</span>
    </button>
  );
}
