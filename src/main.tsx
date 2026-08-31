import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/light-text-contrast.css';
import './styles/dark-chart-polish.css';
import './styles/financial-projection-chart.css';
import './styles/print-runtime.css';
import './styles/review-ui-corrections.css';
import './styles/client-setup-theme.css';
import './styles/presentation-theme.css';
import { ThemeProvider } from './lib/theme';

// Permanently decommission workers and Workbox caches issued by earlier Gap
// Tool releases. This guard only removes legacy offline-app state scoped to
// this deployment; it never registers a worker or exposes install behavior.
async function removeLegacyOfflineAppState() {
  try {
    if ('serviceWorker' in navigator) {
      const appScope = new URL(import.meta.env.BASE_URL, window.location.origin).href;
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(
        registrations
          .filter((registration) => registration.scope.startsWith(appScope))
          .map((registration) => registration.unregister()),
      );
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.allSettled(
        keys
          .filter((key) => key.startsWith('workbox-') || key.includes('-precache-'))
          .map((key) => caches.delete(key)),
      );
    }
  } catch (error) {
    console.warn('Unable to fully remove legacy offline-app state.', error);
  }
}

void removeLegacyOfflineAppState();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
