<script>
  /**
   * SettingsPage.svelte – Admin settings panel
   * - Profile tab: view own info
   * - Users tab (admin only): manage user profiles & roles
   */
  import { t } from '../logic/i18n.js';
  import { signIn, signOut } from '../logic/auth.js';
  import { getAllProfiles, updateProfileRole, deleteProfile, getMyProfile } from '../logic/db.js';

  let { lang = 'fa', user, role } = $props();

  // ---- State ----
  let activeTab = $state('profile');
  let profiles = $state([]);
  let myProfile = $state(null);
  let loading = $state(true);
  let message = $state('');
  let error = $state('');

  // Add user form
  let showAddForm = $state(false);
  let newEmail = $state('');
  let newPassword = $state('');
  let newRole = $state('viewer');
  let newName = $state('');
  let addingUser = $state(false);

  // Edit role inline
  let editingId = $state(null);
  let editingRole = $state('');

  $effect(() => { loadData(); });

  async function loadData() {
    loading = true; error = '';
    try {
      if (role === 'admin') profiles = await getAllProfiles();
      myProfile = await getMyProfile();
    } catch (e) { error = e.message; }
    loading = false;
  }

  async function saveRole(profileId) {
    error = ''; message = '';
    try { await updateProfileRole(profileId, editingRole); message = t(lang, 'roleUpdated'); editingId = null; await loadData(); }
    catch (e) { error = e.message; }
  }

  async function removeUser(profileId, userEmail) {
    if (!confirm(t(lang, 'confirmDelete') + ' ' + userEmail + '?')) return;
    error = ''; message = '';
    try { await deleteProfile(profileId); message = t(lang, 'userDeleted'); await loadData(); }
    catch (e) { error = e.message; }
  }

  async function addUser(e) {
    e.preventDefault();
    error = ''; message = ''; addingUser = true;
    try {
      const adminToken = (() => {
        try { const raw = window.localStorage.getItem('emerald-wiki-auth'); return raw ? JSON.parse(raw).access_token : null; }
        catch { return null; }
      })();

      const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('../config.js');
      const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });

      if (!signUpRes.ok) { const err = await signUpRes.json(); throw new Error(err.msg || 'Failed'); }

      // Restore admin session
      if (adminToken) {
        try {
          const raw = window.localStorage.getItem('emerald-wiki-auth');
          if (raw) { const p = JSON.parse(raw); p.access_token = adminToken; window.localStorage.setItem('emerald-wiki-auth', JSON.stringify(p)); }
        } catch {}
      }

      const signUpData = await signUpRes.json();
      const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${adminToken}`, Prefer: 'return=representation' },
        body: JSON.stringify({ id: signUpData.user.id, email: newEmail, display_name: newName || newEmail, role: newRole }),
      });

      if (!profileRes.ok) throw new Error('Profile creation failed');

      message = t(lang, 'userCreated');
      showAddForm = false; newEmail = ''; newPassword = ''; newRole = 'viewer'; newName = '';
      await loadData();
    } catch (e) { error = e.message; }
    addingUser = false;
  }

  async function handleLogout() { await signOut(); window.location.hash = '#/home'; window.location.reload(); }
</script>

<div class="settings-page">
  <div class="settings-header">
    <h1 class="settings-title">{t(lang, 'settings')}</h1>
    {#if user}
      <span class="user-badge">
        <span class="user-email">{user.email}</span>
        <span class="user-role-badge" class:role-admin={role === 'admin'} class:role-editor={role === 'editor'}>{role}</span>
      </span>
    {/if}
  </div>

  <div class="tabs">
    <button class="tab" class:tab--active={activeTab === 'profile'} onclick={() => activeTab = 'profile'}>{t(lang, 'profile')}</button>
    {#if role === 'admin'}
      <button class="tab" class:tab--active={activeTab === 'users'} onclick={() => activeTab = 'users'}>{t(lang, 'userManagement')}</button>
    {/if}
  </div>

  {#if message}<div class="msg-success">{message}</div>{/if}
  {#if error}<div class="msg-error">{error}</div>{/if}

  {#if activeTab === 'profile'}
    <div class="tab-content">
      {#if loading}<p class="loading-text">{t(lang, 'loading')}</p>
      {:else if myProfile}
        <div class="profile-card">
          <div class="profile-row"><span class="profile-label">{t(lang, 'email')}</span><span class="profile-value" dir="ltr">{myProfile.email || user?.email}</span></div>
          <div class="profile-row"><span class="profile-label">{t(lang, 'displayName')}</span><span class="profile-value">{myProfile.display_name || '-'}</span></div>
          <div class="profile-row"><span class="profile-label">{t(lang, 'role')}</span><span class="profile-value role-badge" class:role-admin={role==='admin'} class:role-editor={role==='editor'}>{role || myProfile.role}</span></div>
        </div>
      {:else}<p>{t(lang, 'profileNotFound')}</p>{/if}
      <button class="btn-logout" onclick={handleLogout}>{t(lang, 'logout')}</button>
    </div>
  {/if}

  {#if activeTab === 'users' && role === 'admin'}
    <div class="tab-content">
      {#if loading}<p class="loading-text">{t(lang, 'loading')}</p>
      {:else}
        <div class="users-toolbar">
          <button class="btn-add" onclick={() => showAddForm = !showAddForm}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t(lang, 'addUser')}
          </button>
        </div>

        {#if showAddForm}
          <form class="add-user-form" onsubmit={addUser}>
            <div class="form-row">
              <div class="form-field"><label class="field-label">{t(lang, 'email')}</label><input type="email" class="field-input" dir="ltr" bind:value={newEmail} required placeholder="user@example.com" /></div>
              <div class="form-field"><label class="field-label">{t(lang, 'password')}</label><input type="password" class="field-input" dir="ltr" bind:value={newPassword} required placeholder="••••••••" /></div>
            </div>
            <div class="form-row">
              <div class="form-field"><label class="field-label">{t(lang, 'displayName')}</label><input type="text" class="field-input" bind:value={newName} placeholder={t(lang, 'displayName')} /></div>
              <div class="form-field"><label class="field-label">{t(lang, 'role')}</label>
                <select class="field-select" bind:value={newRole}>
                  <option value="viewer">{t(lang, 'roleViewer')}</option>
                  <option value="editor">{t(lang, 'roleEditor')}</option>
                  <option value="admin">{t(lang, 'roleAdmin')}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-save" disabled={addingUser}>{addingUser ? t(lang, 'saving') : t(lang, 'createUser')}</button>
              <button type="button" class="btn-cancel" onclick={() => showAddForm = false}>{t(lang, 'cancel')}</button>
            </div>
          </form>
        {/if}

        <div class="users-table-wrap">
          <table class="users-table">
            <thead><tr><th>{t(lang, 'email')}</th><th>{t(lang, 'displayName')}</th><th>{t(lang, 'role')}</th><th>{t(lang, 'actions')}</th></tr></thead>
            <tbody>
              {#each profiles as p (p.id)}
                <tr>
                  <td dir="ltr" class="td-email">{p.email}</td>
                  <td>{p.display_name || '-'}</td>
                  <td>
                    {#if editingId === p.id}
                      <select class="role-select-inline" bind:value={editingRole}>
                        <option value="viewer">{t(lang, 'roleViewer')}</option>
                        <option value="editor">{t(lang, 'roleEditor')}</option>
                        <option value="admin">{t(lang, 'roleAdmin')}</option>
                      </select>
                    {:else}
                      <span class="role-badge-sm" class:role-admin={p.role==='admin'} class:role-editor={p.role==='editor'}>{p.role}</span>
                    {/if}
                  </td>
                  <td class="td-actions">
                    {#if editingId === p.id}
                      <button class="action-btn save" onclick={() => saveRole(p.id)}>✓</button>
                      <button class="action-btn cancel" onclick={() => editingId = null}>✕</button>
                    {:else if p.email !== user?.email}
                      <button class="action-btn edit" onclick={() => { editingId = p.id; editingRole = p.role; }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="action-btn delete" onclick={() => removeUser(p.id, p.email)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    {:else}
                      <span class="you-tag">{t(lang, 'you')}</span>
                    {/if}
                  </td>
                </tr>
              {/each}
              {#if profiles.length === 0}<tr><td colspan="4" class="td-empty">{t(lang, 'noUsers')}</td></tr>{/if}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .settings-page { max-width:900px; width:100%; padding:2rem; animation:pageIn 300ms ease; }
  @keyframes pageIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .settings-header { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:0.75rem; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--color-border); }
  .settings-title { font-size:var(--font-size-2xl); color:var(--color-accent); margin:0; }
  .user-badge { display:flex; align-items:center; gap:0.5rem; font-size:var(--font-size-sm); }
  .user-email { color:var(--color-text-secondary); }
  .user-role-badge { padding:2px 8px; border-radius:999px; font-size:var(--font-size-xs); font-weight:600; background:var(--color-bg-tertiary); color:var(--color-text-muted); }
  .role-admin { background:#064e3b; color:#34d399; }
  .role-editor { background:#1e3a5f; color:#60a5fa; }

  .tabs { display:flex; gap:0; border-bottom:2px solid var(--color-border); margin-bottom:1.5rem; }
  .tab { padding:0.6rem 1.25rem; border:none; background:none; color:var(--color-text-muted); font-family:var(--font-body); font-size:var(--font-size-sm); font-weight:500; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all var(--transition-fast); }
  .tab:hover { color:var(--color-text-primary); }
  .tab--active { color:var(--color-accent); border-bottom-color:var(--color-accent); }

  .msg-success { padding:0.65rem 1rem; background:var(--color-accent-bg); border:1px solid var(--color-accent); border-radius:var(--radius-md); color:var(--color-accent-dark); font-size:var(--font-size-sm); margin-bottom:1rem; }
  .msg-error { padding:0.65rem 1rem; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); color:#dc2626; font-size:var(--font-size-sm); margin-bottom:1rem; }

  .profile-card { border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden; }
  .profile-row { display:flex; justify-content:space-between; align-items:center; padding:0.85rem 1rem; border-bottom:1px solid var(--color-border-light); }
  .profile-row:last-child { border-bottom:none; }
  .profile-label { font-weight:600; font-size:var(--font-size-sm); color:var(--color-text-secondary); }
  .profile-value { font-size:var(--font-size-sm); color:var(--color-text-primary); }
  .role-badge { padding:3px 10px; border-radius:999px; font-size:var(--font-size-xs); font-weight:600; background:var(--color-bg-tertiary); color:var(--color-text-muted); }
  .btn-logout { margin-top:1.5rem; padding:0.6rem 1.5rem; border:1px solid var(--color-danger); border-radius:var(--radius-md); background:none; color:var(--color-danger); font-family:var(--font-body); font-size:var(--font-size-sm); font-weight:600; cursor:pointer; transition:all var(--transition-fast); }
  .btn-logout:hover { background:var(--color-danger); color:#fff; }

  .users-toolbar { margin-bottom:1rem; }
  .btn-add { display:inline-flex; align-items:center; gap:0.5rem; padding:0.5rem 1rem; border:1px dashed var(--color-accent); border-radius:var(--radius-md); background:var(--color-accent-bg); color:var(--color-accent); font-family:var(--font-body); font-size:var(--font-size-sm); font-weight:600; cursor:pointer; transition:all var(--transition-fast); }
  .btn-add:hover { background:var(--color-accent); color:var(--color-accent-text); }

  .add-user-form { border:1px solid var(--color-accent); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.5rem; background:var(--color-accent-bg); }
  .form-row { display:flex; gap:0.75rem; margin-bottom:0.75rem; }
  .form-field { flex:1; }
  .field-label { display:block; font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-secondary); margin-bottom:0.3rem; }
  .field-input,.field-select { width:100%; padding:0.5rem 0.65rem; border:1px solid var(--color-border); border-radius:var(--radius-sm); background:var(--color-bg-primary); color:var(--color-text-primary); font-family:var(--font-body); font-size:var(--font-size-sm); outline:none; }
  .field-input:focus,.field-select:focus { border-color:var(--color-accent); box-shadow:0 0 0 2px var(--color-accent-bg); }
  .form-actions { display:flex; gap:0.5rem; }
  .btn-save { padding:0.45rem 1.25rem; border:none; border-radius:var(--radius-sm); background:var(--color-accent); color:#fff; font-family:var(--font-body); font-size:var(--font-size-sm); font-weight:600; cursor:pointer; }
  .btn-save:disabled { opacity:0.6; cursor:not-allowed; }
  .btn-cancel { padding:0.45rem 1.25rem; border:1px solid var(--color-border); border-radius:var(--radius-sm); background:var(--color-bg-secondary); color:var(--color-text-secondary); font-family:var(--font-body); font-size:var(--font-size-sm); cursor:pointer; }

  .users-table-wrap { overflow-x:auto; }
  .users-table { width:100%; border-collapse:collapse; }
  .users-table th { text-align:right; padding:0.6rem 0.75rem; font-size:var(--font-size-xs); font-weight:600; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.05em; background:var(--color-bg-tertiary); border-bottom:1px solid var(--color-border); }
  .users-table td { padding:0.6rem 0.75rem; font-size:var(--font-size-sm); border-bottom:1px solid var(--color-border-light); }
  .td-email { direction:ltr; text-align:left; }
  .td-actions { white-space:nowrap; text-align:center; }
  .td-empty { text-align:center; color:var(--color-text-muted); padding:2rem; }

  .role-badge-sm { display:inline-block; padding:2px 8px; border-radius:999px; font-size:var(--font-size-xs); font-weight:600; background:var(--color-bg-tertiary); color:var(--color-text-muted); }
  .role-select-inline { padding:3px 6px; border:1px solid var(--color-accent); border-radius:var(--radius-sm); font-size:var(--font-size-xs); font-family:var(--font-body); background:var(--color-bg-primary); color:var(--color-text-primary); }

  .action-btn { width:28px; height:28px; border:none; border-radius:var(--radius-sm); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; margin:0 2px; transition:all var(--transition-fast); }
  .action-btn.edit { background:#dbeafe; color:#2563eb; }
  .action-btn.delete { background:#fee2e2; color:#dc2626; }
  .action-btn.save { background:#d1fae5; color:#059669; }
  .action-btn.cancel { background:#f1f5f9; color:#64748b; }
  .you-tag { font-size:var(--font-size-xs); color:var(--color-text-muted); font-style:italic; }
  .loading-text { color:var(--color-text-muted); text-align:center; padding:2rem; }

  @media (max-width:640px) {
    .settings-page { padding:1rem; }
    .form-row { flex-direction:column; }
    .settings-header { flex-direction:column; align-items:flex-start; }
  }
</style>