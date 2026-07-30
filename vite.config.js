import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function wikiContentPlugin() {
  const VIRTUAL_ID = 'virtual:wiki-content';
  const RESOLVED = '\0' + VIRTUAL_ID;
  return {
    name: 'wiki-content',
    resolveId(id) { if (id === VIRTUAL_ID) return RESOLVED; },
    load(id) {
      if (id === RESOLVED) {
        const dir = path.resolve(__dirname, 'src/wiki-content');
        let files = [];
        try { files = fs.readdirSync(dir).filter(f => f.endsWith('.md')); } catch {}
        const pages = {};
        for (const file of files) {
          pages[`/src/wiki-content/${file}`] = fs.readFileSync(path.join(dir, file), 'utf-8');
        }
        return `const data = ${JSON.stringify(pages)};\nexport default data;`;
      }
    },
  };
}

function fileProtocolPlugin() {
  return {
    name: 'file-protocol',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(/type="module"/g, 'defer').replace(/\scrossorigin(?:="[^"]*")?/g, '');
      },
    },
  };
}

export default defineConfig({
  plugins: [svelte(), wikiContentPlugin(), fileProtocolPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true, manualChunks: undefined },
    },
  },
});
