const cfg = typeof window !== 'undefined' ? window.__EMERALD_CONFIG__ : null;

export const ADMIN_EMAIL =
  cfg?.admin?.email || 'root@root.com';

export const ADMIN_PASSWORD = 'RootRootRoot';

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
