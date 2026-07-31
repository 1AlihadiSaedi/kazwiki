import { sha256 } from './crypto.js';

const AUTH_KEY = 'emerald-wiki-session';

function getStored() {
  if (typeof window === 'undefined') return null;
  try { const raw = sessionStorage.getItem(AUTH_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function setStored(email) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({ email, ts: Date.now() }));
}
function clearStored() { if (typeof window !== 'undefined') sessionStorage.removeItem(AUTH_KEY); }

export async function signIn(email, password) {
  const cfg = window.__EMERALD_CONFIG__;
  if (!cfg?.admin?.email || !cfg?.admin?.passwordHash) return { error: 'تنظیمات ادمین یافت نشد' };
  if (email !== cfg.admin.email) return { error: 'ورود ناموفق' };
  const hash = await sha256(password);
  if (hash !== cfg.admin.passwordHash) return { error: 'ورود ناموفق' };
  setStored(email);
  return { user: { email } };
}

export async function signOut() { clearStored(); }
export function getSession() { return getStored(); }
export async function getAuthState() {
  const session = getStored();
  if (!session) return { user: null, session: null, role: null };
  return { user: { email: session.email }, session, role: 'admin' };
}
export async function signUp() { return { error: 'ثبت‌نام در حالت محلی پشتیبانی نمی‌شود' }; }
export async function fetchUser() { return null; }
export function onAuthChange(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(getStored());
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
