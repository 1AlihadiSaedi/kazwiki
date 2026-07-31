<script>
  import { t } from '../logic/i18n.js';
  import { signOut } from '../logic/auth.js';
  import { getMyProfile } from '../logic/db.js';
  let { lang = 'fa', user, role } = $props();
  let myProfile = $state(null);
  let loading = $state(true);
  $effect(() => { loadData(); });
  async function loadData() {
    loading = true;
    try { myProfile = await getMyProfile(); } catch {}
    loading = false;
  }
  async function handleLogout() {
    await signOut();
    window.location.hash = '#/home';
  }
</script>
<div class="settings-page">
  <div class="settings-header">
    <h1 class="settings-title">{t(lang, 'settings')}</h1>
    {#if user}
      <span class="user-badge"><span class="user-email">{user.email}</span><span class="user-role-badge role-admin">admin</span></span>
    {/if}
  </div>
  <div class="tabs"><button class="tab tab--active">{t(lang, 'profile')}</button></div>
  {#if loading}
    <p class="loading-text">{t(lang, 'loading')}</p>
  {:else if myProfile}
    <div class="profile-card">
      <div class="profile-row"><span class="profile-label">{t(lang, 'email')}</span><span class="profile-value" dir="ltr">{myProfile.email||user?.email}</span></div>
      <div class="profile-row"><span class="profile-label">{t(lang, 'displayName')}</span><span class="profile-value">{myProfile.display_name||'-'}</span></div>
      <div class="profile-row"><span class="profile-label">{t(lang, 'role')}</span><span class="profile-value role-badge role-admin">admin</span></div>
    </div>
  {:else}
    <p>{t(lang, 'profileNotFound')}</p>
  {/if}
  <button class="btn-logout" onclick={handleLogout}>{t(lang, 'logout')}</button>
</div>
<style>
  .settings-page { max-width:700px; width:100%; padding:2rem; animation:pageIn 300ms ease; }
  @keyframes pageIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .settings-header { display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.75rem;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--color-border) }
  .settings-title { font-size:var(--font-size-2xl);color:var(--color-accent);margin:0 }
  .user-badge { display:flex;align-items:center;gap:0.5rem;font-size:var(--font-size-sm) }
  .user-email { color:var(--color-text-secondary) }
  .user-role-badge { padding:2px 8px;border-radius:999px;font-size:var(--font-size-xs);font-weight:600;background:#064e3b;color:#34d399 }
  .tabs { display:flex;gap:0;border-bottom:2px solid var(--color-border);margin-bottom:1.5rem }
  .tab { padding:0.6rem 1.25rem;border:none;background:none;color:var(--color-accent);font-family:var(--font-body);font-size:var(--font-size-sm);font-weight:500;cursor:pointer;border-bottom:2px solid var(--color-accent);margin-bottom:-2px }
  .profile-card { border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden }
  .profile-row { display:flex;justify-content:space-between;align-items:center;padding:0.85rem 1rem;border-bottom:1px solid var(--color-border-light) }
  .profile-row:last-child { border-bottom:none }
  .profile-label { font-weight:600;font-size:var(--font-size-sm);color:var(--color-text-secondary) }
  .profile-value { font-size:var(--font-size-sm);color:var(--color-text-primary) }
  .role-badge { padding:3px 10px;border-radius:999px;font-size:var(--font-size-xs);font-weight:600 }
  .role-admin { background:#064e3b;color:#34d399 }
  .btn-logout { margin-top:1.5rem;padding:0.6rem 1.5rem;border:1px solid var(--color-danger);border-radius:var(--radius-md);background:none;color:var(--color-danger);font-family:var(--font-body);font-size:var(--font-size-sm);font-weight:600;cursor:pointer;transition:all var(--transition-fast) }
  .btn-logout:hover { background:var(--color-danger);color:#fff }
  .loading-text { color:var(--color-text-muted);text-align:center;padding:2rem }
  @media (max-width:640px){ .settings-page{padding:1rem} }
</style>