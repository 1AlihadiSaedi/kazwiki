import { ADMIN_EMAIL } from '../config.js';

export async function getMyProfile() {
  return { email: ADMIN_EMAIL, display_name: ADMIN_EMAIL, role: 'admin' };
}

export async function getAllProfiles() {
  return [{ email: ADMIN_EMAIL, display_name: ADMIN_EMAIL, role: 'admin' }];
}

export async function updateProfileRole() {
  throw new Error('مدیریت کاربران در حالت محلی پشتیبانی نمی‌شود');
}

export async function deleteProfile() {
  throw new Error('مدیریت کاربران در حالت محلی پشتیبانی نمی‌شود');
}
