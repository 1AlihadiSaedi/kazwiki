import { DEFAULT_LANGUAGE, LANGUAGES, DEFAULT_TRANSLATIONS } from '../config.js';

const IK = 'emerald-wiki-i18n';

const builtin = {
  fa: {
    meta: { name: 'فارسی', code: 'fa', dir: 'rtl' },
    translations: {
      siteTitle:'ویکی زمردین',home:'صفحه اصلی',allPages:'تمام صفحه‌ها',search:'جستجو…',
      noResults:'نتیجه‌ای یافت نشد',language:'زبان',theme:'پوسته',dark:'تاریک',light:'روشن',
      edit:'ویرایش',save:'ذخیره',saved:'تغییرات با موفقیت اعمال شد',saving:'در حال ذخیره…',
      preview:'پیش‌نمایش',write:'نوشتن',pageNotFound:'صفحه مورد نظر یافت نشد.',
      backToHome:'بازگشت به صفحه اصلی',loginTitle:'ورود به بخش مدیریت',login:'ورود',
      username:'نام کاربری',password:'رمز عبور',loggingIn:'در حال ورود...',settings:'تنظیمات',
      profile:'پروفایل',displayName:'نام نمایشی',role:'نقش',logout:'خروج',cancel:'انصراف',
      loading:'در حال بارگذاری...',profileNotFound:'پروفایل یافت نشد',loginFailed:'ورود ناموفق',
    }
  },
  en: {
    meta: { name: 'English', code: 'en', dir: 'ltr' },
    translations: {
      siteTitle:'Emerald Wiki',home:'Home',allPages:'All Pages',search:'Search…',
      noResults:'No results found',language:'Language',theme:'Theme',dark:'Dark',light:'Light',
      edit:'Edit',save:'Save',saved:'Changes saved successfully',saving:'Saving…',
      preview:'Preview',write:'Write',pageNotFound:'Page not found.',
      backToHome:'Back to Home',loginTitle:'Admin Login',login:'Login',
      username:'Username',password:'Password',loggingIn:'Logging in...',settings:'Settings',
      profile:'Profile',displayName:'Display Name',role:'Role',logout:'Logout',cancel:'Cancel',
      loading:'Loading...',profileNotFound:'Profile not found',loginFailed:'Login failed',
    }
  }
};

export function t(l, k) {
  let d;
  try {
    const raw = localStorage.getItem(IK);
    if (raw) { const p = JSON.parse(raw); d = p[l]?.translations; }
  } catch {}
  if (d && d[k]) return d[k];
  if (builtin[l]?.translations[k]) return builtin[l].translations[k];
  return k;
}

export function getLanguages() {
  try {
    const raw = localStorage.getItem(IK);
    if (raw) {
      const p = JSON.parse(raw);
      const codes = Object.keys(p).filter(c => p[c]?.meta);
      return codes.map(c => ({ code: c, ...p[c].meta }));
    }
  } catch {}
  return LANGUAGES.filter(c => builtin[c]?.meta).map(c => ({ code: c, ...builtin[c].meta }));
}

export function getDirection(l) {
  try {
    const raw = localStorage.getItem(IK);
    if (raw) { const p = JSON.parse(raw); if (p[l]?.meta?.dir) return p[l].meta.dir; }
  } catch {}
  return l === 'en' ? 'ltr' : 'rtl';
}

export function getAllLanguageData() {
  try {
    const raw = localStorage.getItem(IK);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_TRANSLATIONS;
}

export function addLanguage(code, meta, translations) {
  const data = getAllLanguageData();
  if (data[code]) return { error: 'exists' };
  data[code] = { meta, translations };
  localStorage.setItem(IK, JSON.stringify(data));
  return { ok: true };
}

export function removeLanguage(code) {
  const data = getAllLanguageData();
  if (!data[code]) return { error: 'not_found' };
  if (code === DEFAULT_LANGUAGE) return { error: 'cannot_delete_default' };
  delete data[code];
  localStorage.setItem(IK, JSON.stringify(data));
  return { ok: true };
}

export function exportLanguage(code) {
  const data = getAllLanguageData();
  return data[code] || null;
}

export function updateTranslation(code, key, value) {
  const data = getAllLanguageData();
  if (!data[code]) return { error: 'not_found' };
  data[code].translations[key] = value;
  localStorage.setItem(IK, JSON.stringify(data));
  return { ok: true };
}
