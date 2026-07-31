const cfg = typeof window !== 'undefined' ? window.__EMERALD_CONFIG__ : null;

const DEFAULT_PASSWORD_HASH = '09a03e634a5691c2c300bb1507ceaac5222031b3574a4a7b0d0dd3e86162e355';

export const ADMIN_EMAIL =
  cfg?.admin?.email || 'root@root.com';

export const ADMIN_PASSWORD_HASH =
  cfg?.admin?.passwordHash || DEFAULT_PASSWORD_HASH;

export const SITE_TITLE =
  cfg?.title || { fa: 'ویکی زمردین', en: 'Emerald Wiki' };

export const SITE_DESCRIPTION =
  cfg?.description || { fa: '', en: '' };

export const DEFAULT_LANGUAGE =
  cfg?.defaultLanguage || 'fa';

export const LANGUAGES =
  cfg?.languages || ['fa', 'en'];

export const HOME_PAGE =
  cfg?.homePage || 'home';
