/**
 * auth.js – Custom lightweight Supabase Auth client
 *
 * Uses only fetch() — no external SDK dependency.
 * Handles: signIn, signOut, getSession, getUser, signUp.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '../config.js';

const AUTH_URL = SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : null;
const STORAGE_KEY = 'emerald-wiki-auth';

function requireConfig() {
  if (!isSupabaseConfigured()) throw new Error('Auth not configured');
}

/**
 * Store session in localStorage (token only — no sensitive data).
 * @param {{ access_token: string, refresh_token: string, expires_at: number }} session
 */
function saveSession(session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    })
  );
}

/** Retrieve saved session from localStorage */
function loadSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // Check if expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Remove session from localStorage */
function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Sign in with email and password.
 * @returns {Promise<{ user: object, session: object } | { error: string }>}
 */
export async function signIn(email, password) {
  requireConfig();
  const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data.error_description || data.msg || 'Login failed' };
  }

  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  };

  saveSession(session);
  return { user: data.user, session };
}

/**
 * Sign up a new user.
 * @returns {Promise<{ user: object, session: object } | { error: string }>}
 */
export async function signUp(email, password) {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data.msg || data.error_description || 'Signup failed' };
  }

  // Save session if auto-confirmed
  if (data.session) {
    saveSession(data.session);
    return { user: data.user, session: data.session };
  }

  return { user: data.user, session: null };
}

/** Sign out — clears local session */
export async function signOut() {
  const session = loadSession();
  if (session) {
    // Tell Supabase to revoke the token (fire-and-forget)
    fetch(`${AUTH_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
    }).catch(() => {});
  }
  clearSession();
}

/** Get the current session (from localStorage) */
export function getSession() {
  return loadSession();
}

/**
 * Fetch user profile from Supabase Auth.
 * @returns {Promise<object | null>} user object or null
 */
export async function fetchUser(token) {
  const res = await fetch(`${AUTH_URL}/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Full auth state: session + user together.
 * @returns {Promise<{ user: object | null, session: object | null, role: string | null }>}
 */
export async function getAuthState() {
  if (!isSupabaseConfigured()) return { user: null, session: null, role: null };
  const session = loadSession();
  if (!session) return { user: null, session: null, role: null };

  const user = await fetchUser(session.access_token);
  return { user, session, role: user?.user_metadata?.role || null };
}

/**
 * Listen for auth changes (other tabs, token expiry).
 * Calls callback whenever session changes.
 */
export function onAuthChange(callback) {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    const session = loadSession();
    callback(session);
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
