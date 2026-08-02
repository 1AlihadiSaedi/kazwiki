<script>
import { t } from '../logic/i18n.js';
import { signOut, hasPermission } from '../logic/auth.js';
import { getMyProfile, getAllRoles } from '../logic/db.js';
import { getSiteConfig, updateSiteConfig } from '../logic/config.js';
import UserList from './admin/UserList.svelte';
import RoleList from './admin/RoleList.svelte';
import LanguageManager from './admin/LanguageManager.svelte';

let { lang = 'fa', user, role } = $props();
let myProfile = $state(null);
let loading = $state(true);
let logoutConfirm = $state(false);
let tab = $state('profile');
let roles = $state([]);

let wikiTitle = $state('');
let wikiIcon = $state('');
let wikiSaved = $state(false);
let wikiError = $state('');

$effect(() => { loadData() });

async function loadData() {
  loading = true;
  try {
    myProfile = await getMyProfile();
    roles = getAllRoles();
    const sc = getSiteConfig();
    if (sc?.site?.title) {
      wikiTitle = typeof sc.site.title === 'object'
        ? (sc.site.title[lang] || sc.site.title.en || '')
        : sc.site.title;
    }
    if (sc?.site?.icon) wikiIcon = sc.site.icon;
  } catch(e) {}
  loading = false;
}

async function handleLogout() {
  await signOut();
  window.location.hash = '#/home';
  window.location.reload();
}

function handleIconUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    wikiError = 'Please select an image file';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    wikiIcon = reader.result;
    wikiError = '';
  };
  reader.readAsDataURL(file);
}

function removeIcon() {
  wikiIcon = '';
}

function saveWikiSettings() {
  wikiSaved = false;
  wikiError = '';
  const sc = getSiteConfig();
  const titleObj = sc?.site?.title && typeof sc.site.title === 'object'
    ? { ...sc.site.title, [lang]: wikiTitle || sc.site.title[lang] }
    : { fa: wikiTitle || 'ویکی زمردین', en: wikiTitle || 'Emerald Wiki' };
  updateSiteConfig({ title: titleObj, icon: wikiIcon });
  wikiSaved = true;
  setTimeout(() => wikiSaved = false, 2500);
}

function can(perm) { return hasPermission(role, perm); }

const tabs = $derived.by(() => {
  const t = [{ id: 'profile', label: lang === 'en' ? 'Profile' : 'پروفایل', icon: 'user' }];
  t.push({ id: 'wiki', label: lang === 'en' ? 'Wiki' : 'ویکی', icon: 'wiki' });
  if (can('manage_users')) t.push({ id: 'users', label: lang === 'en' ? 'Users' : 'کاربران', icon: 'users' });
  if (can('manage_roles')) t.push({ id: 'roles', label: lang === 'en' ? 'Roles' : 'نقش‌ها', icon: 'roles' });
  if (can('manage_languages')) t.push({ id: 'languages', label: lang === 'en' ? 'Languages' : 'زبان‌ها', icon: 'lang' });
  return t;
});
</script>

<div class="sp">
  <div class="sc">
    <div class="sh2">
      <h1 class="st2">{t(lang, 'settings')}</h1>
    </div>

    <nav class="tn">
      {#each tabs as tb}
        <button class="tb" class:tb--a={tab === tb.id} onclick={() => tab = tb.id}>
          {#if tb.icon === 'user'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {:else if tb.icon === 'wiki'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          {:else if tb.icon === 'users'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          {:else if tb.icon === 'roles'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          {:else if tb.icon === 'lang'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></svg>
          {/if}
          <span>{tb.label}</span>
        </button>
      {/each}
    </nav>

    <div class="tc">
      {#if tab === 'profile'}
        {#if loading}
          <div class="se2"><span class="spi"></span><span>{t(lang, 'loading')}</span></div>
        {:else if myProfile}
          <div class="pc">
            <div class="pa">
              <div class="ai">{(myProfile.display_name || user?.displayName || 'A')[0]}</div>
              <div class="an2">
                <span class="an3">{myProfile.display_name || user?.displayName || '-'}</span>
                <span class="ar2">{roles.find(r => r.id === myProfile.role)?.name?.[lang] || myProfile.role}</span>
              </div>
            </div>
            <div class="pi">
              <div class="pir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <div class="pid"><span class="pil">{t(lang, 'username')}</span><span class="piv" dir="ltr">{myProfile.username || user?.username}</span></div>
              </div>
              <div class="pir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <div class="pid"><span class="pil">{t(lang, 'displayName')}</span><span class="piv">{myProfile.display_name || user?.displayName || '-'}</span></div>
              </div>
              <div class="pir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <div class="pid"><span class="pil">{t(lang, 'role')}</span><span class="pib2">{roles.find(r => r.id === myProfile.role)?.name?.[lang] || myProfile.role}</span></div>
              </div>
            </div>
          </div>
        {:else}
          <div class="se2"><p>{t(lang, 'profileNotFound')}</p></div>
        {/if}

        <div class="ls">
          {#if !logoutConfirm}
            <button class="lb" onclick={() => logoutConfirm = true}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {t(lang, 'logout')}
            </button>
          {:else}
            <div class="lc">
              <span class="lct">{lang === 'en' ? 'Are you sure you want to log out?' : 'آیا مطمئن هستید که می‌خواهید خارج شوید؟'}</span>
              <div class="lcb">
                <button class="lcy" onclick={handleLogout}>{lang === 'en' ? 'Yes, log out' : 'بله، خارج شو'}</button>
                <button class="lcn" onclick={() => logoutConfirm = false}>{t(lang, 'cancel')}</button>
              </div>
            </div>
          {/if}
        </div>

      {:else if tab === 'wiki'}
        <div class="pc">
          <div class="pa">
            <div class="ai">{wikiIcon ? '' : 'W'}</div>
            <div class="an2">
              <span class="an3">{t(lang, 'wikiSettings')}</span>
              <span class="ar2">{lang === 'en' ? 'Name & Icon' : 'نام و آیکون'}</span>
            </div>
          </div>
          <div class="pi">
            {#if wikiSaved}
              <div class="sok">{t(lang, 'wikiNameSaved')}</div>
            {/if}
            {#if wikiError}
              <div class="se2" style="margin:0.5rem 1rem 0">{wikiError}</div>
            {/if}
            <div class="pir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <div class="pid"><span class="pil">{t(lang, 'wikiTitle')}</span>
                <input class="sfi3" type="text" bind:value={wikiTitle} placeholder="Emerald Wiki" autocomplete="off" />
              </div>
            </div>
            <div class="pir2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <div class="pid">
                <span class="pil">{t(lang, 'wikiIcon')}</span>
                <div class="sip2">
                  {#if wikiIcon}
                    <img src={wikiIcon} alt="icon" class="sip-img2" />
                    <button class="sex2" onclick={removeIcon}>x</button>
                  {:else}
                    <span class="sidf2">&#9670; {t(lang, 'defaultIcon')}</span>
                  {/if}
                </div>
                <label class="sab3" for="st-ic">
                  <input id="st-ic" type="file" accept="image/*" class="sif3" onchange={handleIconUpload} />
                  {t(lang, 'chooseIcon')}
                </label>
              </div>
            </div>
          </div>
        </div>
        <button class="snp2" onclick={saveWikiSettings}>{t(lang, 'save')}</button>

      {:else if tab === 'users'}
        <UserList {lang} {roles} />

      {:else if tab === 'roles'}
        <RoleList {lang} />

      {:else if tab === 'languages'}
        <LanguageManager {lang} />
      {/if}
    </div>

    <p class="sf"><a href="#/{lang}/home">&#8592; {t(lang, 'backToHome')}</a></p>
  </div>
</div>

<style>
  .sp{display:flex;justify-content:center;align-items:flex-start;padding:clamp(1.2rem,4vw,2.5rem) clamp(0.8rem,3vw,1.5rem);min-height:100%}
  .sc{width:clamp(360px,44vw,600px);animation:fi 300ms ease}
  @keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .sh2{margin-bottom:clamp(1rem,3vw,1.5rem);text-align:center}
  .st2{font-size:clamp(1.2rem,3.5vw,1.5rem);color:var(--color-accent);margin:0}
  .tn{display:flex;gap:0.25rem;margin-bottom:1.25rem;border-bottom:2px solid var(--color-border);padding-bottom:0;overflow-x:auto}
  .tb{display:flex;align-items:center;gap:0.4rem;padding:0.5rem 1rem;border:none;background:none;color:var(--color-text-muted);font-size:var(--font-size-sm);font-family:var(--font-body);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all var(--transition-fast);flex-shrink:0}
  .tb:hover{color:var(--color-text-primary)}
  .tb--a{color:var(--color-accent);border-bottom-color:var(--color-accent)}
  .tb svg{flex-shrink:0}
  .tc{min-height:200px}
  .se2{display:flex;align-items:center;justify-content:center;gap:0.6rem;padding:2.5rem 1rem;color:var(--color-text-muted);font-size:var(--font-size-sm)}
  .spi{width:18px;height:18px;border:2px solid var(--color-border);border-top-color:var(--color-accent);border-radius:50%;animation:spin 0.6s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .pc{background:var(--color-bg-primary);border:1px solid var(--color-border);border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-sm);margin-bottom:clamp(1rem,3vw,1.5rem)}
  .pa{display:flex;align-items:center;gap:1rem;padding:clamp(1rem,3vw,1.4rem);background:linear-gradient(135deg,var(--color-accent-bg),var(--color-bg-primary));border-bottom:1px solid var(--color-border)}
  .ai{width:56px;height:56px;border-radius:50%;background:var(--color-accent);color:var(--color-accent-text);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;flex-shrink:0}
  .an2{display:flex;flex-direction:column;gap:0.2rem}
  .an3{font-weight:700;font-size:var(--font-size-lg);color:var(--color-text-primary)}
  .ar2{font-size:var(--font-size-xs);color:var(--color-accent);background:var(--color-accent-bg);padding:2px 10px;border-radius:999px;width:fit-content}
  .pi{padding:0.35rem 0}
  .pir{display:flex;align-items:center;gap:0.75rem;padding:0.75rem clamp(1rem,3vw,1.6rem);transition:background var(--transition-fast)}
  .pir:hover{background:var(--color-bg-hover)}
  .pir svg{color:var(--color-text-muted);flex-shrink:0}
  .pid{flex:1;min-width:0}
  .pil{display:block;font-size:0.7rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.15rem}
  .piv{font-size:var(--font-size-sm);color:var(--color-text-primary);font-weight:500;word-break:break-all}
  .pib2{display:inline-block;font-size:var(--font-size-xs);font-weight:600;padding:2px 10px;border-radius:999px;background:#064e3b;color:#34d399}
  :global([data-theme="dark"]) .pib2{background:#064e3b;color:#6ee7b7}
  .ls{padding:0.75rem 0}
  .lb{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:clamp(0.55rem,1.5vw,0.7rem);border:1px solid var(--color-danger);border-radius:var(--radius-md);background:none;color:var(--color-danger);font-family:var(--font-body);font-size:var(--font-size-base);font-weight:600;cursor:pointer;transition:all var(--transition-fast)}
  .lb:hover{background:var(--color-danger);color:#fff}
  .lc{display:flex;flex-direction:column;align-items:center;gap:0.75rem;padding:1rem;background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-md)}
  :global([data-theme="dark"]) .lc{background:#450a0a;border-color:#7f1d1d}
  .lct{font-size:var(--font-size-sm);color:#dc2626;text-align:center}
  :global([data-theme="dark"]) .lct{color:#fca5a5}
  .lcb{display:flex;gap:0.75rem;width:100%}
  .lcy{flex:1;padding:0.55rem;border:none;border-radius:var(--radius-md);background:#dc2626;color:#fff;font-family:var(--font-body);font-size:var(--font-size-sm);font-weight:600;cursor:pointer}
  .lcy:hover{background:#b91c1c}
  .lcn{flex:1;padding:0.55rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-primary);color:var(--color-text-secondary);font-family:var(--font-body);font-size:var(--font-size-sm);font-weight:500;cursor:pointer}
  .lcn:hover{background:var(--color-bg-hover)}
  .sf{text-align:center;font-size:var(--font-size-sm);margin-top:1rem}
  .sf a{color:var(--color-link)}
  .sok{background:#ecfdf5;color:#059669;padding:0.5rem 1rem;margin:0.5rem 1rem 0;border-radius:var(--radius-sm);font-size:var(--font-size-sm);text-align:center}
  :global([data-theme="dark"]) .sok{background:#064e3b;color:#6ee7b7}
  .sfi3{width:100%;padding:0.45rem 0.6rem;border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-bg-secondary);color:var(--color-text-primary);font-family:var(--font-body);font-size:var(--font-size-sm);outline:none;box-sizing:border-box;margin-top:0.4rem}
  .sfi3:focus{border-color:var(--color-accent);box-shadow:0 0 0 3px var(--color-accent-bg)}
  .pir2{display:flex;align-items:flex-start;gap:0.75rem;padding:0.75rem clamp(1rem,3vw,1.6rem);transition:background var(--transition-fast)}
  .pir2:hover{background:var(--color-bg-hover)}
  .pir2 svg{color:var(--color-text-muted);flex-shrink:0;margin-top:0.2rem}
  .sip2{display:flex;align-items:center;gap:0.5rem;margin:0.3rem 0}
  .sip-img2{width:40px;height:40px;border-radius:var(--radius-sm);object-fit:cover;border:1px solid var(--color-border)}
  .sex2{border:none;background:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-sm);padding:0}
  .sex2:hover{color:var(--color-danger)}
  .sidf2{font-size:var(--font-size-sm);color:var(--color-text-muted)}
  .sab3{display:inline-block;padding:0.35rem 0.7rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs);font-weight:600;cursor:pointer;margin-top:0.35rem}
  .sif3{display:none}
  .snp2{display:block;width:100%;padding:0.7rem;border:none;border-radius:var(--radius-md);background:var(--color-accent);color:var(--color-accent-text);font-family:var(--font-body);font-size:var(--font-size-base);font-weight:600;cursor:pointer}
  .snp2:hover{background:var(--color-accent-dark)}
  @media(max-width:640px){.sp{padding:0.75rem}.tn{gap:0}.tb{padding:0.5rem 0.65rem;font-size:var(--font-size-xs)}}
</style>