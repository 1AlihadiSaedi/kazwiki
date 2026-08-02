const CK = 'emerald-wiki-config';
const CREDS_FILE = './.data/390eb3053a827f81.json';

export async function isInstalled() {
  try {
    const res = await fetch(CREDS_FILE, { cache: 'no-store' });
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) return false;
    const data = await res.json();
    return data?.ph?.length > 0;
  } catch {
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

export function saveSiteConfig({ username, passwordHash, displayName, defaultLanguage, languages, homePage, title, icon, theme }) {
  const cfg = {
    admin: { username, displayName, passwordHash },
    site: {
      defaultLanguage: defaultLanguage || 'en',
      languages: languages || ['fa', 'en'],
      homePage: homePage || 'home',
      title: title || { en: 'Emerald Wiki', fa: 'ویکی زمردین' },
      icon: icon || '',
      theme: theme || 'dark',
    },
    installedAt: new Date().toISOString()
  };
  localStorage.setItem(CK, JSON.stringify(cfg));
  return cfg;
}

export function updateSiteConfig(updates) {
  const cfg = getSiteConfig();
  if (!cfg) return null;
  if (!cfg.site) cfg.site = {};
  Object.assign(cfg.site, updates);
  localStorage.setItem(CK, JSON.stringify(cfg));
  return cfg;
}
