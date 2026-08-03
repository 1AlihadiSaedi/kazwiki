import { sha256 } from './crypto.js';
import { getAllUsers, getUserByUsername, getUserByUsernameHash, getPermissionsForRole, syncAdminUser } from './db.js';
import adminCreds from 'virtual:admin-creds';

const AUTH_KEY = 'emerald-wiki-session';
const norm = (s) => (s || '').trim().toLowerCase();

function load() {
  try { const r = sessionStorage.getItem(AUTH_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function save(u) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({ username: u.username, displayName: u.displayName, role: u.role, ts: Date.now() }));
}
function clearSession() { sessionStorage.removeItem(AUTH_KEY); }

async function getAdminCreds() {
  // 1. Try embedded config (dev mode after install)
  if (typeof window !== 'undefined' && window.__EMERALD_CONFIG__?.admin?.passwordHash) {
    return window.__EMERALD_CONFIG__.admin;
  }
  // 2. Fetch from server (preview/build mode after install)
  try {
    const res = await fetch('/api/auth/creds', { cache: 'no-store' });
    if (res.ok) {
      const d = await res.json();
      if (d.ph) return { uh: d.uh, ph: d.ph, dn: d.dn };
    }
  } catch {}
  // 3. Fallback to build-time adminCreds (may be empty in preview)
  return adminCreds;
}

export async function signIn(username, password) {
  if (!username || !password) return { error: 'ورود ناموفق' };
  const pwHash = await sha256(password);
  const u = norm(username);

  const unHash = await sha256(u);

  const creds = await getAdminCreds();
  if (creds.uh && creds.ph) {
    if (unHash === creds.uh && pwHash === creds.ph) {
      const dn = creds.dn || 'Admin';
      save({ username: 'root', displayName: dn, role: 'admin' });
      syncAdminUser(creds);
      return { user: { username: 'root', displayName: dn, role: 'admin' } };
    }
  }

  const user = getUserByUsernameHash(unHash);
  if (!user) return { error: 'ورود ناموفق' };
  if (pwHash !== user.passwordHash) return { error: 'ورود ناموفق' };

  save({ username: user.username, displayName: user.displayName, role: user.role });
  return { user: { username: user.username, displayName: user.displayName, role: user.role } };
}

export async function signOut() { clearSession(); }

export function getSession() {
  if (typeof window === 'undefined') return null;
  return load();
}

export async function getAuthState() {
  if (typeof window === 'undefined') return { user: null, session: null, role: null };
  const s = load();
  if (!s) return { user: null, session: null, role: null };
  return { user: { username: s.username, displayName: s.displayName }, session: s, role: s.role };
}

export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  if (role === 'admin') return true;
  const perms = getPermissionsForRole(role);
  return perms.includes(permission);
}

export function onAuthChange(cb) {
  const h = () => cb(load());
  window.addEventListener('storage', h);
  return () => window.removeEventListener('storage', h);
}

export async function signUp() { return { error: 'ثبت‌نام پشتیبانی نمی‌شود' }; }
export async function fetchUser() { return null; }
