import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Social crawlers need absolute URLs for Open Graph images.
 * Uses SITE_URL if provided, otherwise Vercel's production domain, otherwise relative paths.
 */
function siteUrlPlugin(): Plugin {
  const raw = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
  const siteUrl = raw ? (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/$/, '') : '';
  return {
    name: 'diwali-site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrlPlugin()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
  },
});
