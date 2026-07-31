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

      let preConfig = {};
      try {
        const mod = await import(path.resolve(__dirname, 'config.js'));
        preConfig = mod.default || mod;
      } catch (e) {
        console.warn('  ⚠️  config.js not found — using defaults');
      }

      const passwordHash = preConfig?.admin?.password
        ? crypto.createHash('sha256').update(preConfig.admin.password).digest('hex')
        : '';

      const publicConfig = {
        admin: { email: preConfig?.admin?.email || '', passwordHash },
        defaultLanguage: preConfig?.defaultLanguage || 'fa',
        languages: preConfig?.languages || ['fa', 'en'],
        homePage: preConfig?.homePage || 'home',
        title: preConfig?.title || { fa: 'ویکی زمردین', en: 'Emerald Wiki' },
        description: preConfig?.description || { fa: '', en: '' },
        supabase: preConfig?.supabase || { url: '', anonKey: '' },
      };

      fs.writeFileSync(
        path.join(dist, 'config.js'),
        `(function(){window.__EMERALD_CONFIG__=${JSON.stringify(publicConfig)};})();`
      );

      console.log(`  ✅ dist/config.js  (SHA‑256 hashed admin password)`);
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
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true, manualChunks: undefined },
    },
  },
});
