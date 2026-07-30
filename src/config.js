/**
 * config.js – Supabase configuration
 * Replace these values with your own Supabase project credentials.
 *
 * HOW TO GET YOUR CREDENTIALS:
 * 1. Go to https://supabase.com → Create a free project
 * 2. Settings → API → copy "Project URL" and "anon public" key
 * 3. Paste them below
 *
 * NOTE: The anon key is PUBLIC — it will be visible in the browser.
 * Security is enforced by Row Level Security (RLS) on the database.
 */
export const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

/**
 * Default admin credentials (set up in Supabase Dashboard → Authentication → Users):
 *   Email:    root@root.com
 *   Password: rootroootroot
 *
 * After creating the user in Supabase, run this SQL to grant admin role:
 *   UPDATE profiles SET role = 'admin' WHERE email = 'root@root.com';
 */