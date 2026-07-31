const cfg = typeof window !== 'undefined' ? window.__EMERALD_CONFIG__ : null;

export const SUPABASE_URL =
  (cfg?.supabase?.url) || import.meta.env.VITE_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (cfg?.supabase?.anonKey) || import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY &&
    SUPABASE_URL !== 'https://xxxxxxxxxxxx.supabase.co');
}

export const SITE_TITLE =
  cfg?.title || { fa: 'ویکی زمردین', en: 'Emerald Wiki' };

export const SITE_DESCRIPTION =
  cfg?.description || { fa: '', en: '' };

export const DEFAULT_LANGUAGE =
  cfg?.defaultLanguage || 'fa';

export const LANGUAGES =
  cfg?.languages || ['fa', 'en'];

export const HOME_PAGE =
  cfg?.homePage || 'home';

export const PAGES_DIR =
  cfg?.pagesDir || './pages/';
