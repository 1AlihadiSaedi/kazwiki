const CK = 'emerald-wiki-config';
const CREDS_URL = '/.data/390eb3053a827f81.json';
const CONFIG_API = '/api/config';

export async function isInstalled() {
  try {
    const res = await fetch(CREDS_URL, { cache: 'no-store' });
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) return false;
    const data = await res.json();
    return data?.ph?.length > 0;
  } catch {
    return false;
  }
}

export async function getSiteConfig() {
  try {
    const res = await fetch(CONFIG_API, { cache: 'no-store' });
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('json')) {
        const cfg = await res.json();
        if (cfg && cfg.defaultLanguage) return cfg;
      }
    }
  } catch {}
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

export async function updateSiteConfig(updates) {
  const cfg = await getSiteConfig();
  if (!cfg) return null;
  const site = cfg.site || cfg;
  Object.assign(site, updates);
  if (cfg.site) {
    cfg.site = site;
    localStorage.setItem(CK, JSON.stringify(cfg));
  } else {
    localStorage.setItem(CK, JSON.stringify(site));
  }

  try {
    await fetch(CONFIG_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch {}

  return site;
}
