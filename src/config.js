/**
 * config.js – Supabase configuration (read from .env at build time)
 *
 * Values are embedded at BUILD TIME by Vite via import.meta.env.
 * They are NOT editable after npm run build.
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Returns true if Supabase credentials are configured */
export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY &&
    SUPABASE_URL !== 'https://xxxxxxxxxxxx.supabase.co');
}
