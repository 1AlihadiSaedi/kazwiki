<script>
import { sha256 } from '../logic/crypto.js';
import { saveSiteConfig } from '../logic/config.js';
import { DEFAULT_ROLES, DEFAULT_TRANSLATIONS, SITE_DEFAULTS } from '../config.js';
import { getTheme, setTheme, initTheme } from '../logic/theme.js';

let step = $state(1);
let error = $state('');
let success = $state(false);
let theme = $state(getTheme());

let form = $state({
  username: '',
  password: '',
  displayName: '',
  defaultLanguage: 'en',
  extraLanguages: [],
  wikiTitle: '',
  wikiIcon: ''
});

let newLangCode = $state('');
let newLangName = $state('');

const lang = 'en';
function t(key) {
  const d = DEFAULT_TRANSLATIONS.en?.translations || {};
  return d[key] || key;
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
}

function validateStep1() {
  if (!form.username || form.username.length < 3) return t('usernameLen');
  if (!form.password || form.password.length < 6) return t('passwordLen');
  if (!form.displayName || form.displayName.trim() === '') return t('displayNameRequired');
  return null;
}

function handleNext() {
  error = '';
  if (step === 1) {
    const err = validateStep1();
    if (err) { error = err; return; }
  }
  step++;
}

function handleInstall() {
  error = '';
  const ph = sha256(form.password);
  const uh = sha256(form.username);
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
  localStorage.setItem('emerald-wiki-version', '2');
  try {
    fetch('/api/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uh, ph, dn: form.displayName })
    });
  } catch {}
  success = true;
  setTimeout(() => window.location.reload(), 1200);
}

function addExtraLang() {
  if (!newLangCode || !newLangName) return;
  if (form.extraLanguages.find(l => l.code === newLangCode)) return;
  form.extraLanguages = [...form.extraLanguages, { code: newLangCode, name: newLangName }];
  newLangCode = '';
  newLangName = '';
}

function removeExtraLang(code) {
  form.extraLanguages = form.extraLanguages.filter(l => l.code !== code);
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

const totalSteps = 4;
</script>

{#if success}
<div class="swok"><div class="swokc"><span class="swokl">&#10003;</span><h2>Setup complete!</h2><p>Starting wiki...</p></div></div>
{:else}
<div class="sw"><div class="swc">

<div class="swh">
  <div class="swhr">
    <div class="swl">&#9670;</div>
    <button class="ttb" onclick={toggleTheme} aria-label="Toggle theme" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      {#if theme === 'dark'}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      {/if}
    </button>
  </div>
  <h1 class="swt">{t('installerTitle')}</h1>
  <p class="sws">{t('installerSub')}</p>
</div>

<div class="sind">
  {#each Array(totalSteps) as _, i}
    <div class="sid" class:sid--a={step > i + 1} class:sid--c={step === i + 1}>{i + 1}</div>
    {#if i < totalSteps - 1}<div class="sil" class:sil--a={step > i + 1}></div>{/if}
  {/each}
</div>

<div class="slb">
  <span class:slbl--a={step >= 1}>{t('stepAdmin')}</span>
  <span class:slbl--a={step >= 2}>{t('stepLang')}</span>
  <span class:slbl--a={step >= 3}>{t('stepBranding')}</span>
  <span class:slbl--a={step >= 4}>{t('stepReview')}</span>
</div>

<div class="scb">
  {#if error}<div class="se2">{error}</div>{/if}

  {#if step === 1}
    <div class="sfg">
      <label class="sfl" for="sw-un">{t('adminUser')}</label>
      <input id="sw-un" class="sfi" type="text" bind:value={form.username} autocomplete="off" dir="ltr" />
    </div>
    <div class="sfg">
      <label class="sfl" for="sw-pw">{t('adminPass')}</label>
      <input id="sw-pw" class="sfi" type="password" bind:value={form.password} autocomplete="off" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" />
    </div>
    <div class="sfg">
      <label class="sfl" for="sw-dn">{t('adminName')}</label>
      <input id="sw-dn" class="sfi" type="text" bind:value={form.displayName} autocomplete="off" />
    </div>

  {:else if step === 2}
    <div class="sfg">
      <label class="sfl" for="sw-dl">{t('defaultLang')}</label>
      <select id="sw-dl" class="sfi" bind:value={form.defaultLanguage}>
        <option value="en">English (en)</option>
        <option value="fa">Persian (fa)</option>
      </select>
    </div>
    <div class="sfg">
      <label class="sfl">{t('extraLangs')}</label>
      <div class="sad">
        <input id="sw-lc" class="sfi swi" type="text" placeholder="code" bind:value={newLangCode} autocomplete="off" />
        <input class="sfi swi" type="text" placeholder="name" bind:value={newLangName} autocomplete="off" />
        <button class="sab" onclick={addExtraLang}>+ {t('addLang')}</button>
      </div>
      {#if form.extraLanguages.length > 0}
        <div class="sel">
          {#each form.extraLanguages as el}
            <span class="set">{el.code} - {el.name} <button class="sex" onclick={() => removeExtraLang(el.code)}>x</button></span>
          {/each}
        </div>
      {/if}
    </div>

  {:else if step === 3}
    <div class="sfg">
      <label class="sfl" for="sw-wt">{t('wikiTitle')}</label>
      <input id="sw-wt" class="sfi" type="text" bind:value={form.wikiTitle} autocomplete="off" placeholder="Emerald Wiki" />
    </div>
    <div class="sfg">
      <label class="sfl">{t('wikiIcon')}</label>
      {#if form.wikiIcon}
        <div class="sip">
          <img src={form.wikiIcon} alt="Wiki icon preview" class="sip-img" />
          <button class="sex sir" onclick={removeIcon}>x</button>
        </div>
      {:else}
        <div class="sip sip--def">
          <span class="sidf">&#9670;</span>
          <span class="sidt">{t('defaultIcon')}</span>
        </div>
      {/if}
      <label class="sab2" for="sw-ic">
        <input id="sw-ic" type="file" accept="image/*" class="sif2" onchange={handleIconUpload} />
        {t('chooseIcon')}
      </label>
    </div>

  {:else}
    <div class="srv">
      <h3 class="srt">{t('confirmTitle')}</h3>
      <p class="srs">{t('confirmMsg')}</p>
      <div class="src">
        <div class="srr"><span class="srk">{t('usernameLabel')}</span><span class="srv2" dir="ltr">{form.username}</span></div>
        <div class="srr"><span class="srk">{t('passwordLabel')}</span><span class="srv2">****</span></div>
        <div class="srr"><span class="srk">{t('displayNameLabel')}</span><span class="srv2">{form.displayName}</span></div>
        <div class="srr"><span class="srk">{t('mainLangLabel')}</span><span class="srv2">{form.defaultLanguage === 'fa' ? 'Persian' : 'English'}</span></div>
        {#each form.extraLanguages as el}
          <div class="srr"><span class="srk">{t('langLabel')}</span><span class="srv2">{el.name} ({el.code})</span></div>
        {/each}
        <div class="srr"><span class="srk">{t('wikiNameLabel')}</span><span class="srv2">{form.wikiTitle || 'Emerald Wiki'}</span></div>
        <div class="srr"><span class="srk">{t('iconLabel')}</span>
          {#if form.wikiIcon}
            <span class="srv2"><img src={form.wikiIcon} alt="icon" class="sric" /></span>
          {:else}
            <span class="srv2">{t('defaultIcon')} &#9670;</span>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<div class="snb">
  {#if step > 1}
    <button class="snb2" onclick={() => step--}>{t('backToHome')}</button>
  {/if}
  {#if step < totalSteps}
    <button class="snp" onclick={handleNext}>Next</button>
  {:else}
    <button class="snp snp--go" onclick={handleInstall}>{t('install')}</button>
  {/if}
</div>

</div></div>
{/if}

<style>
.sw{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow-y:auto;background:var(--color-bg-secondary)}
.swc{width:clamp(340px,40vw,540px);background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:clamp(1.5rem,4vw,2rem);box-shadow:var(--shadow-lg);margin:1rem}
.swh{text-align:center;margin-bottom:1.5rem;position:relative}
.swhr{display:flex;align-items:center;justify-content:center;gap:0.5rem}
.swl{font-size:2.5rem;color:var(--color-accent);line-height:1}
.swt{font-size:clamp(1.1rem,3vw,1.4rem);color:var(--color-accent);margin:0.3rem 0 0}
.sws{color:var(--color-text-muted);font-size:var(--font-size-sm);margin:0.2rem 0 0}
.ttb{position:absolute;right:0;top:0;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);cursor:pointer;color:var(--color-text-secondary);transition:all var(--transition-fast)}
.ttb:hover{background:var(--color-bg-hover);color:var(--color-accent)}
.sind{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:0.5rem}
.sid{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--font-size-xs);font-weight:700;border:2px solid var(--color-border);color:var(--color-text-muted)}
.sid--a{background:var(--color-accent);border-color:var(--color-accent);color:var(--color-accent-text)}
.sid--c{border-color:var(--color-accent);color:var(--color-accent)}
.sil{width:30px;height:2px;background:var(--color-border)}
.sil--a{background:var(--color-accent)}
.slb{display:flex;justify-content:space-between;margin-bottom:1.5rem;font-size:var(--font-size-xs);color:var(--color-text-muted);padding:0 0.25rem}
.slbl--a{color:var(--color-accent);font-weight:600}
.scb{min-height:160px}
.se2{padding:0.5rem 0.75rem;border-radius:var(--radius-sm);background:#fef2f2;color:#dc2626;font-size:var(--font-size-sm);margin-bottom:0.75rem}
:global([data-theme="dark"]) .se2{background:#450a0a;color:#fca5a5}
.sfg{margin-bottom:0.85rem}
.sfl{display:block;font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-secondary);margin-bottom:0.3rem}
.sfi{width:100%;padding:0.55rem 0.7rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);color:var(--color-text-primary);font-family:var(--font-body);font-size:var(--font-size-base);outline:none;box-sizing:border-box}
.sfi:focus{border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-bg)}
.sad{display:flex;gap:0.4rem;margin-bottom:0.4rem}
.swi{flex:1}
.sab{padding:0.5rem 0.8rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs);font-weight:600;cursor:pointer;white-space:nowrap}
.sab2{display:inline-block;padding:0.5rem 0.8rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs);font-weight:600;cursor:pointer;margin-top:0.4rem}
.sif2{display:none}
.sel{display:flex;flex-wrap:wrap;gap:0.4rem}
.set{display:inline-flex;align-items:center;gap:0.3rem;padding:0.25rem 0.5rem;border-radius:999px;background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs)}
.sex{border:none;background:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-xs);padding:0}
.sex:hover{color:var(--color-danger)}
.sip{display:flex;align-items:center;gap:0.6rem;padding:0.5rem;border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:0.3rem}
.sip--def{justify-content:flex-start;gap:0.75rem}
.sip-img{width:48px;height:48px;border-radius:var(--radius-sm);object-fit:cover;border:1px solid var(--color-border)}
.sir{font-size:var(--font-size-sm);padding:2px 6px;border-radius:50%;border:1px solid var(--color-border);line-height:1}
.sir:hover{background:#fef2f2;border-color:#dc2626}
.sidf{font-size:2rem;color:var(--color-accent);line-height:1}
.sidt{color:var(--color-text-muted);font-size:var(--font-size-sm)}
.srv{padding:0.5rem 0}
.srt{font-size:var(--font-size-lg);color:var(--color-text-primary);margin:0 0 0.3rem}
.srs{font-size:var(--font-size-sm);color:var(--color-text-muted);margin:0 0 0.8rem}
.src{display:flex;flex-direction:column;gap:0.5rem}
.srr{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border:1px solid var(--color-border);border-radius:var(--radius-sm)}
.srk{font-size:var(--font-size-xs);color:var(--color-text-muted);font-weight:600}
.srv2{font-size:var(--font-size-sm);color:var(--color-text-primary)}
.sric{width:24px;height:24px;border-radius:4px;object-fit:cover;vertical-align:middle}
.snb{display:flex;justify-content:space-between;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--color-border)}
.snb2{padding:0.5rem 1rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:none;color:var(--color-text-secondary);font-size:var(--font-size-sm);cursor:pointer}
.snp{padding:0.5rem 1.5rem;border:none;border-radius:var(--radius-md);background:var(--color-accent);color:var(--color-accent-text);font-size:var(--font-size-sm);font-weight:600;cursor:pointer}
.snp--go{background:#10b981}
.swok{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--color-bg-secondary)}
.swokc{text-align:center}
.swokl{font-size:3rem;color:#10b981}
.swokc h2{color:var(--color-text-primary);margin:0.5rem 0 0}
.swokc p{color:var(--color-text-muted);font-size:var(--font-size-sm)}
</style>