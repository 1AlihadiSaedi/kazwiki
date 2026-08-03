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
  const DEBUG = true;

  const unHash = await sha256(u);
  alert('[signIn v3] username=' + u + '\nunHash=' + unHash.slice(0,8) + '...\npwHash=' + pwHash.slice(0,8) + '...');
  if (DEBUG) console.log('[signIn] u:', u, 'unHash:', unHash.slice(0,16)+'...', 'pwHash:', pwHash.slice(0,16)+'...');

  const creds = await getAdminCreds();
  if (creds.uh && creds.ph) {
    if (DEBUG) console.log('[signIn] admin creds exist, checking...');
    if (unHash === creds.uh && pwHash === creds.ph) {
      if (DEBUG) console.log('[signIn] ADMIN MATCH');
      const dn = creds.dn || 'Admin';
      save({ username: 'root', displayName: dn, role: 'admin' });
      syncAdminUser(creds);
      return { user: { username: 'root', displayName: dn, role: 'admin' } };
    }
    if (DEBUG) console.log('[signIn] not admin, trying custom user...');
  }

  let user = getUserByUsernameHash(unHash);
  if (DEBUG) console.log('[signIn] getUserByUsernameHash result:', user ? 'FOUND: '+user.username : 'NOT FOUND');
  if (!user) {
    if (DEBUG) console.log('[signIn] trying fallback getUserByUsername...');
    user = getUserByUsername(u);
    if (DEBUG) console.log('[signIn] getUserByUsername result:', user ? 'FOUND: '+user.username : 'NOT FOUND');
    if (!user) {
      if (DEBUG) { console.log('[signIn] ALL USERS:', getAllUsers().map(x=>({u:x.username,uh:x.usernameHash?.slice(0,16)+'...',ph:x.passwordHash?.slice(0,16)+'...'}))); }
      if (DEBUG) console.log('[signIn] trying server fallback...');
      const srvUser = await tryServerLogin(unHash, pwHash);
      if (DEBUG) console.log('[signIn] server result:', srvUser ? 'FOUND: '+srvUser.username : 'NOT FOUND');
      if (srvUser) {
        save({ username: srvUser.username, displayName: srvUser.displayName, role: srvUser.role });
        return { user: { username: srvUser.username, displayName: srvUser.displayName, role: srvUser.role } };
      }
      return { error: 'ورود ناموفق' };
    }
    if (pwHash !== user.passwordHash) {
      if (DEBUG) console.log('[signIn] PW MISMATCH — stored:', user.passwordHash.slice(0,16)+'...');
      return { error: 'ورود ناموفق' };
    }
  } else {
    if (pwHash !== user.passwordHash) {
      if (DEBUG) console.log('[signIn] PW MISMATCH — stored:', user.passwordHash.slice(0,16)+'...');
      return { error: 'ورود ناموفق' };
    }
  }

  save({ username: user.username, displayName: user.displayName, role: user.role });
  return { user: { username: user.username, displayName: user.displayName, role: user.role } };
}

async function tryServerLogin(unHash, pwHash) {
  try {
    const res = await fetch('/api/users?usernameHash=' + encodeURIComponent(unHash));
    if (!res.ok) return null;
    const srvUser = await res.json();
    if (!srvUser || !srvUser.passwordHash) return null;
    if (srvUser.passwordHash !== pwHash) return null;
    return srvUser;
  } catch { return null; }
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
