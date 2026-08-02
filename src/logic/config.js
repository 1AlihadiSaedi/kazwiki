const CK = 'emerald-wiki-config';
const CREDS_FILE = './.data/390eb3053a827f81.json';

let cached = null;

export async function isInstalled() {
  if (cached !== null) return cached;
  try {
    const res = await fetch(CREDS_FILE);
    if (!res.ok) { cached = false; return false; }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) { cached = false; return false; }
    const data = await res.json();
    cached = data?.ph?.length > 0;
    return cached;
  } catch {
    cached = false;
    return false;
  }
}

export function getSiteConfig() {
  try {
    const raw = localStorage.getItem(CK);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveSiteConfig({ username, passwordHash, displayName, defaultLanguage, languages, homePage, title }) {
  const cfg = {
    admin: { username, displayName, passwordHash },
    site: { defaultLanguage: defaultLanguage || 'fa', languages: languages || ['fa', 'en'], homePage: homePage || 'home', title: title || { fa: 'ویکی زمردین', en: 'Emerald Wiki' } },
    installedAt: new Date().toISOString()
  };
  localStorage.setItem(CK, JSON.stringify(cfg));
  return cfg;
}
