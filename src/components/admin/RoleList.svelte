<script>
import { t } from '../../logic/i18n.js';
import { getAllRoles, createRole, deleteRole, updateRole } from '../../logic/db.js';
import PermissionGrid from './PermissionGrid.svelte';
let { lang = 'fa' } = $props();
let roles = $state([]);
let selected = $state(null);
let showAdd = $state(false);
let form = $state({ id: '', nameFa: '', nameEn: '', permissions: [] });
let error = $state('');
let confirmDelete = $state(null);

$effect(() => { loadRoles() });
function loadRoles() { roles = getAllRoles(); }

function selectRole(role) {
  selected = selected?.id === role.id ? null : role;
}

async function handleAdd() {
  error = '';
  if (!form.id) { error = t(lang, 'roleNameRequired'); return; }
  const r = createRole({
    id: form.id.toLowerCase().replace(/\s+/g, '_'),
    name: { fa: form.nameFa || form.id, en: form.nameEn || form.id },
    permissions: form.permissions
  });
  if (r.error) { error = t(lang, r.error === 'id_taken' ? 'roleNameTaken' : 'roleNameRequired'); return; }
  showAdd = false;
  form = { id: '', nameFa: '', nameEn: '', permissions: [] };
  loadRoles();
}

function handleDelete(id) {
  deleteRole(id);
  confirmDelete = null;
  selected = null;
  loadRoles();
}

function togglePerm(perm) {
  if (form.permissions.includes(perm)) {
    form.permissions = form.permissions.filter(p => p !== perm);
  } else {
    form.permissions = [...form.permissions, perm];
  }
}

function updatePerms(roleId, perms) {
  updateRole(roleId, { permissions: perms });
  loadRoles();
}
</script>
<div class="rl">
  <div class="rh">
    <span class="rt">{t(lang, 'roles')} ({roles.length})</span>
    <button class="rb" onclick={() => showAdd = !showAdd}>+ {t(lang, 'addRole')}</button>
  </div>

  {#if showAdd}
    <div class="rf">
      {#if error}<div class="re">{error}</div>{/if}
      <input class="ri" type="text" placeholder={lang==='en'?'Role ID':'شناسه نقش'} bind:value={form.id} />
      <input class="ri" type="text" placeholder={lang==='en'?'Persian name':'نام فارسی'} bind:value={form.nameFa} />
      <input class="ri" type="text" placeholder={lang==='en'?'English name':'نام انگلیسی'} bind:value={form.nameEn} />
      <div class="rlbl"><span class="rls">{t(lang, 'permissions')}</span></div>
      <PermissionGrid permissions={form.permissions} {lang} onToggle={togglePerm} />
      <div class="rfb">
        <button class="rbs" onclick={handleAdd}>{t(lang, 'save')}</button>
        <button class="rbd" onclick={() => { showAdd = false; error = ''; }}>{t(lang, 'cancel')}</button>
      </div>
    </div>
  {/if}

  {#if confirmDelete}
    <div class="rdc">
      <span class="rdt">{t(lang, 'confirmDeleteRole')}</span>
      <div class="rdb">
        <button class="rdy" onclick={() => handleDelete(confirmDelete)}>{lang==='en'?'Delete':'حذف'}</button>
        <button class="rdn" onclick={() => confirmDelete = null}>{t(lang, 'cancel')}</button>
      </div>
    </div>
  {/if}

  <div class="rlist">
    {#each roles as role}
      <div class="rlr" class:rlr--sel={selected?.id === role.id}>
        <button class="rli" onclick={() => selectRole(role)}>
          <span class="rlb" style="background:{role.isDefault ? 'var(--color-accent-bg)' : 'var(--color-bg-secondary)'}">
            {(role.name[lang] || role.name.fa || role.id)[0]}
          </span>
          <div class="rid">
            <span class="run">{role.name[lang] || role.name.fa || role.id}</span>
            <span class="ruc">{role.permissions.length} {lang==='en'?'permissions':'مجوز'}</span>
          </div>
        </button>
        {#if !role.isDefault}
          <button class="rdl" onclick={() => confirmDelete = role.id}>✕</button>
        {/if}
      </div>
      {#if selected?.id === role.id}
        <div class="rpp">
          <PermissionGrid permissions={role.permissions} {lang} readonly={role.isDefault}
            onToggle={(perm) => {
              const p = role.permissions.includes(perm)
                ? role.permissions.filter(x => x !== perm)
                : [...role.permissions, perm];
              updatePerms(role.id, p);
            }} />
        </div>
      {/if}
    {/each}
  </div>
</div>
<style>
  .rl{display:flex;flex-direction:column;gap:0.6rem}
  .rh{display:flex;align-items:center;justify-content:space-between}
  .rt{font-weight:600;font-size:var(--font-size-sm);color:var(--color-text-primary)}
  .rb{padding:0.35rem 0.85rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);
    background:var(--color-accent-bg);color:var(--color-accent);font-size:var(--font-size-xs);font-weight:600;cursor:pointer}
  .rb:hover{background:var(--color-accent);color:var(--color-accent-text)}
  .rf{display:flex;flex-direction:column;gap:0.5rem;padding:0.75rem;
    background:var(--color-bg-secondary);border-radius:var(--radius-md);border:1px solid var(--color-border)}
  .re,.rdt{font-size:var(--font-size-xs);color:#dc2626;padding:0.3rem 0}
  .ri{padding:0.45rem 0.65rem;border:1px solid var(--color-border);border-radius:var(--radius-sm);
    font-size:var(--font-size-sm);font-family:var(--font-body);background:var(--color-bg-primary);color:var(--color-text-primary)}
  .rlbl{display:flex;align-items:center}
  .rls{font-size:var(--font-size-xs);font-weight:600;color:var(--color-text-muted)}
  .rfb{display:flex;gap:0.5rem}
  .rbs{padding:0.4rem 1rem;border:none;border-radius:var(--radius-sm);background:var(--color-accent);
    color:var(--color-accent-text);font-size:var(--font-size-xs);font-weight:600;cursor:pointer}
  .rbd{padding:0.4rem 1rem;border:1px solid var(--color-border);border-radius:var(--radius-sm);
    background:none;font-size:var(--font-size-xs);cursor:pointer;color:var(--color-text-secondary)}
  .rdc{display:flex;flex-direction:column;gap:0.5rem;padding:0.75rem;
    background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-md)}
  .rdb{display:flex;gap:0.5rem}
  .rdy,.rdn{padding:0.35rem 1rem;border-radius:var(--radius-sm);font-size:var(--font-size-xs);cursor:pointer}
  .rdy{border:none;background:#dc2626;color:#fff}
  .rdn{border:1px solid var(--color-border);background:none;color:var(--color-text-secondary)}
  .rlist{display:flex;flex-direction:column;gap:0.3rem}
  .rlr{display:flex;align-items:center;justify-content:space-between;border:1px solid var(--color-border);border-radius:var(--radius-sm)}
  .rlr--sel{border-color:var(--color-accent)}
  .rli{display:flex;align-items:center;gap:0.65rem;flex:1;padding:0.55rem 0.75rem;border:none;background:none;cursor:pointer;text-align:start}
  .rlb{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:var(--font-size-xs);font-weight:700;color:var(--color-accent);flex-shrink:0}
  .rid{display:flex;flex-direction:column;gap:0.1rem}
  .run{font-size:var(--font-size-sm);font-weight:500;color:var(--color-text-primary)}
  .ruc{font-size:var(--font-size-xs);color:var(--color-text-muted)}
  .rdl{border:none;background:none;color:var(--color-text-muted);cursor:pointer;font-size:var(--font-size-sm);padding:4px;margin-right:0.5rem}
  .rdl:hover{color:var(--color-danger)}
  .rpp{padding:0.6rem 0.85rem;border-top:1px solid var(--color-border);background:var(--color-bg-secondary)}
</style>
