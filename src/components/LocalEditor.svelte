<script>
  import { t } from '../logic/i18n.js';
  import { getPageContent, parseMarkdown } from '../logic/wiki.js';

  let { slug = 'home', lang = 'fa' } = $props();
  let rawMarkdown = $derived(getPageContent(slug, lang) || '');
  let editorContent = $state('');
  let previewHtml = $derived(parseMarkdown(editorContent));
  let mode = $state('write');
  let saving = $state(false);
  let saveMsg = $state('');
  let saveOk = $state(false);

  $effect(() => { editorContent = rawMarkdown; saveMsg = ''; });

  async function saveToFile() {
    saving = true; saveMsg = '';
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, lang, content: editorContent }),
      });
      const data = await res.json();
      if (data.ok) { saveOk = true; saveMsg = t(lang, 'saved') + ' → ' + data.file; }
      else { saveOk = false; saveMsg = t(lang, 'saveError') + ': ' + data.error; }
    } catch { saveOk = false; saveMsg = t(lang, 'saveError'); }
    saving = false;
    setTimeout(() => saveMsg = '', 4000);
  }
</script>

<div class="editor-container">
  <div class="editor-header">
    <h2 class="editor-title">{slug}.{lang}.md</h2>
    <div class="editor-actions">
      <div class="mode-tabs">
        <button class="mode-tab" class:mode-tab--active={mode==='write'} onclick={()=>mode='write'}>{t(lang, 'write')}</button>
        <button class="mode-tab" class:mode-tab--active={mode==='preview'} onclick={()=>mode='preview'}>{t(lang, 'preview')}</button>
      </div>
      <button class="btn-save" onclick={saveToFile} disabled={saving}>
        {#if saving}<span class="spinner"></span>{t(lang, 'saving')}
        {:else}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>{t(lang, 'save')}
        {/if}
      </button>
    </div>
  </div>
  {#if saveMsg}
    <div class="save-msg" class:save-msg--ok={saveOk} class:save-msg--err={!saveOk}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        {#if saveOk}<polyline points="20 6 9 17 4 12"/>
        {:else}<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        {/if}
      </svg>
      <span>{saveMsg}</span>
    </div>
  {/if}
  <div class="editor-body">
    {#if mode === 'write'}
      <textarea class="editor-textarea" value={editorContent} oninput={e=>editorContent=e.target.value} spellcheck="false"></textarea>
    {:else}
      <div class="editor-preview">{@html previewHtml}</div>
    {/if}
  </div>
</div>

<style>
  .editor-container { max-width:1000px;width:100%;padding:1.5rem;animation:pageIn 300ms ease }
  @keyframes pageIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .editor-header { display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.75rem;margin-bottom:1rem }
  .editor-title { font-size:var(--font-size-xl);margin:0;color:var(--color-accent) }
  .editor-actions { display:flex;align-items:center;gap:0.75rem }
  .mode-tabs { display:flex;border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden }
  .mode-tab { padding:0.4rem 1rem;border:none;background:var(--color-bg-secondary);color:var(--color-text-secondary);font-family:var(--font-body);font-size:var(--font-size-sm);cursor:pointer;transition:all var(--transition-fast) }
  .mode-tab:first-child { border-left:1px solid var(--color-border) }
  .mode-tab--active { background:var(--color-accent);color:var(--color-accent-text) }
  .mode-tab:hover:not(.mode-tab--active) { background:var(--color-bg-hover) }
  .btn-save { display:flex;align-items:center;gap:0.5rem;padding:0.4rem 1rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent);color:var(--color-accent-text);font-family:var(--font-body);font-size:var(--font-size-sm);font-weight:600;cursor:pointer;transition:all var(--transition-fast) }
  .btn-save:hover:not(:disabled) { background:var(--color-accent-dark) }
  .btn-save:disabled { opacity:0.65;cursor:not-allowed }
  .save-msg { display:flex;align-items:center;gap:0.5rem;padding:0.6rem 1rem;margin-bottom:1rem;border-radius:var(--radius-md);font-size:var(--font-size-sm);direction:ltr;text-align:left }
  .save-msg--ok { background:#d1fae5;border:1px solid #6ee7b7;color:#065f46 }
  .save-msg--err { background:#fef2f2;border:1px solid #fecaca;color:#dc2626 }
  :global([data-theme="dark"]) .save-msg--ok { background:#064e3b;border-color:#059669;color:#34d399 }
  :global([data-theme="dark"]) .save-msg--err { background:#450a0a;border-color:#7f1d1d;color:#fca5a5 }
  .editor-body { border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;min-height:60vh }
  .editor-textarea { width:100%;min-height:60vh;padding:1.25rem;border:none;background:var(--color-bg-primary);color:var(--color-text-primary);font-family:var(--font-mono);font-size:var(--font-size-sm);line-height:1.8;resize:vertical;outline:none;direction:ltr;text-align:left }
  .editor-preview { padding:1.5rem 2rem;background:var(--color-bg-primary);line-height:1.85;min-height:60vh }
  .spinner { width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite }
  @keyframes spin { to{transform:rotate(360deg)} }
  @media (max-width:640px) { .editor-container{padding:1rem} .editor-header{flex-direction:column;align-items:flex-start} .editor-preview{padding:1rem} }
</style>
