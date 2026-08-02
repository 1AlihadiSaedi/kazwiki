import { sha256 } from './crypto.js';
import { getAllUsers, getUserByUsername, getPermissionsForRole, syncAdminUser } from './db.js';
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

function getAdminCreds() {
  if (typeof window !== 'undefined' && window.__EMERALD_CONFIG__?.admin?.passwordHash) {
    return window.__EMERALD_CONFIG__.admin;
  }
  return adminCreds;
}

export async function signIn(username, password) {
  if (!username || !password) return { error: 'ورود ناموفق' };
  const pwHash = await sha256(password);
  const u = norm(username);

  const creds = getAdminCreds();
  if (creds.uh && creds.ph) {
    const unHash = await sha256(u);
    if (unHash === creds.uh && pwHash === creds.ph) {
      const dn = creds.dn || 'Admin';
      save({ username: 'root', displayName: dn, role: 'admin' });
      syncAdminUser(creds);
      return { user: { username: 'root', displayName: dn, role: 'admin' } };
    }
  }

  const user = getUserByUsername(u);
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
