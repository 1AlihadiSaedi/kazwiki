const CK = 'emerald-wiki-config';

export function isInstalled() {
  // Production build: installed flag embedded at build time (LocalSettings.php pattern)
  if (typeof window !== 'undefined' && window.__EMERALD_CONFIG__?.installed === true) return true;
  // Dev mode: localStorage check (set by installer wizard)
  try { if (localStorage.getItem(CK)) return true; } catch {}
  return false;
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
