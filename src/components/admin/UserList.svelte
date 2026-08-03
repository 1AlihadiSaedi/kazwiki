<script>
import { t } from '../../logic/i18n.js';
import { getAllUsers, createUser, deleteUser, updateUser } from '../../logic/db.js';
import { sha256 } from '../../logic/crypto.js';
let { lang = 'fa', roles = [] } = $props();
let users = $state([]);
let showAdd = $state(false);
let form = $state({ username: '', password: '', displayName: '', role: 'author' });
let error = $state('');
let confirmDelete = $state(null);
let editingUser = $state(null);
let editForm = $state({ username: '', password: '', displayName: '' });
let editError = $state('');

$effect(() => { loadUsers() });
function loadUsers() { users = getAllUsers(); }

async function handleAdd() {
  error = '';
  if (!form.username) { error = t(lang, 'usernameRequired'); return; }
  if (!form.password) { error = t(lang, 'passwordRequired'); return; }
  const ph = await sha256(form.password);
  const uh = await sha256(form.username.trim().toLowerCase());
  const r = createUser({ username: form.username, usernameHash: uh, password: ph, displayName: form.displayName || form.username, role: form.role });
  if (r.error) { error = t(lang, r.error === 'username_taken' ? 'usernameTaken' : 'usernameRequired'); return; }
  showAdd = false;
  form = { username: '', password: '', displayName: '', role: 'author' };
  loadUsers();
}
function handleDelete(username) {
  deleteUser(username);
  confirmDelete = null;
  loadUsers();
}
function startEdit(u) {
  editingUser = u.username;
  editForm = { username: u.displayName || u.username, password: '', displayName: u.displayName || '' };
  editError = '';
}
async function handleSave(oldUsername) {
  editError = '';
  const up = {};
  if (editForm.displayName.trim()) up.displayName = editForm.displayName.trim();
  if (editForm.password.trim()) {
    up.passwordHash = await sha256(editForm.password);
  }
  if (editForm.username.trim() && norm(editForm.username) !== norm(oldUsername)) {
    up.username = norm(editForm.username);
    up.usernameHash = await sha256(norm(editForm.username));
  }
  updateUser(oldUsername, up);
  editingUser = null;
  loadUsers();
}
const norm = (s) => (s || '').trim().toLowerCase();
function isRoot(u) { return u.username === 'root'; }
</script>
<div class="ul">
  <div class="uh">
    <span class="ut">{t(lang, 'users')} ({users.length})</span>
    <button class="ub" onclick={() => showAdd = !showAdd}>+ {t(lang, 'addUser')}</button>
  </div>
  {#if showAdd}
    <div class="uf">
      {#if error}<div class="ue">{error}</div>{/if}
      <input class="ui" type="text" placeholder={lang==='en'?'Username':'نام کاربری'} bind:value={form.username} />
      <input class="ui" type="password" placeholder={lang==='en'?'Password':'رمز عبور'} bind:value={form.password} />
      <input class="ui" type="text" placeholder={lang==='en'?'Display name':'نام نمایشی'} bind:value={form.displayName} />
      <select class="ui" bind:value={form.role}>
        {#each roles as r}
          <option value={r.id}>{r.name[lang] || r.name.fa || r.id}</option>
        {/each}
      </select>
      <div class="ufb">
        <button class="ubs" onclick={handleAdd}>{t(lang, 'save')}</button>
        <button class="ubd" onclick={() => { showAdd = false; error = ''; }}>{t(lang, 'cancel')}</button>
      </div>
    </div>
  {/if}
  {#if confirmDelete}
    <div class="udc">
      <span class="udt">{t(lang, 'confirmDeleteUser')}</span>
      <div class="udb">
        <button class="udy" onclick={() => handleDelete(confirmDelete)}>{lang==='en'?'Delete':'حذف'}</button>
        <button class="udn" onclick={() => confirmDelete = null}>{t(lang, 'cancel')}</button>
      </div>
    </div>
  {/if}
  <div class="ulist">
    {#each users as u}
      {#if editingUser === u.username}
        <div class="uf">
          {#if editError}<div class="ue">{editError}</div>{/if}
          <input class="ui" type="text" placeholder={lang==='en'?'Display name':'نام نمایشی'} bind:value={editForm.displayName} />
          <input class="ui" type="text" placeholder={lang==='en'?'New username':'نام کاربری جدید'} bind:value={editForm.username} />
          <input class="ui" type="password" placeholder={lang==='en'?'New password (leave empty to keep)':'رمز عبور جدید (خالی = بدون تغییر)'} bind:value={editForm.password} />
          <div class="ufb">
            <button class="ubs" onclick={() => handleSave(u.username)}>{t(lang, 'save')}</button>
            <button class="ubd" onclick={() => editingUser = null}>{t(lang, 'cancel')}</button>
          </div>
        </div>
      {:else}
        <div class="ulr">
          <div class="uli">
            <span class="uav">{(u.displayName || u.username)[0]}</span>
            <div class="uid">
              <span class="uun">{u.displayName || u.username}</span>
              <span class="uur">{u.role}</span>
            </div>
          </div>
          {#if !isRoot(u)}
            <div class="uactions">
              <button class="ued" onclick={() => startEdit(u)} title={lang==='en'?'Edit':'ویرایش'}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="udl" onclick={() => confirmDelete = u.username}>✕</button>
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>
<style>
  .ul{display:flex;flex-direction:column;gap:0.6rem}
  .uh{display:flex;align-items:center;justify-content:space-between}
  .ut{font-weight:600;font-size:var(--font-size-sm);color:var(--color-text-primary)}
  .ub{padding:0.35rem 0.85rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);
    background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs);
    font-weight:600;cursor:pointer;transition:all var(--transition-fast)}
  .ub:hover{background:var(--color-accent);color:var(--color-accent-text)}
  .uf{display:flex;flex-direction:column;gap:0.5rem;padding:0.75rem;
    background:var(--color-bg-secondary);border-radius:var(--radius-md);border:1px solid var(--color-border)}
  .ue{padding:0.4rem 0.6rem;border-radius:var(--radius-sm);background:#fef2f2;color:#dc2626;font-size:var(--font-size-xs)}
  .ui{padding:0.45rem 0.65rem;border:1px solid var(--color-border);border-radius:var(--radius-sm);
    font-size:var(--font-size-sm);font-family:var(--font-body);background:var(--color-bg-primary);color:var(--color-text-primary)}
  .ufb{display:flex;gap:0.5rem}
  .ubs{padding:0.4rem 1rem;border:none;border-radius:var(--radius-sm);background:var(--color-accent);
    color:var(--color-accent-text);font-size:var(--font-size-xs);font-weight:600;cursor:pointer}
  .ubd{padding:0.4rem 1rem;border:1px solid var(--color-border);border-radius:var(--radius-sm);
    background:none;font-size:var(--font-size-xs);cursor:pointer;color:var(--color-text-secondary)}
  .udc{display:flex;flex-direction:column;gap:0.5rem;padding:0.75rem;
    background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-md)}
  .udt{font-size:var(--font-size-sm);color:#dc2626}
  .udb{display:flex;gap:0.5rem}
  .udy,.udn{padding:0.35rem 1rem;border-radius:var(--radius-sm);font-size:var(--font-size-xs);cursor:pointer}
  .udy{border:none;background:#dc2626;color:#fff}
  .udn{border:1px solid var(--color-border);background:none;color:var(--color-text-secondary)}
  .ulist{display:flex;flex-direction:column;gap:0.3rem}
  .ulr{display:flex;align-items:center;justify-content:space-between;padding:0.55rem 0.75rem;
    border:1px solid var(--color-border);border-radius:var(--radius-sm)}
  .uli{display:flex;align-items:center;gap:0.65rem}
  .uav{width:30px;height:30px;border-radius:50%;background:var(--color-accent-bg);color:var(--color-accent);
    display:flex;align-items:center;justify-content:center;font-size:var(--font-size-xs);font-weight:700}
  .uid{display:flex;flex-direction:column;gap:0.1rem}
  .uun{font-size:var(--font-size-sm);font-weight:500;color:var(--color-text-primary)}
  .uur{font-size:var(--font-size-xs);color:var(--color-text-muted)}
  .uactions{display:flex;align-items:center;gap:0.15rem;flex-shrink:0}
  .ued{border:none;background:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-sm);padding:4px;display:flex;align-items:center}
  .ued:hover{color:var(--color-accent)}
  .udl{border:none;background:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-sm);padding:4px}
  .udl:hover{color:var(--color-danger)}
</style>
