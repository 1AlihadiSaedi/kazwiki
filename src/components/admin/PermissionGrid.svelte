<script>
import { ALL_PERMISSIONS } from '../../config.js';
let { permissions = [], lang = 'fa', readonly = false, onToggle } = $props();
function toggle(perm) {
  if (readonly || !onToggle) return;
  onToggle(perm);
}
function has(perm) { return permissions.includes(perm); }
</script>
<div class="pg">
  {#each ALL_PERMISSIONS as perm}
    <label class="pgi" class:pgi--on={has(perm.id)} class:pgi--ro={readonly}>
      <input type="checkbox" checked={has(perm.id)} disabled={readonly}
        onchange={() => toggle(perm.id)} />
      <span class="pgn">{lang === 'en' ? perm.en : perm.fa}</span>
    </label>
  {/each}
</div>
<style>
  .pg{display:flex;flex-direction:column;gap:0.35rem}
  .pgi{display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.75rem;
    border:1px solid var(--color-border);border-radius:var(--radius-sm);
    cursor:pointer;transition:all var(--transition-fast);font-size:var(--font-size-sm)}
  .pgi:hover{background:var(--color-bg-hover)}
  .pgi--on{background:var(--color-accent-bg);border-color:var(--color-accent)}
  .pgi--ro{cursor:default;opacity:0.85}
  .pgi--ro:hover{background:transparent}
  .pgn{color:var(--color-text-primary)}
</style>
