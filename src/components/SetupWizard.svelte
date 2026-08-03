<script>
import { saveSiteConfig } from '../logic/config.js';
import { sha256 } from '../logic/crypto.js';
import { DEFAULT_ROLES, DEFAULT_TRANSLATIONS, SITE_DEFAULTS } from '../config.js';
import { t } from '../logic/i18n.js';
import { initTheme, getTheme, setTheme } from '../logic/theme.js';

let step = $state(1);
let form = $state({
  username: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  defaultLanguage: 'en',
  extraLanguages: [],
  wikiTitle: '',
  wikiIcon: '',
});
let error = $state('');
let loading = $state(false);
let theme = $state(getTheme() || 'dark');
let lang = $state(form.defaultLanguage);

$effect(() => { initTheme(); });
$effect(() => {
  if (theme !== getTheme()) setTheme(theme);
});

const LANGS = [
  { code: 'fa', name: { fa: 'فارسی', en: 'Persian' } },
  { code: 'en', name: { fa: 'انگلیسی', en: 'English' } },
];

function handleIconUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    error = lang === 'en' ? 'Please select an image file' : 'لطفاً یک فایل تصویری انتخاب کنید';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.wikiIcon = reader.result;
    error = '';
  };
  reader.readAsDataURL(file);
}

function removeIcon() { form.wikiIcon = ''; }

async function handleInstall() {
  error = '';
  const ph = await sha256(form.password);
  const uh = await sha256(form.username);
  const langs = ['fa', 'en'];
  for (const el of form.extraLanguages) {
    if (!langs.includes(el.code)) langs.push(el.code);
  }
  const wikiTitleObj = form.wikiTitle
    ? { fa: form.wikiTitle, en: form.wikiTitle }
    : { fa: 'ویکی زمردین', en: 'Emerald Wiki' };

  saveSiteConfig({
    username: form.username,
    passwordHash: ph,
    displayName: form.displayName,
    defaultLanguage: form.defaultLanguage,
    languages: langs,
    homePage: SITE_DEFAULTS.homePage,
    title: wikiTitleObj,
    icon: form.wikiIcon,
    theme: theme
  });
  localStorage.setItem('emerald-wiki-users', JSON.stringify([{
    username: form.username,
    displayName: form.displayName,
    passwordHash: ph,
    role: 'admin',
    createdAt: new Date().toISOString()
  }]));
  localStorage.setItem('emerald-wiki-roles', JSON.stringify(DEFAULT_ROLES));
  localStorage.setItem('emerald-wiki-i18n', JSON.stringify(DEFAULT_TRANSLATIONS));
  localStorage.setItem('emerald-wiki-version', '3');

  try {
    const res = await fetch('/api/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        ph,
        uh,
        dn: form.displayName || form.username,
        defaultLanguage: form.defaultLanguage,
        languages: langs,
        homePage: SITE_DEFAULTS.homePage,
        title: wikiTitleObj,
        icon: form.wikiIcon,
        theme
      })
    });
    if (!res.ok) throw new Error('Server install failed');
  } catch {}
  window.location.reload();
}

function nextStep() {
  error = '';
  if (step === 1) {
    if (form.username.length < 3) {
      error = lang === 'en' ? 'Username must be at least 3 characters' : 'نام کاربری باید حداقل ۳ کاراکتر باشد';
      return;
    }
    if (form.password.length < 3) {
      error = lang === 'en' ? 'Password must be at least 3 characters' : 'رمز عبور باید حداقل ۳ کاراکتر باشد';
      return;
    }
    if (form.password !== form.confirmPassword) {
      error = lang === 'en' ? 'Passwords do not match' : 'رمز عبور و تکرار آن مطابقت ندارند';
      return;
    }
    if (!form.displayName.trim()) form.displayName = form.username;
    step = 2;
  } else if (step === 2) {
    step = 3;
  } else if (step === 3) {
    handleInstall();
  }
}

function prevStep() { if (step > 1) step--; error = ''; }

function toggleLang(code) {
  const idx = form.extraLanguages.findIndex(l => l.code === code);
  if (idx >= 0) form.extraLanguages.splice(idx, 1);
  else form.extraLanguages.push(LANGS.find(l => l.code === code));
}

function toggleTheme() { theme = theme === 'dark' ? 'light' : 'dark'; setTheme(theme); }

const steps = [
  { num: 1, labelFa: 'مدیر', labelEn: 'Admin' },
  { num: 2, labelFa: 'زبان', labelEn: 'Language' },
  { num: 3, labelFa: 'برند', labelEn: 'Brand' },
];
</script>

<div class="sw">
  <div class="sw-c">
    <div class="sw-h">
      <button class="sw-tt" onclick={toggleTheme} type="button" title={lang === 'en' ? 'Toggle theme' : 'تغییر قالب'}>
        {#if theme === 'dark'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        {/if}
      </button>
      <h1 class="sw-t">{lang === 'en' ? 'Wiki Setup' : 'نصب ویکی'}</h1>
      <p class="sw-st">{lang === 'en' ? 'Configure your wiki in a few steps' : 'ویکی خود را در چند مرحله پیکربندی کنید'}</p>
    </div>

    <div class="sw-steps">
      {#each steps as s, i}
        <div class="sw-step" class:sw-step--active={step >= s.num} class:sw-step--current={step === s.num}>
          <div class="sw-step-circle">{step > s.num ? '✓' : s.num}</div>
          <span class="sw-step-label">{lang === 'en' ? s.labelEn : s.labelFa}</span>
          {#if i < steps.length - 1}
            <div class="sw-step-line" class:sw-step-line--done={step > s.num}></div>
          {/if}
        </div>
      {/each}
    </div>

    {#if error}
      <div class="sw-err">{error}</div>
    {/if}

    <div class="sw-body">
      {#if step === 1}
        <div class="sw-fg">
          <label class="sw-lb" for="s-username">{lang === 'en' ? 'Username' : 'نام کاربری'}</label>
          <input id="s-username" type="text" class="sw-in" autocomplete="off" bind:value={form.username} placeholder="admin" />
        </div>
        <div class="sw-fg">
          <label class="sw-lb" for="s-display">{lang === 'en' ? 'Display Name' : 'نام نمایشی'}</label>
          <input id="s-display" type="text" class="sw-in" autocomplete="off" bind:value={form.displayName} placeholder={lang === 'en' ? 'Wiki Admin' : 'مدیر ویکی'} />
        </div>
        <div class="sw-fg">
          <label class="sw-lb" for="s-pass">{lang === 'en' ? 'Password' : 'رمز عبور'}</label>
          <input id="s-pass" type="password" class="sw-in" autocomplete="off" bind:value={form.password} placeholder="••••••••" />
        </div>
        <div class="sw-fg">
          <label class="sw-lb" for="s-cpass">{lang === 'en' ? 'Confirm Password' : 'تکرار رمز عبور'}</label>
          <input id="s-cpass" type="password" class="sw-in" autocomplete="off" bind:value={form.confirmPassword} placeholder="••••••••" />
        </div>
      {:else if step === 2}
        <div class="sw-fg">
          <label class="sw-lb">{lang === 'en' ? 'Default Language' : 'زبان پیش‌فرض'}</label>
          <div class="sw-lg">
            {#each LANGS as l}
              <button class="sw-lb2" class:sw-lb2--a={form.defaultLanguage === l.code} onclick={() => form.defaultLanguage = l.code} type="button">
                {l.name[lang] || l.code}
              </button>
            {/each}
          </div>
        </div>
        <div class="sw-fg">
          <label class="sw-lb">{lang === 'en' ? 'Extra Languages' : 'زبان‌های اضافی'}</label>
          <div class="sw-lg">
            {#each LANGS.filter(l => l.code !== form.defaultLanguage) as l}
              <button class="sw-lb2" class:sw-lb2--a={form.extraLanguages.some(el => el.code === l.code)} onclick={() => toggleLang(l.code)} type="button">
                {l.name[lang] || l.code}
              </button>
            {/each}
          </div>
        </div>
      {:else if step === 3}
        <div class="sw-fg">
          <label class="sw-lb" for="s-wtitle">{lang === 'en' ? 'Wiki Title' : 'نام ویکی'}</label>
          <input id="s-wtitle" type="text" class="sw-in" autocomplete="off" bind:value={form.wikiTitle} placeholder={lang === 'en' ? 'My Wiki' : 'ویکی من'} />
        </div>
        <div class="sw-fg">
          <label class="sw-lb">{lang === 'en' ? 'Wiki Icon' : 'آیکون ویکی'}</label>
          <div class="sw-icp">
            {#if form.wikiIcon}
              <img src={form.wikiIcon} alt="icon" class="sw-icm" />
              <button class="sw-icx" onclick={removeIcon} type="button">✕</button>
            {:else}
              <span class="sw-icd">◆</span>
            {/if}
          </div>
          <label class="sw-icl" for="s-icon">
            <input id="s-icon" type="file" accept="image/*" class="sw-icf" onchange={handleIconUpload} />
            {lang === 'en' ? 'Choose Image' : 'انتخاب تصویر'}
          </label>
        </div>
      {/if}
    </div>

    <div class="sw-btns">
      {#if step > 1}
        <button class="sw-btn sw-btn--sec" onclick={prevStep} type="button">
          &#8592; {lang === 'en' ? 'Back' : 'قبلی'}
        </button>
      {/if}
      <button class="sw-btn sw-btn--pri" onclick={nextStep} type="button" disabled={loading}>
        {#if loading}
          <span class="sw-sp"></span>
        {:else}
          {step === 3 ? (lang === 'en' ? 'Install' : 'نصب') : (lang === 'en' ? 'Next' : 'بعدی')}
          {step < 3 ? ' →' : ''}
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .sw{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .sw-c{width:clamp(360px,42vw,540px);background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:clamp(1.5rem,5vw,2.5rem) clamp(1.25rem,4vw,2rem);box-shadow:var(--shadow-xl);max-height:calc(100% - 2rem);overflow-y:auto}
  .sw-h{text-align:center;margin-bottom:1.5rem;position:relative}
  .sw-tt{position:absolute;top:-0.5rem;right:-0.5rem;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid var(--color-border);border-radius:50%;background:var(--color-bg-secondary);color:var(--color-text-secondary);cursor:pointer;transition:all var(--transition-fast)}
  .sw-tt:hover{background:var(--color-bg-hover);color:var(--color-accent)}
  .sw-t{font-size:clamp(1.3rem,4vw,1.8rem);color:var(--color-accent);margin:0;font-weight:800}
  .sw-st{color:var(--color-text-muted);font-size:var(--font-size-sm);margin:0.35rem 0 0}
  .sw-steps{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:1.5rem}
  .sw-step{display:flex;align-items:center;gap:0.35rem;position:relative}
  .sw-step-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;border:2px solid var(--color-border);color:var(--color-text-muted);background:var(--color-bg-primary);flex-shrink:0;transition:all var(--transition-fast)}
  .sw-step--active .sw-step-circle{border-color:var(--color-accent);color:var(--color-accent)}
  .sw-step--current .sw-step-circle{background:var(--color-accent);color:var(--color-accent-text);border-color:var(--color-accent)}
  .sw-step-label{font-size:var(--font-size-xs);color:var(--color-text-muted);white-space:nowrap}
  .sw-step--active .sw-step-label{color:var(--color-text-primary)}
  .sw-step-line{width:clamp(20px,4vw,40px);height:2px;background:var(--color-border);margin:0 0.35rem}
  .sw-step-line--done{background:var(--color-accent)}
  .sw-err{padding:0.5rem 0.8rem;background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-sm);color:#dc2626;font-size:var(--font-size-sm);margin-bottom:1rem;text-align:center}
  :global([data-theme="dark"]) .sw-err{background:#450a0a;border-color:#7f1d1d;color:#fca5a5}
  .sw-body{display:flex;flex-direction:column;gap:0.9rem;margin-bottom:1.5rem;min-height:120px}
  .sw-fg{display:flex;flex-direction:column;gap:0.3rem}
  .sw-lb{font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-secondary)}
  .sw-in{width:100%;padding:0.6rem 0.8rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);color:var(--color-text-primary);font-family:var(--font-body);font-size:var(--font-size-base);outline:none;box-sizing:border-box;transition:border var(--transition-fast)}
  .sw-in:focus{border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-bg)}
  .sw-lg{display:flex;gap:0.5rem;flex-wrap:wrap}
  .sw-lb2{padding:0.45rem 1rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);color:var(--color-text-secondary);font-family:var(--font-body);font-size:var(--font-size-sm);cursor:pointer;transition:all var(--transition-fast)}
  .sw-lb2--a{border-color:var(--color-accent);background:var(--color-accent-bg);color:var(--color-accent);font-weight:600}
  .sw-lb2:hover:not(.sw-lb2--a){border-color:var(--color-accent);color:var(--color-accent)}
  .sw-icp{display:flex;align-items:center;gap:0.5rem;margin-top:0.2rem}
  .sw-icm{width:56px;height:56px;border-radius:var(--radius-md);object-fit:cover;border:1px solid var(--color-border)}
  .sw-icx{border:none;background:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-sm);padding:0}
  .sw-icx:hover{color:var(--color-danger)}
  .sw-icd{font-size:2.2rem;color:var(--color-accent);line-height:1.2}
  .sw-icl{display:inline-block;margin-top:0.4rem;padding:0.35rem 0.7rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs);font-weight:600;cursor:pointer;width:fit-content}
  .sw-icf{display:none}
  .sw-btns{display:flex;gap:0.75rem;justify-content:flex-end}
  .sw-btn{padding:0.6rem 1.5rem;border-radius:var(--radius-md);font-family:var(--font-body);font-size:var(--font-size-sm);font-weight:600;cursor:pointer;transition:all var(--transition-fast)}
  .sw-btn--pri{border:none;background:var(--color-accent);color:var(--color-accent-text)}
  .sw-btn--pri:hover{background:var(--color-accent-dark)}
  .sw-btn--pri:disabled{opacity:0.6;cursor:not-allowed}
  .sw-btn--sec{border:1px solid var(--color-border);background:var(--color-bg-secondary);color:var(--color-text-secondary)}
  .sw-btn--sec:hover{background:var(--color-bg-hover)}
  .sw-sp{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:swsp 0.6s linear infinite}
  @keyframes swsp{to{transform:rotate(360deg)}}
  @media(max-width:480px){
    .sw-c{padding:1.25rem 1rem}
    .sw-steps{gap:0.25rem}
    .sw-step-label{display:none}
    .sw-step-line{width:16px}
  }
</style>
