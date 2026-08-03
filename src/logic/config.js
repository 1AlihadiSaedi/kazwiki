const CK = 'emerald-wiki-config';
const API_BASE = '';

// isInstalled: single source of truth — ask the server
export async function isInstalled() {
  try {
    const res = await fetch(`${API_BASE}/api/is-installed`, { cache: 'no-store' });
    if (res.ok) {
      const { installed } = await res.json();
      return !!installed;
    }
  } catch {}
  return false;
}

// getSiteConfig: get the user's site configuration
// Prefer server API (has actual user config), fallback to embedded
export async function getSiteConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/config`, { cache: 'no-store' });
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('json')) {
        const cfg = await res.json();
        if (cfg && cfg.defaultLanguage) return cfg;
      }
    }
  } catch {}
  if (typeof window !== 'undefined' && window.__EMERALD_CONFIG__) {
    return window.__EMERALD_CONFIG__;
  }
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
  try {
    await fetch(`${API_BASE}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch {}
  try {
    const raw = localStorage.getItem(CK);
    if (raw) {
      const cfg = JSON.parse(raw);
      const site = cfg.site || cfg;
      Object.assign(site, updates);
      if (cfg.site) cfg.site = site;
      localStorage.setItem(CK, JSON.stringify(cfg));
    }
  } catch {}
}
