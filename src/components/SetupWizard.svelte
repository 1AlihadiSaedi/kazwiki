<script>
import { sha256 } from '../logic/crypto.js';
import { saveSiteConfig } from '../logic/config.js';
import { DEFAULT_ROLES, DEFAULT_TRANSLATIONS, SITE_DEFAULTS } from '../config.js';

let step = $state(1);
let error = $state('');
let success = $state(false);

let form = $state({ username: 'root', password: '', displayName: 'Admin', defaultLanguage: 'fa', extraLanguages: [] });
let newLangCode = $state('');
let newLangName = $state('');
const lang = 'fa';
function t(key) { const d = DEFAULT_TRANSLATIONS.fa?.translations || {}; return d[key] || key; }

async function handleInstall() {
  error = '';
  if (!form.username || !form.password) { error = 'Username and password required'; return; }
  const ph = await sha256(form.password);
  const uh = await sha256(form.username);
  const langs = ['fa', 'en'];
  for (const el of form.extraLanguages) { if (!langs.includes(el.code)) langs.push(el.code); }
  saveSiteConfig({ username: form.username, passwordHash: ph, displayName: form.displayName, defaultLanguage: form.defaultLanguage, languages: langs, homePage: SITE_DEFAULTS.homePage, title: SITE_DEFAULTS.title });
  localStorage.setItem('emerald-wiki-users', JSON.stringify([{ username: form.username, displayName: form.displayName, passwordHash: ph, role: 'admin', createdAt: new Date().toISOString() }]));
  localStorage.setItem('emerald-wiki-roles', JSON.stringify(DEFAULT_ROLES));
  localStorage.setItem('emerald-wiki-i18n', JSON.stringify(DEFAULT_TRANSLATIONS));
  localStorage.setItem('emerald-wiki-version', '2');
  try { await fetch('/api/install', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uh, ph, dn: form.displayName }) }); } catch {}
  success = true;
  setTimeout(() => window.location.reload(), 1200);
}
function addExtraLang() { if (!newLangCode || !newLangName) return; if (form.extraLanguages.find(l => l.code === newLangCode)) return; form.extraLanguages = [...form.extraLanguages, { code: newLangCode, name: newLangName }]; newLangCode = ''; newLangName = ''; }
function removeExtraLang(code) { form.extraLanguages = form.extraLanguages.filter(l => l.code !== code); }
const totalSteps = 3;
</script>
{#if success}
<div class="swok"><div class="swokc"><span class="swokl">◆</span><h2>Setup complete!</h2><p>Starting wiki...</p></div></div>
{:else}
<div class="sw"><div class="swc"><div class="swh"><div class="swl">◆</div><h1 class="swt">{t('installerTitle')}</h1><p class="sws">{t('installerSub')}</p></div>
<div class="sind">{#each Array(totalSteps) as _, i}<div class="sid" class:sid--a={step > i + 1} class:sid--c={step === i + 1}>{i + 1}</div>{#if i < totalSteps - 1}<div class="sil" class:sil--a={step > i + 1}></div>{/if}{/each}</div>
<div class="slb"><span class:slbl--a={step >= 1}>{t('stepAdmin')}</span><span class:slbl--a={step >= 2}>{t('stepLang')}</span><span class:slbl--a={step >= 3}>{t('stepReview')}</span></div>
<div class="scb">{#if error}<div class="se2">{error}</div>{/if}
{#if step === 1}
<div class="sfg"><label class="sfl" for="sw-un">{t('adminUser')}</label><input id="sw-un" class="sfi" type="text" bind:value={form.username} dir="ltr" /></div>
<div class="sfg"><label class="sfl" for="sw-pw">{t('adminPass')}</label><input id="sw-pw" class="sfi" type="password" bind:value={form.password} placeholder="••••••••" /></div>
<div class="sfg"><label class="sfl" for="sw-dn">{t('adminName')}</label><input id="sw-dn" class="sfi" type="text" bind:value={form.displayName} /></div>
{:else if step === 2}
<div class="sfg"><label class="sfl" for="sw-dl">{t('defaultLang')}</label><select id="sw-dl" class="sfi" bind:value={form.defaultLanguage}><option value="fa">Persian (fa)</option><option value="en">English (en)</option></select></div>
<div class="sfg"><!-- svelte-ignore a11y_label_has_associated_control --><label class="sfl">{t('extraLangs')}</label><div class="sad"><input id="sw-lc" class="sfi swi" type="text" placeholder="code" bind:value={newLangCode} /><input class="sfi swi" type="text" placeholder="name" bind:value={newLangName} /><button class="sab" onclick={addExtraLang}>+ {t('addLang')}</button></div>{#if form.extraLanguages.length > 0}<div class="sel">{#each form.extraLanguages as el}<span class="set">{el.code} - {el.name} <button class="sex" onclick={() => removeExtraLang(el.code)}>x</button></span>{/each}</div>{/if}</div>
{:else}
<div class="srv"><h3 class="srt">{t('confirmTitle')}</h3><p class="srs">{t('confirmMsg')}</p><div class="src"><div class="srr"><span class="srk">{t('usernameLabel')}</span><span class="srv2" dir="ltr">{form.username}</span></div><div class="srr"><span class="srk">{t('passwordLabel')}</span><span class="srv2">****</span></div><div class="srr"><span class="srk">{t('displayNameLabel')}</span><span class="srv2">{form.displayName}</span></div><div class="srr"><span class="srk">{t('mainLangLabel')}</span><span class="srv2">{form.defaultLanguage === 'fa' ? 'Persian' : 'English'}</span></div>{#each form.extraLanguages as el}<div class="srr"><span class="srk">{t('langLabel')}</span><span class="srv2">{el.name} ({el.code})</span></div>{/each}</div></div>
{/if}</div>
<div class="snb">{#if step > 1}<button class="snb2" onclick={() => step--}>{t('backToHome')}</button>{/if}{#if step < totalSteps}<button class="snp" onclick={() => step++}>Next</button>{:else}<button class="snp snp--go" onclick={handleInstall}>{t('install')}</button>{/if}</div></div></div>
{/if}
<style>.sw{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow-y:auto;background:var(--color-bg-secondary)}.swc{width:clamp(340px,40vw,540px);background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:clamp(1.5rem,4vw,2rem);box-shadow:var(--shadow-lg);margin:1rem}.swh{text-align:center;margin-bottom:1.5rem}.swl{font-size:2.5rem;color:var(--color-accent);line-height:1}.swt{font-size:clamp(1.1rem,3vw,1.4rem);color:var(--color-accent);margin:0.3rem 0 0}.sws{color:var(--color-text-muted);font-size:var(--font-size-sm);margin:0.2rem 0 0}.sind{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:0.5rem}.sid{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--font-size-xs);font-weight:700;border:2px solid var(--color-border);color:var(--color-text-muted)}.sid--a{background:var(--color-accent);border-color:var(--color-accent);color:var(--color-accent-text)}.sid--c{border-color:var(--color-accent);color:var(--color-accent)}.sil{width:40px;height:2px;background:var(--color-border)}.sil--a{background:var(--color-accent)}.slb{display:flex;justify-content:space-between;margin-bottom:1.5rem;font-size:var(--font-size-xs);color:var(--color-text-muted);padding:0 0.5rem}.slbl--a{color:var(--color-accent);font-weight:600}.scb{min-height:160px}.se2{padding:0.5rem 0.75rem;border-radius:var(--radius-sm);background:#fef2f2;color:#dc2626;font-size:var(--font-size-sm);margin-bottom:0.75rem}.sfg{margin-bottom:0.85rem}.sfl{display:block;font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-secondary);margin-bottom:0.3rem}.sfi{width:100%;padding:0.55rem 0.7rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);color:var(--color-text-primary);font-family:var(--font-body);font-size:var(--font-size-base);outline:none;box-sizing:border-box}.sfi:focus{border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-bg)}.sad{display:flex;gap:0.4rem;margin-bottom:0.4rem}.swi{flex:1}.sab{padding:0.5rem 0.8rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs);font-weight:600;cursor:pointer;white-space:nowrap}.sel{display:flex;flex-wrap:wrap;gap:0.4rem}.set{display:inline-flex;align-items:center;gap:0.3rem;padding:0.25rem 0.5rem;border-radius:999px;background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs)}.sex{border:none;background:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-xs);padding:0}.sex:hover{color:var(--color-danger)}.srv{padding:0.5rem 0}.srt{font-size:var(--font-size-lg);color:var(--color-text-primary);margin:0 0 0.3rem}.srs{font-size:var(--font-size-sm);color:var(--color-text-muted);margin:0 0 0.8rem}.src{display:flex;flex-direction:column;gap:0.5rem}.srr{display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;border:1px solid var(--color-border);border-radius:var(--radius-sm)}.srk{font-size:var(--font-size-xs);color:var(--color-text-muted);font-weight:600}.srv2{font-size:var(--font-size-sm);color:var(--color-text-primary)}.snb{display:flex;justify-content:space-between;margin-top:1.5rem;padding-top:1rem;border-top:1px solid var(--color-border)}.snb2{padding:0.5rem 1rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:none;color:var(--color-text-secondary);font-size:var(--font-size-sm);cursor:pointer}.snp{padding:0.5rem 1.5rem;border:none;border-radius:var(--radius-md);background:var(--color-accent);color:var(--color-accent-text);font-size:var(--font-size-sm);font-weight:600;cursor:pointer}.snp--go{background:#10b981}.swok{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:var(--color-bg-secondary)}.swokc{text-align:center}.swokl{font-size:3rem;color:#10b981}.swokc h2{color:var(--color-text-primary);margin:0.5rem 0 0}.swokc p{color:var(--color-text-muted);font-size:var(--font-size-sm)}</style>