import { DEFAULT_ROLES, DEFAULT_TRANSLATIONS } from '../config.js';
import adminCreds from 'virtual:admin-creds';

const UK = 'emerald-wiki-users';
const RK = 'emerald-wiki-roles';
const IK = 'emerald-wiki-i18n';
const VK = 'emerald-wiki-version';
const CURRENT_VERSION = 3;

const norm = (s) => (s || '').trim().toLowerCase();

function ensureSeeded() {
  const storedVersion = parseInt(localStorage.getItem(VK) || '0', 10);
  console.log('[ensureSeeded] storedVersion:', storedVersion, 'CURRENT:', CURRENT_VERSION);
  if (!localStorage.getItem(RK)) {
    localStorage.setItem(RK, JSON.stringify(DEFAULT_ROLES));
  }
  if (!localStorage.getItem(UK)) {
    const users = [{
      username: 'root',
      usernameHash: adminCreds.uh || '',
      displayName: adminCreds.dn || 'Admin',
      passwordHash: adminCreds.ph || '',
      role: 'admin',
      createdAt: new Date().toISOString()
    }];
    localStorage.setItem(UK, JSON.stringify(users));
  }
  if (!localStorage.getItem(IK)) {
    localStorage.setItem(IK, JSON.stringify(DEFAULT_TRANSLATIONS));
  }
  localStorage.setItem(VK, String(CURRENT_VERSION));
}
if (typeof localStorage !== 'undefined') ensureSeeded();
