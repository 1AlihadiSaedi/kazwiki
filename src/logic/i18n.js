/**
 * i18n – Internationalization module for Emerald Wiki
 * Default language: Persian (fa), with English (en) support.
 */

const translations = {
  fa: {
    siteTitle: 'ویکی زمردین',
    home: 'صفحه اصلی',
    about: 'درباره',
    allPages: 'تمام صفحه‌ها',
    search: 'جستجو…',
    noResults: 'نتیجه‌ای یافت نشد',
    language: 'زبان',
    theme: 'پوسته',
    dark: 'تاریک',
    light: 'روشن',
    edit: 'ویرایش',
    editorTitle: 'ویرایشگر محلی',
    editorNote:
      'این یک ویرایشگر محلی است. تغییرات فقط در مرورگر شما ذخیره می‌شود. برای ذخیره دائمی، فایل مارک‌دون را دانلود کرده و در پوشه wiki-content پروژه جایگزین کنید، سپس پروژه را دوباره بسازید (build).',
    downloadMarkdown: 'دانلود فایل مارک‌دون',
    preview: 'پیش‌نمایش',
    write: 'نوشتن',
    pageNotFound: 'صفحه مورد نظر یافت نشد.',
    backToHome: 'بازگشت به صفحه اصلی',
    toggleSidebar: 'باز کردن منو',
    closeSidebar: 'بستن منو',
    footerText: 'ساخته شده با Svelte — میزبان استاتیک',
  },

  en: {
    siteTitle: 'Emerald Wiki',
    home: 'Home',
    about: 'About',
    allPages: 'All Pages',
    search: 'Search…',
    noResults: 'No results found',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    edit: 'Edit',
    editorTitle: 'Local Editor',
    editorNote:
      'This is a local editor. Changes are saved only in your browser. To persist changes, download the Markdown file, replace it in the wiki-content folder, and rebuild the project.',
    downloadMarkdown: 'Download Markdown',
    preview: 'Preview',
    write: 'Write',
    pageNotFound: 'Page not found.',
    backToHome: 'Back to Home',
    toggleSidebar: 'Open Menu',
    closeSidebar: 'Close Menu',
    footerText: 'Built with Svelte — Static Hosting',
  },
};

/** Get translation for a key in the given language. Falls back to Persian. */
export function t(lang, key) {
  const dict = translations[lang] || translations.fa;
  return dict[key] || translations.fa[key] || key;
}

/** Get all available languages */
export function getLanguages() {
  return [
    { code: 'fa', label: 'فارسی', dir: 'rtl' },
    { code: 'en', label: 'English', dir: 'ltr' },
  ];
}

/** Get direction for a language code */
export function getDirection(lang) {
  return lang === 'en' ? 'ltr' : 'rtl';
}