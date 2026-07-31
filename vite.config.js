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
  let srcConfig = {};

  return {
    name: 'emit-files',
    configResolved() {
      try {
        const p = path.resolve(__dirname, 'src/config.js');
        const code = fs.readFileSync(p, 'utf-8');
        const extract = (name) => {
          const re = new RegExp(`export const ${name} = (.+?);`, 's');
          const m = code.match(re);
          if (!m) return null;
          try { return eval('(' + m[1] + ')'); } catch { return null; }
        };
        srcConfig.ADMIN_USERNAME = extract('ADMIN_USERNAME') || 'root';
        srcConfig.ADMIN_DISPLAY_NAME = extract('ADMIN_DISPLAY_NAME') || 'Saedi';
        srcConfig.ADMIN_PASSWORD = extract('ADMIN_PASSWORD') || 'RootRootRoot';
        srcConfig.DEFAULT_LANGUAGE = extract('DEFAULT_LANGUAGE') || 'fa';
        srcConfig.LANGUAGES = extract('LANGUAGES') || ['fa', 'en'];
        srcConfig.HOME_PAGE = extract('HOME_PAGE') || 'home';
        srcConfig.SITE_TITLE = extract('SITE_TITLE') || { fa: 'ویکی زمردین', en: 'Emerald Wiki' };
      } catch {}
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

      const passwordHash = srcConfig.ADMIN_PASSWORD
        ? crypto.createHash('sha256').update(srcConfig.ADMIN_PASSWORD).digest('hex')
        : '';

      const cfg = {
        admin: { username: srcConfig.ADMIN_USERNAME, passwordHash },
        defaultLanguage: srcConfig.DEFAULT_LANGUAGE,
        languages: srcConfig.LANGUAGES,
        homePage: srcConfig.HOME_PAGE,
        title: srcConfig.SITE_TITLE,
      };

      fs.writeFileSync(path.join(dist, 'config.js'),
        `(function(){window.__EMERALD_CONFIG__=${JSON.stringify(cfg)};})();`);

      const indexPath = path.join(dist, 'index.html');
      let html = fs.readFileSync(indexPath, 'utf-8');
      html = html.replace('</head>', '  <script src="./config.js" defer></script>\n  </head>');
      fs.writeFileSync(indexPath, html);

      console.log(`  ✅ dist/config.js   (password → SHA‑256 hash)`);
      console.log(`  ✅ dist/pages/      (${files.length} .md files)`);
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
