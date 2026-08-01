// ── Credentials (source of truth — hashed at build time, never in output) ──
export const ADMIN_USERNAME = 'root';
export const ADMIN_DISPLAY_NAME = 'Saedi';
export const ADMIN_PASSWORD = 'RootRootRoot';

// ── Site config ──
export const SITE_TITLE = { fa: 'ویکی زمردین', en: 'Emerald Wiki' };
export const DEFAULT_LANGUAGE = 'fa';
export const LANGUAGES = ['fa', 'en'];
export const HOME_PAGE = 'home';

// ── Permissions ──
export const ALL_PERMISSIONS = [
  { id: 'create_page',       fa: 'ایجاد صفحه',        en: 'Create pages' },
  { id: 'edit_own_page',     fa: 'ویرایش صفحات خود',   en: 'Edit own pages' },
  { id: 'edit_any_page',     fa: 'ویرایش هر صفحه',     en: 'Edit any page' },
  { id: 'delete_own_page',   fa: 'حذف صفحات خود',      en: 'Delete own pages' },
  { id: 'delete_any_page',   fa: 'حذف هر صفحه',        en: 'Delete any page' },
  { id: 'manage_users',      fa: 'مدیریت کاربران',     en: 'Manage users' },
  { id: 'manage_roles',      fa: 'مدیریت نقش‌ها',      en: 'Manage roles' },
  { id: 'manage_languages',  fa: 'مدیریت زبان‌ها',     en: 'Manage languages' },
];

// ── Default roles ──
export const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: { fa: 'مدیر سیستم', en: 'Administrator' },
    permissions: ['create_page','edit_own_page','edit_any_page','delete_own_page','delete_any_page','manage_users','manage_roles','manage_languages'],
    isDefault: true,
  },
  {
    id: 'editor',
    name: { fa: 'ویراستار', en: 'Editor' },
    permissions: ['create_page', 'edit_any_page', 'delete_any_page'],
    isDefault: true,
  },
  {
    id: 'author',
    name: { fa: 'نویسنده', en: 'Author' },
    permissions: ['create_page', 'edit_own_page', 'delete_own_page'],
    isDefault: true,
  },
];

// ── Built-in translations ──
export const DEFAULT_TRANSLATIONS = {
  fa: {
    meta: { name: 'فارسی', code: 'fa', dir: 'rtl' },
    translations: {
      siteTitle:'ویکی زمردین',home:'صفحه اصلی',allPages:'تمام صفحه‌ها',
      search:'جستجو…',noResults:'نتیجه‌ای یافت نشد',language:'زبان',theme:'پوسته',
      dark:'تاریک',light:'روشن',edit:'ویرایش',editorTitle:'ویرایش',save:'ذخیره',
      saved:'تغییرات با موفقیت اعمال شد',saveFailed:'اعمال تغییرات با شکست همراه بود',
      saving:'در حال ذخیره…',preview:'پیش‌نمایش',write:'نوشتن',pageNotFound:'صفحه مورد نظر یافت نشد.',
      backToHome:'بازگشت به صفحه اصلی',toggleSidebar:'باز کردن منو',closeSidebar:'بستن منو',
      footerText:'ساخته شده با Svelte',loginTitle:'ورود به بخش مدیریت',login:'ورود',
      username:'نام کاربری',password:'رمز عبور',loggingIn:'در حال ورود...',settings:'تنظیمات',
      profile:'پروفایل',displayName:'نام نمایشی',role:'نقش',logout:'خروج',loginFailed:'ورود ناموفق',
      createPage:'ایجاد صفحه جدید',deletePage:'حذف صفحه',
      deleteConfirm:'برای تأیید حذف، نام صفحه را وارد کنید:',deletePlaceholder:'نام صفحه…',
      deleted:'صفحه با موفقیت حذف شد',deleteFailed:'حذف صفحه با شکست همراه بود',
      users:'کاربران',roles:'نقش‌ها',languages:'زبان‌ها',addUser:'افزودن کاربر',
      deleteUser:'حذف کاربر',addRole:'افزودن نقش',deleteRole:'حذف نقش',
      addLanguage:'افزودن زبان',uploadTranslation:'آپلود فایل ترجمه',
      downloadBackup:'دانلود بک‌آپ',removeLanguage:'حذف زبان',
      roleName:'نام نقش',permissions:'مجوزها',passwordRequired:'رمز عبور الزامی است',
      usernameRequired:'نام کاربری الزامی است',usernameTaken:'این نام کاربری قبلاً استفاده شده',
      roleNameRequired:'نام نقش الزامی است',roleNameTaken:'این نام نقش قبلاً استفاده شده',
      confirmDeleteUser:'آیا از حذف این کاربر مطمئن هستید؟',
      confirmDeleteRole:'آیا از حذف این نقش مطمئن هستید؟',
      confirmDeleteLang:'آیا از حذف این زبان و تمام صفحاتش مطمئن هستید؟',
      searchResults:'نتایج جستجو',created:'تاریخ ایجاد',
      selectRole:'انتخاب نقش',noPermission:'شما مجوز دسترسی به این بخش را ندارید',
      loading:'در حال بارگذاری...',cancel:'انصراف',
    }
  },
  en: {
    meta: { name: 'English', code: 'en', dir: 'ltr' },
    translations: {
      siteTitle:'Emerald Wiki',home:'Home',allPages:'All Pages',
      search:'Search…',noResults:'No results found',language:'Language',theme:'Theme',
      dark:'Dark',light:'Light',edit:'Edit',editorTitle:'Edit',save:'Save',
      saved:'Changes saved successfully',saveFailed:'Failed to save changes',
      saving:'Saving…',preview:'Preview',write:'Write',pageNotFound:'Page not found.',
      backToHome:'Back to Home',toggleSidebar:'Open Menu',closeSidebar:'Close Menu',
      footerText:'Built with Svelte',loginTitle:'Admin Login',login:'Login',
      username:'Username',password:'Password',loggingIn:'Logging in...',settings:'Settings',
      profile:'Profile',displayName:'Display Name',role:'Role',logout:'Logout',loginFailed:'Login failed',
      createPage:'Create new page',deletePage:'Delete page',
      deleteConfirm:'Type the page name to confirm deletion:',deletePlaceholder:'Page name…',
      deleted:'Page deleted successfully',deleteFailed:'Failed to delete page',
      users:'Users',roles:'Roles',languages:'Languages',addUser:'Add User',
      deleteUser:'Delete User',addRole:'Add Role',deleteRole:'Delete Role',
      addLanguage:'Add Language',uploadTranslation:'Upload translation file',
      downloadBackup:'Download backup',removeLanguage:'Remove language',
      roleName:'Role name',permissions:'Permissions',passwordRequired:'Password is required',
      usernameRequired:'Username is required',usernameTaken:'This username is already taken',
      roleNameRequired:'Role name is required',roleNameTaken:'This role name is already taken',
      confirmDeleteUser:'Are you sure you want to delete this user?',
      confirmDeleteRole:'Are you sure you want to delete this role?',
      confirmDeleteLang:'Are you sure you want to delete this language and all its pages?',
      searchResults:'Search results',created:'Created',
      selectRole:'Select role',noPermission:'You do not have permission to access this section',
      loading:'Loading...',cancel:'Cancel',
    }
  }
};
