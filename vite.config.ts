import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

function normalizeBasePath(value: string) {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

/** GitHub Pages has no SPA rewrite support, so deep links are served this app shell. */
function githubPagesSpaFallback() {
  let outDir = 'dist';

  return {
    name: 'github-pages-spa-fallback',
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
  const base = normalizeBasePath(
    env.VITE_APP_BASE_PATH || (env.GITHUB_ACTIONS === 'true' ? '/gap-tool/' : '/'),
  );

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      githubPagesSpaFallback(),
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
