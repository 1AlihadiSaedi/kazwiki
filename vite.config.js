import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function wikiContentPlugin() {
  const V = 'virtual:wiki-content', R = '\0' + V;
  return {
    name: 'wiki-content',
    resolveId(id) { if (id === V) return R; },
    load(id) {
      if (id === R) {
        const d = path.resolve(__dirname, 'src/wiki-content');
        let files = [];
        try { files = fs.readdirSync(d).filter(f => f.endsWith('.md')); } catch {}
        const pages = {};
        for (const f of files)
          pages[`/src/wiki-content/${f}`] = fs.readFileSync(path.join(d, f), 'utf-8');
        return `const data=${JSON.stringify(pages)};export default data;`;
      }
    },
  };
}

function emitFilesPlugin() {
  return {
    name: 'emit-files',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace('</head>', '  <script src="./config.js" defer></script>\n  </head>');
      },
    },
    async closeBundle() {
      const dist = path.resolve(__dirname, 'dist');
      const pagesDir = path.join(dist, 'pages');
      fs.mkdirSync(pagesDir, { recursive: true });

      const srcDir = path.resolve(__dirname, 'src/wiki-content');
      let files = [];
      try { files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md')); } catch {}
      for (const f of files)
        fs.copyFileSync(path.join(srcDir, f), path.join(pagesDir, f));

      let c = {};
      try { const m = await import(path.resolve(__dirname, 'src/config.js')); c = m; } catch {}

      const passwordHash = c.ADMIN_PASSWORD
        ? crypto.createHash('sha256').update(c.ADMIN_PASSWORD).digest('hex')
        : '';

      const cfg = {
        admin: { email: c.ADMIN_EMAIL || 'root@root.com', passwordHash },
        defaultLanguage: c.DEFAULT_LANGUAGE || 'fa',
        languages: c.LANGUAGES || ['fa', 'en'],
        homePage: c.HOME_PAGE || 'home',
        title: c.SITE_TITLE || { fa: 'ویکی زمردین', en: 'Emerald Wiki' },
        description: c.SITE_DESCRIPTION || { fa: '', en: '' },
      };

      fs.writeFileSync(path.join(dist, 'config.js'),
        `(function(){window.__EMERALD_CONFIG__=${JSON.stringify(cfg)};})();`);

      console.log(`  ✅ dist/config.js  (admin password → SHA‑256 hash)`);
      console.log(`  ✅ dist/pages/     (${files.length} .md files)`);
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
  plugins: [svelte(), wikiContentPlugin(), emitFilesPlugin(), fileProtocolPlugin()],
  base: './',
  build: {
    outDir: 'dist', assetsDir: 'assets', cssCodeSplit: false, minify: 'esbuild',
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true, manualChunks: undefined } },
  },
});
