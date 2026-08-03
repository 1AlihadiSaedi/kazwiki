<script>
import { sha256 } from '../logic/crypto.js';
import { saveSiteConfig } from '../logic/config.js';
import { DEFAULT_ROLES, DEFAULT_TRANSLATIONS, SITE_DEFAULTS } from '../config.js';

let { onComplete } = $props();

let step = $state(1);
let error = $state('');
let lang = $state('en');
let theme = $state('dark');

let form = $state({
  username: '',
  password: '',
  displayName: '',
  defaultLanguage: 'en',
  languages: ['fa'],
  wikiTitle: '',
  wikiIcon: ''
});

const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'fa', name: '\u0641\u0627\u0631\u0633\u06cc' },
  { code: 'ar', name: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
  { code: 'tr', name: 'T\u00fcrk\u00e7e' },
  { code: 'ru', name: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
  { code: 'zh', name: '\u4e2d\u6587' },
  { code: 'ja', name: '\u65e5\u672c\u8a9e' },
  { code: 'ko', name: '\ud55c\uad6d\uc5b4' },
  { code: 'fr', name: 'Fran\u00e7ais' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Espa\u00f1ol' },
  { code: 'it', name: 'Italiano' },
];

function t(key) {
  const map = {
    en: {
      installerTitle: 'Initial Setup',
      installerSub: 'Configure your wiki for the first time',
      stepAdmin: 'Admin Info',
      stepLang: 'Language Settings',
      stepBranding: 'Branding',
      stepReview: 'Review & Confirm',
      adminUser: 'Admin username',
      adminPass: 'Admin password',
      adminName: 'Display name',
      defaultLang: 'Default language',
      extraLangs: 'Additional languages',
      addLang: 'Add language',
      wikiTitle: 'Wiki title',
      wikiIcon: 'Wiki icon',
      chooseIcon: 'Choose icon',
      defaultIcon: 'Default icon',
      install: 'Install & Start',
      confirmTitle: 'Confirm Settings',
      confirmMsg: 'The following settings will be saved',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      displayNameLabel: 'Display name',
      langLabel: 'Language',
      mainLangLabel: 'Main language',
      wikiNameLabel: 'Wiki name',
      iconLabel: 'Icon',
      back: 'Back',
      next: 'Next',
      passwordRequired: 'Password is required',
      usernameRequired: 'Username is required',
      usernameLen: 'Username must be at least 3 characters',
      passwordLen: 'Password must be at least 6 characters',
      displayNameRequired: 'Display name is required'
    },
    fa: {
      installerTitle: '\u0646\u0635\u0628 \u0627\u0648\u0644\u06cc\u0647',
      installerSub: '\u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u0627\u0648\u0644\u06cc\u0647 \u0648 \u0645\u062f\u06cc\u0631\u06cc\u062a \u0648\u06cc\u06a9\u06cc',
      stepAdmin: '\u0627\u0637\u0644\u0627\u0639\u0627\u062a \u0645\u062f\u06cc\u0631',
      stepLang: '\u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u0632\u0628\u0627\u0646',
      stepBranding: '\u0646\u0627\u0645 \u0648 \u0646\u0634\u0627\u0646',
      stepReview: '\u0628\u0631\u0631\u0633\u06cc \u0648 \u062a\u0623\u06cc\u06cc\u062f',
      adminUser: '\u0646\u0627\u0645 \u06a9\u0627\u0631\u0628\u0631\u06cc \u0645\u062f\u06cc\u0631',
      adminPass: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631',
      adminName: '\u0646\u0627\u0645 \u0646\u0645\u0627\u06cc\u0634\u06cc',
      defaultLang: '\u0632\u0628\u0627\u0646 \u067e\u06cc\u0634\u200c\u0641\u0631\u0636',
      extraLangs: '\u0632\u0628\u0627\u0646\u200c\u0647\u0627\u06cc \u0627\u0636\u0627\u0641\u0647',
      addLang: '\u0627\u0641\u0632\u0648\u062f\u0646 \u0632\u0628\u0627\u0646',
      wikiTitle: '\u0646\u0627\u0645 \u0648\u06cc\u06a9\u06cc',
      wikiIcon: '\u0622\u06cc\u06a9\u0648\u0646 \u0648\u06cc\u06a9\u06cc',
      chooseIcon: '\u0627\u0646\u062a\u062e\u0627\u0628 \u0622\u06cc\u06a9\u0648\u0646',
      defaultIcon: '\u0622\u06cc\u06a9\u0648\u0646 \u067e\u06cc\u0634\u200c\u0641\u0631\u0636',
      install: '\u0646\u0635\u0628 \u0648 \u0634\u0631\u0648\u0639',
      confirmTitle: '\u062a\u0623\u06cc\u06cc\u062f \u062a\u0646\u0638\u06cc\u0645\u0627\u062a',
      confirmMsg: '\u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u0632\u06cc\u0631 \u0630\u062e\u06cc\u0631\u0647 \u062e\u0648\u0627\u0647\u062f \u0634\u062f',
      usernameLabel: '\u0646\u0627\u0645 \u06a9\u0627\u0631\u0628\u0631\u06cc',
      passwordLabel: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631',
      displayNameLabel: '\u0646\u0627\u0645 \u0646\u0645\u0627\u06cc\u0634\u06cc',
      langLabel: '\u0632\u0628\u0627\u0646',
      mainLangLabel: '\u0632\u0628\u0627\u0646 \u0627\u0635\u0644\u06cc',
      wikiNameLabel: '\u0646\u0627\u0645 \u0648\u06cc\u06a9\u06cc',
      iconLabel: '\u0622\u06cc\u06a9\u0648\u0646',
      back: '\u0628\u0627\u0632\u06af\u0634\u062a',
      next: '\u0628\u0639\u062f\u06cc',
      passwordRequired: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0644\u0632\u0627\u0645\u06cc \u0627\u0633\u062a',
      usernameRequired: '\u0646\u0627\u0645 \u06a9\u0627\u0631\u0628\u0631\u06cc \u0627\u0644\u0632\u0627\u0645\u06cc \u0627\u0633\u062a',
      usernameLen: '\u0646\u0627\u0645 \u06a9\u0627\u0631\u0628\u0631\u06cc \u0628\u0627\u06cc\u062f \u062d\u062f\u0627\u0642\u0644 \u06f3 \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631 \u0628\u0627\u0634\u062f',
      passwordLen: '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0628\u0627\u06cc\u062f \u062d\u062f\u0627\u0642\u0644 \u06f6 \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631 \u0628\u0627\u0634\u062f',
      displayNameRequired: '\u0646\u0627\u0645 \u0646\u0645\u0627\u06cc\u0634\u06cc \u0627\u0644\u0632\u0627\u0645\u06cc \u0627\u0633\u062a'
    }
  };
  return map[lang]?.[key] || map.en[key] || key;
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

function handleIconUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    error = 'Please select an image file';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.wikiIcon = reader.result;
    error = '';
  };
  reader.readAsDataURL(file);
}

function removeIcon() {
  form.wikiIcon = '';
}

async function handleInstall() {
  error = '';
  const pwHash = await sha256(form.password);
  const uh = await sha256(form.username.trim().toLowerCase());
  try {
    const r = await fetch('/api/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uh,
        ph: pwHash,
        dn: form.displayName || 'Admin',
        defaultLanguage: form.defaultLanguage,
        languages: [form.defaultLanguage, ...form.languages.filter(l => l !== form.defaultLanguage)],
        homePage: 'home',
        title: { en: form.wikiTitle || 'Emerald Wiki', fa: form.wikiTitle || '\u0648\u06cc\u06a9\u06cc \u0632\u0645\u0631\u062f\u06cc\u0646' },
        icon: form.wikiIcon || '',
        theme
      })
    });
    const d = await r.json();
    if (d.ok) {
      localStorage.setItem('emerald-wiki-users', JSON.stringify([{
        username: 'root',
        usernameHash: uh,
        displayName: form.displayName || 'Admin',
        passwordHash: pwHash,
        role: 'admin',
        createdAt: new Date().toISOString()
      }]));
      localStorage.setItem('emerald-wiki-roles', JSON.stringify(DEFAULT_ROLES));
      localStorage.setItem('emerald-wiki-i18n', JSON.stringify(DEFAULT_TRANSLATIONS));
      localStorage.setItem('emerald-wiki-version', '3');
      onComplete?.();
      window.location.hash = '#/fa/home';
      window.location.reload();
    } else {
      error = d.error || 'Install failed';
    }
  } catch (e) {
    error = e.message || 'Install failed';
  }
}
</script>

<div class="sw">
  <div class="swc">
    <div class="swh">
      <h1 class="swt">{t('installerTitle')}</h1>
      <p class="sws">{t('installerSub')}</p>
      <button class="ttb" onclick={toggleTheme} aria-label="Toggle theme" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
        {#if theme === 'dark'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        {/if}
      </button>
    </div>

    <div class="sws2">
      <div class="sws2i" class:sws2i--a={step >= 1}>1</div>
      <div class="sws2l" class:sws2l--a={step >= 2}></div>
      <div class="sws2i" class:sws2i--a={step >= 2}>2</div>
      <div class="sws2l" class:sws2l--a={step >= 3}></div>
      <div class="sws2i" class:sws2i--a={step >= 3}>3</div>
      <div class="sws2l" class:sws2l--a={step >= 4}></div>
      <div class="sws2i" class:sws2i--a={step >= 4}>4</div>
    </div>

    <div class="swb">
      {#if step === 1}
        <div class="sw-fg">
          <label class="sfl" for="sw-un">{t('adminUser')}</label>
          <input id="sw-un" class="sfi" type="text" bind:value={form.username} placeholder="admin" autocomplete="off" />
        </div>
        <div class="sw-fg">
          <label class="sfl" for="sw-pw">{t('adminPass')}</label>
          <input id="sw-pw" class="sfi" type="password" bind:value={form.password} placeholder="password" autocomplete="off" />
        </div>
        <div class="sw-fg">
          <label class="sfl" for="sw-dn">{t('adminName')}</label>
          <input id="sw-dn" class="sfi" type="text" bind:value={form.displayName} placeholder="Admin" autocomplete="off" />
        </div>

      {:else if step === 2}
        <div class="sw-fg">
          <label class="sfl" for="sw-dl">{t('defaultLang')}</label>
          <select id="sw-dl" class="sfi" bind:value={form.defaultLanguage}>
            {#each LANGS as l}
              <option value={l.code}>{l.name}</option>
            {/each}
          </select>
        </div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <div class="sw-fg">
          <label class="sfl">{t('extraLangs')}</label>
          <div class="sw-lg">
            {#each LANGS.filter(l => l.code !== form.defaultLanguage) as l}
              <label class="sw-lang">
                <input type="checkbox" checked={form.languages.includes(l.code)} onchange={e => {
                  if (e.target.checked) form.languages = [...form.languages, l.code];
                  else form.languages = form.languages.filter(c => c !== l.code);
                }} />
                <span>{l.name}</span>
              </label>
            {/each}
          </div>
        </div>

      {:else if step === 3}
        <div class="sw-fg">
          <label class="sfl" for="sw-wt">{t('wikiTitle')}</label>
          <input id="sw-wt" class="sfi" type="text" bind:value={form.wikiTitle} placeholder="Emerald Wiki" autocomplete="off" />
        </div>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <div class="sw-fg">
          <label class="sfl">{t('wikiIcon')}</label>
          <div class="sw-icp">
            {#if form.wikiIcon}
              <img src={form.wikiIcon} alt="wiki icon" class="sw-img" />
              <button class="sw-rem" onclick={removeIcon}>x</button>
            {:else}
              <span class="sw-dfi">&#9670; {t('defaultIcon')}</span>
            {/if}
          </div>
          <label class="sab2" for="sw-ic">
            <input id="sw-ic" type="file" accept="image/*" class="sif2" onchange={handleIconUpload} />
            {t('chooseIcon')}
          </label>
        </div>

      {:else if step === 4}
        <div class="sw-ct">
          <h3>{t('confirmTitle')}</h3>
          <p>{t('confirmMsg')}</p>
        </div>
        <div class="sw-cg">
          <div class="srr"><span class="srk">{t('usernameLabel')}</span><span class="srv2" dir="ltr">{form.username}</span></div>
          <div class="srr"><span class="srk">{t('passwordLabel')}</span><span class="srv2">****</span></div>
          <div class="srr"><span class="srk">{t('displayNameLabel')}</span><span class="srv2">{form.displayName}</span></div>
          <div class="srr"><span class="srk">{t('mainLangLabel')}</span><span class="srv2">{LANGS.find(l => l.code === form.defaultLanguage)?.name || form.defaultLanguage}</span></div>
          {#each form.languages.filter(l => l !== form.defaultLanguage) as el}
            <div class="srr"><span class="srk">{t('langLabel')}</span><span class="srv2">{LANGS.find(l => l.code === el)?.name || el} ({el})</span></div>
          {/each}
          <div class="srr"><span class="srk">{t('wikiNameLabel')}</span><span class="srv2">{form.wikiTitle || 'Emerald Wiki'}</span></div>
          <div class="srr"><span class="srk">{t('iconLabel')}</span>
            {#if form.wikiIcon}
              <img src={form.wikiIcon} alt="icon" class="sw-ic2" />
            {:else}
              <span class="srv2">{t('defaultIcon')}</span>
            {/if}
          </div>
        </div>
      {/if}

      {#if error}
        <div class="swe">{error}</div>
      {/if}

      <div class="swa">
        {#if step > 1}
          <button class="swa-back" onclick={() => step--}>{t('back')}</button>
        {/if}
        {#if step < 4}
          <button class="swa-next" onclick={() => {
            error = '';
            if (step === 1) {
              if (!form.username.trim()) { error = t('usernameRequired'); return; }
              if (form.username.trim().length < 3) { error = t('usernameLen'); return; }
              if (!form.password) { error = t('passwordRequired'); return; }
              if (form.password.length < 6) { error = t('passwordLen'); return; }
              if (!form.displayName.trim()) { error = t('displayNameRequired'); return; }
            }
            step++;
          }}>{t('next')}</button>
        {:else}
          <button class="swa-install" onclick={handleInstall}>{t('install')}</button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .sw{display:flex;justify-content:center;align-items:center;min-height:100vh;padding:1.5rem;box-sizing:border-box}
  .swc{width:100%;max-width:460px}
  .swh{text-align:center;margin-bottom:1.5rem;position:relative}
  .swt{font-size:1.5rem;color:var(--color-accent);margin:0 0 0.25rem}
  .sws{font-size:0.85rem;color:var(--color-text-muted);margin:0}
  .ttb{position:absolute;top:-0.25rem;right:0;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid var(--color-border);border-radius:var(--radius-full);background:var(--color-bg-primary);color:var(--color-text-secondary);cursor:pointer;transition:all var(--transition-fast)}
  .ttb:hover{background:var(--color-bg-hover);color:var(--color-accent)}
  .sws2{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:1.5rem}
  .sws2i{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;background:var(--color-bg-secondary);color:var(--color-text-muted);border:2px solid var(--color-border);transition:all var(--transition-normal)}
  .sws2i--a{background:var(--color-accent);color:var(--color-accent-text);border-color:var(--color-accent)}
  .sws2l{width:40px;height:2px;background:var(--color-border);transition:all var(--transition-normal)}
  .sws2l--a{background:var(--color-accent)}
  .swb{background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:1.5rem;box-shadow:var(--shadow-sm)}
  .sw-fg{margin-bottom:1.25rem}
  .sfl{display:block;font-size:0.8rem;font-weight:600;color:var(--color-text-secondary);margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.04em}
  .sfi{width:100%;padding:0.6rem 0.75rem;border:1px solid var(--color-border);border-radius:var(--radius-md);font-family:var(--font-body);font-size:0.9rem;background:var(--color-bg-secondary);color:var(--color-text-primary);outline:none;box-sizing:border-box;transition:border-color var(--transition-fast)}
  .sfi:focus{border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-bg)}
  .sw-lg{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.25rem}
  .sw-lang{display:flex;align-items:center;gap:0.35rem;padding:0.35rem 0.65rem;border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:0.8rem;cursor:pointer;transition:all var(--transition-fast)}
  .sw-lang:hover{background:var(--color-bg-hover)}
  .sw-lang:has(input:checked){border-color:var(--color-accent);background:var(--color-accent-bg);color:var(--color-accent)}
  .sw-lang input[type="checkbox"]{accent-color:var(--color-accent)}
  .sw-icp{display:flex;align-items:center;gap:0.5rem;margin:0.3rem 0}
  .sw-img{width:48px;height:48px;border-radius:var(--radius-md);object-fit:cover;border:1px solid var(--color-border)}
  .sw-rem{width:20px;height:20px;border:none;border-radius:50%;background:var(--color-border);color:var(--color-text-secondary);font-size:0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .sw-rem:hover{background:var(--color-danger);color:#fff}
  .sw-dfi{font-size:0.8rem;color:var(--color-text-muted)}
  .sab2{display:inline-block;padding:0.35rem 0.7rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent-bg);color:var(--color-accent);font-size:0.8rem;font-weight:600;cursor:pointer;margin-top:0.35rem}
  .sif2{display:none}
  .sw-ct{text-align:center;margin-bottom:1rem}
  .sw-ct h3{font-size:1.1rem;color:var(--color-text-primary);margin:0 0 0.35rem}
  .sw-ct p{font-size:0.8rem;color:var(--color-text-muted);margin:0}
  .sw-cg{background:var(--color-bg-secondary);border-radius:var(--radius-md);padding:1rem;margin-bottom:1rem}
  .srr{display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;font-size:0.8rem;border-bottom:1px solid var(--color-border)}
  .srr:last-child{border-bottom:none}
  .srk{color:var(--color-text-muted)}
  .srv2{color:var(--color-text-primary);font-weight:500}
  .sw-ic2{width:24px;height:24px;border-radius:var(--radius-sm);object-fit:cover}
  .swe{background:#fef2f2;color:#dc2626;padding:0.65rem 1rem;border-radius:var(--radius-md);font-size:0.8rem;margin-bottom:1rem;text-align:center}
  .swa{display:flex;gap:0.75rem;margin-top:1rem}
  .swa-back{flex:1;padding:0.65rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);color:var(--color-text-secondary);font-family:var(--font-body);font-size:0.9rem;cursor:pointer}
  .swa-back:hover{background:var(--color-bg-hover)}
  .swa-next{flex:2;padding:0.65rem;border:none;border-radius:var(--radius-md);background:var(--color-accent);color:var(--color-accent-text);font-family:var(--font-body);font-size:0.9rem;font-weight:600;cursor:pointer}
  .swa-next:hover{background:var(--color-accent-dark)}
  .swa-install{flex:2;padding:0.65rem;border:none;border-radius:var(--radius-md);background:#059669;color:#fff;font-family:var(--font-body);font-size:0.9rem;font-weight:600;cursor:pointer}
  .swa-install:hover{background:#047857}
  @media(max-width:480px){.sw{padding:1rem}.swb{padding:1rem}}
</style>
