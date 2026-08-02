const CK = 'emerald-wiki-config';

export function isInstalled() {
  // Simple rule: if build found the hashed creds file → installed
  return typeof window !== 'undefined' && window.__EMERALD_CONFIG__?.installed === true;
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
