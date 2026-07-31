import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
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

function separateFilesPlugin() {
  return {
    name: 'separate-files',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(
          '</head>',
          '  <script src="./config.js" defer></script>\n  <script src="./pages.js" defer></script>\n  </head>'
        );
      },
    },
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist');

      // pages.js
      const mdDir = path.resolve(__dirname, 'src/wiki-content');
      let files = [];
      try { files = fs.readdirSync(mdDir).filter(f => f.endsWith('.md')); } catch {}
      const pages = {};
      for (const f of files)
        pages[`/src/wiki-content/${f}`] = fs.readFileSync(path.join(mdDir, f), 'utf-8');
      fs.writeFileSync(
        path.join(dist, 'pages.js'),
        `(function(){window.__EMERALD_PAGES__=${JSON.stringify(pages)};})();`
      );

      // config.js
      let SUPABASE_URL = '', SUPABASE_ANON_KEY = '';
      try {
        const env = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf-8');
        const u = env.match(/VITE_SUPABASE_URL=(.+)/);
        const k = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
        if (u) SUPABASE_URL = u[1].trim();
        if (k) SUPABASE_ANON_KEY = k[1].trim();
      } catch {}
      fs.writeFileSync(
        path.join(dist, 'config.js'),
        `(function(){window.__EMERALD_CONFIG__=${JSON.stringify({SUPABASE_URL,SUPABASE_ANON_KEY})};})();`
      );

      console.log('  ✅ Emitted: dist/config.js  dist/pages.js');
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
  plugins: [svelte(), wikiContentPlugin(), separateFilesPlugin(), fileProtocolPlugin()],
  base: './',
  build: {
    outDir: 'dist', assetsDir: 'assets', cssCodeSplit: false, minify: 'esbuild',
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true, manualChunks: undefined },
    },
  },
});
