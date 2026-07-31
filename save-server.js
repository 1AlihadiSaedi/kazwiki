import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, 'src/wiki-content');
const PORT = 5174;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST' || req.url !== '/save') { res.writeHead(404); res.end('Not found'); return; }

  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const { slug, lang, content } = JSON.parse(body);
      if (!slug || !lang || content == null) throw new Error('missing fields');
      const safe = slug.replace(/[^a-zA-Z0-9_-]/g, '');
      const file = path.join(contentDir, `${safe}.${lang}.md`);
      fs.writeFileSync(file, content, 'utf-8');
      const verified = fs.readFileSync(file, 'utf-8') === content;
      console.log(`  💾 Saved: ${safe}.${lang}.md  (${content.length}B, verified=${verified})`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, file: `${safe}.${lang}.md`, verified }));
    } catch (e) {
      console.error('  ❌ Save error:', e.message);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  });
});

server.listen(PORT, () => console.log(`  💾 Save server:  http://localhost:${PORT}/save`));
process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT', () => { server.close(); process.exit(0); });
