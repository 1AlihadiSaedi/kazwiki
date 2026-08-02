const CK = 'emerald-wiki-config';

export async function isInstalled() {
  if (typeof window !== 'undefined') {
    const ec = window.__EMERALD_CONFIG__;
    if (ec?.admin?.usernameHash) return true;
  }
  return false;
}

export async function getSiteConfig() {
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
    await fetch('/api/config', {
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
