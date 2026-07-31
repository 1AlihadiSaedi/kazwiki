const runtime = typeof window !== 'undefined' ? window.__EMERALD_CONFIG__ : null;

export const SUPABASE_URL =
  (runtime && runtime.SUPABASE_URL) || import.meta.env.VITE_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (runtime && runtime.SUPABASE_ANON_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY &&
    SUPABASE_URL !== 'https://xxxxxxxxxxxx.supabase.co');
}
