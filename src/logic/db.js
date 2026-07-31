import { ADMIN_USERNAME, ADMIN_DISPLAY_NAME } from '../config.js';

export async function getMyProfile() {
  return { username: ADMIN_USERNAME, display_name: ADMIN_DISPLAY_NAME, role: 'admin' };
}

export async function getAllProfiles() {
  return [await getMyProfile()];
}

export async function updateProfileRole() {
  throw new Error('مدیریت کاربران در حالت محلی پشتیبانی نمی‌شود');
}

export async function deleteProfile() {
  throw new Error('مدیریت کاربران در حالت محلی پشتیبانی نمی‌شود');
}
