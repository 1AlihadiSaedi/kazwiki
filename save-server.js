import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.resolve(__dirname, 'src/wiki-content');
const dataDir = path.resolve(__dirname, '.data');
const PORT = 5174;

// Ensure .data directory exists
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return null; }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function sendJson(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve(null); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // /api/install create credentials & site-config on first install
  if (req.method === 'POST' && req.url === '/api/install') {
    const body = await readBody(req);
    if (!body || !body.ph || !body.uh) {
      return sendJson(res, 400, { ok: false, error: 'Missing credentials' });
    }
    const credsFile = path.join(dataDir, '390eb3053a827f81.json');
    writeJson(credsFile, {
      ph: body.ph,
      uh: body.uh,
      dn: body.dn || '',
      installedAt: new Date().toISOString()
    });

    const siteFile = path.join(dataDir, 'site-config.json');
    writeJson(siteFile, {
      defaultLanguage: body.defaultLanguage || 'en',
      languages: body.languages || ['fa', 'en'],
      homePage: body.homePage || 'home',
      title: body.title || { en: 'Emerald Wiki', fa: 'ویکی زمردین' },
      icon: body.icon || '',
      theme: body.theme || 'dark',
      installedAt: new Date().toISOString()
    });

    console.log('  Install complete:', body.dn || body.uh);
    return sendJson(res, 200, { ok: true });
  }

  // /api/config read / update site config
  if (req.url === '/api/config') {
    const siteFile = path.join(dataDir, 'site-config.json');

    if (req.method === 'GET') {
      const cfg = readJson(siteFile);
      return sendJson(res, cfg ? 200 : 404, cfg || { ok: false });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      if (!body) return sendJson(res, 400, { ok: false, error: 'Invalid body' });

      const existing = readJson(siteFile) || {};
      const merged = { ...existing, ...body, updatedAt: new Date().toISOString() };
      writeJson(siteFile, merged);
      console.log('  Config updated');
      return sendJson(res, 200, { ok: true, config: merged });
    }
  }

  // /save save a wiki page
  if (req.method === 'POST' && req.url === '/save') {
    const body = await readBody(req);
    if (!body || !body.slug || !body.lang || body.content == null) {
      return sendJson(res, 400, { ok: false, error: 'Missing fields' });
    }
    const safe = body.slug.replace(/[^a-zA-Z0-9_-]/g, '');
    const file = path.join(contentDir, `${safe}.${body.lang}.md`);
    fs.writeFileSync(file, body.content, 'utf-8');
    const verified = fs.readFileSync(file, 'utf-8') === body.content;
    console.log(`  Saved: ${safe}.${body.lang}.md  (${body.content.length}B, verified=${verified})`);
    return sendJson(res, 200, { ok: true, file: `${safe}.${body.lang}.md`, verified });
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    return sendJson(res, 200, { ok: true, status: 'running' });
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => console.log(`  Save server:  http://localhost:${PORT}
     /api/install  /api/config  /save`));
process.on('SIGTERM', () => { server.close(); process.exit(0); });
process.on('SIGINT', () => { server.close(); process.exit(0); });
