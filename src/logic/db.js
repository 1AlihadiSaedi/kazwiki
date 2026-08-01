import { DEFAULT_ROLES, DEFAULT_TRANSLATIONS } from '../config.js';
import adminCreds from 'virtual:admin-creds';

const UK = 'emerald-wiki-users';
const RK = 'emerald-wiki-roles';
const IK = 'emerald-wiki-i18n';

function ensureSeeded() {
  if (!localStorage.getItem(RK)) {
    localStorage.setItem(RK, JSON.stringify(DEFAULT_ROLES));
  }
  if (!localStorage.getItem(UK)) {
    const users = [{
      username: 'root',
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
}
if (typeof localStorage !== 'undefined') ensureSeeded();

export function getAllUsers() {
  try { return JSON.parse(localStorage.getItem(UK)) || []; } catch { return []; }
}
export function getUserByUsername(username) {
  return getAllUsers().find(u => u.username === username);
}
export function createUser({ username, password, displayName, role }) {
  const users = getAllUsers();
  if (users.find(u => u.username === username)) return { error: 'username_taken' };
  if (!username) return { error: 'username_required' };
  if (!password) return { error: 'password_required' };
  const ph = password;
  users.push({ username, displayName, passwordHash: ph, role, createdAt: new Date().toISOString() });
  localStorage.setItem(UK, JSON.stringify(users));
  return { ok: true };
}
export function deleteUser(username) {
  let users = getAllUsers();
  if (username === 'root') return { error: 'cannot_delete_root' };
  users = users.filter(u => u.username !== username);
  localStorage.setItem(UK, JSON.stringify(users));
  return { ok: true };
}
export function updateUser(username, updates) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) return { error: 'not_found' };
  Object.assign(users[idx], updates);
  localStorage.setItem(UK, JSON.stringify(users));
  return { ok: true };
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
