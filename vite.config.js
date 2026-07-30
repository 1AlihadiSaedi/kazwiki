import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/**
 * Custom plugin: replaces type="module" with defer and removes crossorigin
 * so the built site works when opened directly from file:// (no server).
 * "defer" ensures the script runs after DOM is parsed → #app exists.
 */
function fileProtocolPlugin() {
  return {
    name: 'file-protocol',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replace(/type="module"/g, 'defer')
          .replace(/\scrossorigin(?:="[^"]*")?/g, '');
      }
    }
  };
}

export default defineConfig({
  plugins: [svelte(), fileProtocolPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        manualChunks: undefined
      }
    }
  }
});
