const CK = 'emerald-wiki-config';

export function isInstalled() {
  try { if (localStorage.getItem(CK)) return true; } catch {}
  if (typeof window !== 'undefined' && window.__EMERALD_CONFIG__?.admin?.passwordHash && window.__EMERALD_CONFIG__.admin.passwordHash.length > 0) {
    return true;
  }
  return false;
}

export function getSiteConfig() {
  try { const raw = localStorage.getItem(CK); if (raw) return JSON.parse(raw); } catch {}
  return null;
}

export function saveSiteConfig({ username, passwordHash, displayName, defaultLanguage, languages, homePage, title }) {
  const cfg = { admin: { username, displayName, passwordHash }, site: { defaultLanguage: defaultLanguage || 'fa', languages: languages || ['fa', 'en'], homePage: homePage || 'home', title: title || { fa: 'Emerald Wiki', en: 'Emerald Wiki' } }, installedAt: new Date().toISOString() };
  localStorage.setItem(CK, JSON.stringify(cfg));
  return cfg;
}
