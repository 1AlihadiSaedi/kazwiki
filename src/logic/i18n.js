import { DEFAULT_LANGUAGE, LANGUAGES } from '../config.js';

const translations = {
  fa: {
    siteTitle:'ویکی زمردین',home:'صفحه اصلی',about:'درباره',allPages:'تمام صفحه‌ها',search:'جستجو…',noResults:'نتیجه‌ای یافت نشد',language:'زبان',theme:'پوسته',dark:'تاریک',light:'روشن',edit:'ویرایش',editorTitle:'ویرایش',save:'ذخیره',saved:'ذخیره شد',downloaded:'دانلود شد',saving:'در حال ذخیره…',saveError:'خطا در ذخیره',preview:'پیش‌نمایش',write:'نوشتن',pageNotFound:'صفحه مورد نظر یافت نشد.',backToHome:'بازگشت به صفحه اصلی',toggleSidebar:'باز کردن منو',closeSidebar:'بستن منو',footerText:'ساخته شده با Svelte',loginTitle:'ورود به بخش مدیریت',login:'ورود',username:'نام کاربری',password:'رمز عبور',loggingIn:'در حال ورود...',settings:'تنظیمات',profile:'پروفایل',displayName:'نام نمایشی',role:'نقش',roleAdmin:'مدیر',roleEditor:'ویرایشگر',roleViewer:'بیننده',actions:'عملیات',you:'شما',noUsers:'کاربری یافت نشد',cancel:'انصراف',loading:'در حال بارگذاری...',profileNotFound:'پروفایل یافت نشد',logout:'خروج',loginFailed:'ورود ناموفق',
  },
  en: {
    siteTitle:'Emerald Wiki',home:'Home',about:'About',allPages:'All Pages',search:'Search…',noResults:'No results found',language:'Language',theme:'Theme',dark:'Dark',light:'Light',edit:'Edit',editorTitle:'Edit',save:'Save',saved:'Saved',downloaded:'Downloaded',saving:'Saving…',saveError:'Save failed',preview:'Preview',write:'Write',pageNotFound:'Page not found.',backToHome:'Back to Home',toggleSidebar:'Open Menu',closeSidebar:'Close Menu',footerText:'Built with Svelte',loginTitle:'Admin Login',login:'Login',username:'Username',password:'Password',loggingIn:'Logging in...',settings:'Settings',profile:'Profile',displayName:'Display Name',role:'Role',roleAdmin:'Admin',roleEditor:'Editor',roleViewer:'Viewer',actions:'Actions',you:'You',noUsers:'No users found',cancel:'Cancel',loading:'Loading...',profileNotFound:'Profile not found',logout:'Logout',loginFailed:'Login failed',
  },
};

const LANG_META = {
  fa: { label: 'فارسی', dir: 'rtl' },
  en: { label: 'English', dir: 'ltr' },
};

export function t(lang, key) {
  const dict = translations[lang] || translations[DEFAULT_LANGUAGE] || translations.fa;
  return dict[key] || translations[DEFAULT_LANGUAGE]?.[key] || translations.fa[key] || key;
}

export function getLanguages() {
  return LANGUAGES.filter(code => LANG_META[code]).map(code => ({ code, ...LANG_META[code] }));
}

export function getDirection(lang) { return lang === 'en' ? 'ltr' : 'rtl'; }
