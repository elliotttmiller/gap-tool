import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function normalizeBasePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

/** Static hosts such as GitHub Pages have no SPA rewrite support, so deep links can use this app shell. */
function spaFallback() {
  let outDir = 'dist';

  return {
    name: 'spa-fallback',
    apply: 'build' as const,
    configResolved(config: { build: { outDir: string } }) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      copyFileSync(path.resolve(outDir, 'index.html'), path.resolve(outDir, '404.html'));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = normalizeBasePath(env.VITE_APP_BASE_PATH || '/');

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      spaFallback(),
      VitePWA({
        // Inject the SW registration script automatically into index.html.
        registerType: 'prompt',

        // Only include assets that actually exist in /public.
        includeAssets: ['favicon.svg', 'favicon.png', 'pwa-icon.png', 'northstar-logo.svg'],

        // Forward the active deployment base so service-worker scope follows
        // the same subdirectory as Vite assets and React Router.
        base,

        manifest: false, // We manage manifest.json ourselves in /public.

        workbox: {
          // The app shell always comes from the network first so navigating to
          // any route loads the latest shell, then precached assets load quickly.
          navigateFallback: 'index.html',

          // Precache everything emitted by the build: JS chunks, CSS, fonts, SVGs.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],

          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],

          navigateFallbackDenylist: [/^\/api\//],
        },

        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-charts': ['recharts'],
            'vendor-ui': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          },
        },
      },
    },
  };
});
