import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.GITHUB_ACTIONS === 'true' ? '/gap-tool/' : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Inject the SW registration script automatically into index.html.
      registerType: 'prompt',

      // Only include assets that actually exist in /public.
      includeAssets: ['favicon.svg', 'favicon.png', 'pwa-icon.png', 'northstar-logo.svg'],

      // Vite base path must be forwarded so SW scope is correct on GitHub Pages.
      base,

      manifest: false, // We manage manifest.json ourselves in /public.

      workbox: {
        // The app shell (index.html) always comes from the network first so
        // that navigating to any route loads the latest shell, then the cached
        // precached assets load instantly.
        navigateFallback: 'index.html',

        // Precache everything emitted by the build: JS chunks, CSS, fonts, SVGs.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],

        // Runtime cache strategies ─────────────────────────────────────────────
        runtimeCaching: [
          {
            // Fonts from Google or self-hosted: cache-first, long TTL.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // Skip Vite dev-server URLs so local HMR is unaffected.
        navigateFallbackDenylist: [/^\/api\//],
      },

      devOptions: {
        // Disabled in dev — no need to run a real SW locally.
        // Enabling it generates dev-dist/ and can interfere with HMR.
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
          'vendor-ui': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
        },
      },
    },
  },
});
