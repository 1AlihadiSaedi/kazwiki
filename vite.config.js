import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/**
 * Custom plugin: removes type="module" and crossorigin from script tags
 * so the built site works when opened directly from file:// (no server).
 */
function fileProtocolPlugin() {
  return {
    name: 'file-protocol',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replace(/type="module"\s*/g, '')
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