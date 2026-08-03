import { DEFAULT_ROLES, DEFAULT_TRANSLATIONS } from '../config.js';
import adminCreds from 'virtual:admin-creds';

const UK = 'emerald-wiki-users';
const RK = 'emerald-wiki-roles';
const IK = 'emerald-wiki-i18n';
const VK = 'emerald-wiki-version';
const CURRENT_VERSION = 2;

const norm = (s) => (s || '').trim().toLowerCase();

function ensureSeeded() {
  const storedVersion = parseInt(localStorage.getItem(VK) || '0', 10);
  if (storedVersion < CURRENT_VERSION) {
    localStorage.removeItem(UK);
    localStorage.removeItem(RK);
    localStorage.removeItem(IK);
  }
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

export function getAllUsers() {
  try { return JSON.parse(localStorage.getItem(UK)) || []; } catch { return []; }
}
export function getUserByUsername(username) {
  const q = norm(username);
  return getAllUsers().find(u => norm(u.username) === q);
}
export function getUserByUsernameHash(hash) {
  if (!hash) return null;
  return getAllUsers().find(u => u.usernameHash === hash);
}
export function createUser({ username, usernameHash, password, displayName, role }) {
  const users = getAllUsers();
  const n = norm(username);
  if (!n) return { error: 'username_required' };
  if (users.find(u => norm(u.username) === n)) return { error: 'username_taken' };
  if (!password) return { error: 'password_required' };
  if (users.find(u => u.usernameHash && u.usernameHash === usernameHash)) return { error: 'username_taken' };
  users.push({ username: n, usernameHash: usernameHash || '', displayName, passwordHash: password, role, createdAt: new Date().toISOString() });
  localStorage.setItem(UK, JSON.stringify(users));
  return { ok: true };
}
export function deleteUser(username) {
  let users = getAllUsers();
  const q = norm(username);
  if (q === 'root') return { error: 'cannot_delete_root' };
  users = users.filter(u => norm(u.username) !== q);
  localStorage.setItem(UK, JSON.stringify(users));
  return { ok: true };
}
export function updateUser(username, updates) {
  const users = getAllUsers();
  const q = norm(username);
  const idx = users.findIndex(u => norm(u.username) === q);
  if (idx === -1) return { error: 'not_found' };
  Object.assign(users[idx], updates);
  localStorage.setItem(UK, JSON.stringify(users));
  return { ok: true };
}
export function syncAdminUser(creds) {
  const users = getAllUsers();
  // First: check for existing admin with matching passwordHash (from installer)
  const existingAdmin = users.find(u => u.role === 'admin' && u.passwordHash === creds.ph);
  if (existingAdmin) {
    existingAdmin.passwordHash = creds.ph || existingAdmin.passwordHash;
    existingAdmin.usernameHash = creds.uh || existingAdmin.usernameHash || '';
    existingAdmin.displayName = creds.dn || existingAdmin.displayName;
    localStorage.setItem(UK, JSON.stringify(users));
    return;
  }
  // No matching admin: create or update 'root'
  const idx = users.findIndex(u => norm(u.username) === 'root');
  const entry = { username: 'root', usernameHash: creds.uh || '', displayName: creds.dn || 'Admin', passwordHash: creds.ph || '', role: 'admin' };
  if (idx === -1) {
    entry.createdAt = new Date().toISOString();
    users.push(entry);
  } else {
    if (!users[idx].passwordHash || users[idx].passwordHash !== creds.ph) {
      users[idx].passwordHash = creds.ph;
      users[idx].usernameHash = creds.uh || users[idx].usernameHash || '';
      users[idx].displayName = creds.dn || users[idx].displayName;
    }
  }
  localStorage.setItem(UK, JSON.stringify(users));
}

export function getAllRoles() {
  try { return JSON.parse(localStorage.getItem(RK)) || []; } catch { return []; }
}
export function getRoleById(id) {
  return getAllRoles().find(r => r.id === id);
}
export function createRole({ id, name, permissions }) {
  const roles = getAllRoles();
  if (!id) return { error: 'id_required' };
  if (roles.find(r => r.id === id)) return { error: 'id_taken' };
  roles.push({ id, name, permissions, isDefault: false });
  localStorage.setItem(RK, JSON.stringify(roles));
  return { ok: true };
}
export function updateRole(id, updates) {
  const roles = getAllRoles();
  const idx = roles.findIndex(r => r.id === id);
  if (idx === -1) return { error: 'not_found' };
  Object.assign(roles[idx], updates);
  localStorage.setItem(RK, JSON.stringify(roles));
  return { ok: true };
}
export function deleteRole(id) {
  let roles = getAllRoles();
  const role = roles.find(r => r.id === id);
  if (!role) return { error: 'not_found' };
  if (role.isDefault) return { error: 'cannot_delete_default' };
  const users = getAllUsers();
  let changed = false;
  for (const u of users) {
    if (u.role === id) { u.role = 'author'; changed = true; }
  }
  if (changed) localStorage.setItem(UK, JSON.stringify(users));
  roles = roles.filter(r => r.id !== id);
  localStorage.setItem(RK, JSON.stringify(roles));
  return { ok: true };
}
export function getPermissionsForRole(roleId) {
  const role = getRoleById(roleId);
  return role ? role.permissions : [];
}

export function getAllLanguages() {
  try { return JSON.parse(localStorage.getItem(IK)) || {}; } catch { return {}; }
}
export function saveLanguages(data) {
  localStorage.setItem(IK, JSON.stringify(data));
}

export async function getMyProfile() {
  const auth = (await import('./auth.js')).getSession();
  if (!auth) return null;
  const user = getUserByUsername(auth.username);
  if (!user) return null;
  return { username: user.username, display_name: user.displayName, role: user.role };
}
export async function getAllProfiles() {
  return getAllUsers().map(u => ({ username: u.username, display_name: u.displayName, role: u.role }));
}
export async function updateProfileRole(username, role) {
  return updateUser(username, { role });
}
export async function deleteProfile(username) {
  return deleteUser(username);
}
