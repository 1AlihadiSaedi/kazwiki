import { sha256 } from './crypto.js';
import { ADMIN_USERNAME, ADMIN_DISPLAY_NAME, ADMIN_PASSWORD } from '../config.js';

const AUTH_KEY = 'emerald-wiki-session';

function load() {
  try { const r = sessionStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function save(u, n) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({ username: u, displayName: n, ts: Date.now() }));
}
function clear() { sessionStorage.removeItem(AUTH_KEY); }

async function expectedHash() {
  const c = window.__EMERALD_CONFIG__;
  if (c?.admin?.passwordHash) return c.admin.passwordHash;
  return sha256(ADMIN_PASSWORD);
}

export async function signIn(username, name, password) {
  if (!ADMIN_USERNAME) return { error: 'تنظیمات ادمین یافت نشد' };
  if (username !== ADMIN_USERNAME) return { error: 'ورود ناموفق' };
  if (name !== ADMIN_DISPLAY_NAME) return { error: 'ورود ناموفق' };
  if (await sha256(password) !== await expectedHash()) return { error: 'ورود ناموفق' };
  save(username, ADMIN_DISPLAY_NAME);
  return { user: { username, displayName: ADMIN_DISPLAY_NAME } };
}

export async function signOut() { clear(); }

export function getSession() {
  if (typeof window === 'undefined') return null;
  return load();
}

export async function getAuthState() {
  if (typeof window === 'undefined') return { user: null, session: null, role: null };
  const s = load();
  if (!s) return { user: null, session: null, role: null };
  return { user: { username: s.username, displayName: s.displayName }, session: s, role: 'admin' };
}

export async function signUp() { return { error: 'ثبت‌نام پشتیبانی نمی‌شود' }; }
export async function fetchUser() { return null; }

export function onAuthChange(cb) {
  const h = () => cb(load());
  window.addEventListener('storage', h);
  return () => window.removeEventListener('storage', h);
}
