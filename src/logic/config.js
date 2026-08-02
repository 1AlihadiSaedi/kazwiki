const CK = 'emerald-wiki-config';
const CREDS_FILE = './.data/390eb3053a827f81.json';

export async function isInstalled() {
  try {
    const res = await fetch(CREDS_FILE);
    if (!res.ok) return false;
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

export function saveSiteConfig({ username, passwordHash, displayName, defaultLanguage, languages, homePage, title }) {
  const cfg = {
    admin: { username, displayName, passwordHash },
    site: { defaultLanguage: defaultLanguage || 'fa', languages: languages || ['fa', 'en'], homePage: homePage || 'home', title: title || { fa: 'ویکی زمردین', en: 'Emerald Wiki' } },
    installedAt: new Date().toISOString()
  };
  localStorage.setItem(CK, JSON.stringify(cfg));
  return cfg;
}
