import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, 'src/wiki-content');

function wikiContentPlugin() {
  const V = 'virtual:wiki-content', R = '\0' + V;
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
      const http = server.httpServer;
      const _emit = http.emit.bind(http);
      http.emit = function(event, ...args) {
        if (event === 'request') {
          const [req, res] = args;
          if (req.method === 'POST' && req.url === '/api/save') {
            let body = '';
            req.on('data', c => body += c);
            req.on('end', () => {
              try {
                const { slug, lang, content } = JSON.parse(body);
                const safe = slug.replace(/[^a-zA-Z0-9_-]/g, '');
                fs.writeFileSync(path.join(contentDir, `${safe}.${lang}.md`), content, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, file: `${safe}.${lang}.md` }));
              } catch (e) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: e.message }));
              }
            });
            return true;
          }
        }
        return _emit(event, ...args);
      };
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
      let files = [];
      try { files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md')); } catch {}
      for (const f of files) fs.copyFileSync(path.join(contentDir, f), path.join(pagesDir, f));
      const hash = cfg.ADMIN_PASSWORD ? crypto.createHash('sha256').update(cfg.ADMIN_PASSWORD).digest('hex') : '';
      const out = {
        admin: { username: cfg.ADMIN_USERNAME || 'root', passwordHash: hash },
        defaultLanguage: cfg.DEFAULT_LANGUAGE || 'fa', languages: cfg.LANGUAGES || ['fa','en'],
        homePage: cfg.HOME_PAGE || 'home', title: cfg.SITE_TITLE || { fa:'ویکی زمردین', en:'Emerald Wiki' },
      };
      fs.writeFileSync(path.join(dist, 'config.js'), `(function(){window.__EMERALD_CONFIG__=${JSON.stringify(out)};})();`);
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
  return { name:'file-protocol', transformIndexHtml:{ order:'post', handler(h){ return h.replace(/type="module"/g,'defer').replace(/\scrossorigin(?:="[^"]*")?/g,''); } } };
}

export default defineConfig({
  plugins: [svelte(), wikiContentPlugin(), emitFilesPlugin(), fileProtocolPlugin()],
  base: './',
  build: { outDir:'dist', assetsDir:'assets', cssCodeSplit:false, minify:'esbuild',
    rollupOptions: { output: { format:'iife', inlineDynamicImports:true, manualChunks:undefined } },
  },
});
