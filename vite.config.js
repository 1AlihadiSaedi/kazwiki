import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function wikiContentPlugin() {
  const V = 'virtual:wiki-content', R = '\0' + V;
  const contentDir = path.resolve(__dirname, 'src/wiki-content');

  return {
    name: 'wiki-content',
    resolveId(id) { if (id === V) return R; },
    load(id) {
      if (id === R) {
        let files = [];
        try { files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md')); } catch {}
        const pages = {};
        for (const f of files)
          pages[`/src/wiki-content/${f}`] = fs.readFileSync(path.join(contentDir, f), 'utf-8');
        return `const data=${JSON.stringify(pages)};export default data;`;
      }
    },

    configureServer(server) {
      server.middlewares.use('/api/save', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const { slug, lang, content } = JSON.parse(body);
            if (!slug || !lang || content == null) throw new Error('missing fields');
            const safe = slug.replace(/[^a-zA-Z0-9_-]/g, '');
            const file = path.join(contentDir, `${safe}.${lang}.md`);
            fs.writeFileSync(file, content, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, file: `${safe}.${lang}.md` }));
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: e.message }));
          }
        });
      });
    },
  };
}

function emitFilesPlugin() {
  let cfg = {};
  return {
    name: 'emit-files',
    async buildStart() {
      try { cfg = await import(path.resolve(__dirname, 'src/config.js')); } catch {}
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

      const hash = cfg.ADMIN_PASSWORD
        ? crypto.createHash('sha256').update(cfg.ADMIN_PASSWORD).digest('hex') : '';

      const out = {
        admin: { username: cfg.ADMIN_USERNAME || 'root', passwordHash: hash },
        defaultLanguage: cfg.DEFAULT_LANGUAGE || 'fa',
        languages: cfg.LANGUAGES || ['fa', 'en'],
        homePage: cfg.HOME_PAGE || 'home',
        title: cfg.SITE_TITLE || { fa: 'ویکی زمردین', en: 'Emerald Wiki' },
      };

      fs.writeFileSync(path.join(dist, 'config.js'),
        `(function(){window.__EMERALD_CONFIG__=${JSON.stringify(out)};})();`);

      const idx = path.join(dist, 'index.html');
      let html = fs.readFileSync(idx, 'utf-8');
      html = html.replace('</head>', '  <script src="./config.js" defer></script>\n  </head>');
      fs.writeFileSync(idx, html);

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
