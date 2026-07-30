<script>
  /**
   * LocalEditor.svelte – Browser-based Markdown editor
   *
   * LIMITATION: Because the site is hosted statically (no backend),
   * edits cannot be saved to the server. The user must:
   *   1. Edit in this editor
   *   2. Download the .md file
   *   3. Replace the file in wiki-content/
   *   4. Rebuild the project (npm run build)
   */
  import { t } from '../logic/i18n.js';
  import { getPageContent, parseMarkdown } from '../logic/wiki.js';

  let { slug = 'home', lang = 'fa' } = $props();

  let rawMarkdown = $derived(getPageContent(slug, lang) || '');
  let editorContent = $state('');
  let previewHtml = $derived(parseMarkdown(editorContent));
  let mode = $state('write'); // 'write' or 'preview'

  // Sync when props change (navigating to a different page)
  $effect(() => {
    editorContent = rawMarkdown;
  });

  /** Download the current content as a .md file */
  function downloadMarkdown() {
    const fileName = `${slug}.${lang}.md`;
    const blob = new Blob([editorContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="editor-container">
  <div class="editor-header">
    <h2 class="editor-title">{t(lang, 'editorTitle')}: {slug}.{lang}.md</h2>

    <div class="editor-actions">
      <div class="mode-tabs">
        <button
          class="mode-tab"
          class:mode-tab--active={mode === 'write'}
          onclick={() => mode = 'write'}
        >
          {t(lang, 'write')}
        </button>
        <button
          class="mode-tab"
          class:mode-tab--active={mode === 'preview'}
          onclick={() => mode = 'preview'}
        >
          {t(lang, 'preview')}
        </button>
      </div>

      <button class="btn-download" onclick={downloadMarkdown}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {t(lang, 'downloadMarkdown')}
      </button>
    </div>
  </div>

  <div class="editor-notice">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <span>{t(lang, 'editorNote')}</span>
  </div>

  <div class="editor-body">
    {#if mode === 'write'}
      <textarea
        class="editor-textarea"
        value={editorContent}
        oninput={(e) => editorContent = e.target.value}
        spellcheck="false"
      ></textarea>
    {:else}
      <div class="editor-preview">
        {@html previewHtml}
      </div>
    {/if}
  </div>
</div>

<style>
  .editor-container {
    max-width: 1000px;
    width: 100%;
    padding: 1.5rem;
    animation: pageIn 300ms ease;
  }

  @keyframes pageIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .editor-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .editor-title {
    font-size: var(--font-size-xl);
    margin: 0;
    color: var(--color-accent);
  }

  .editor-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  /* ---- Mode tabs ---- */
  .mode-tabs {
    display: flex;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .mode-tab {
    padding: 0.4rem 1rem;
    border: none;
    background: var(--color-bg-secondary);
    color: var(--color-text-secondary);
    font-family: var(--font-body);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .mode-tab:first-child {
    border-left: 1px solid var(--color-border);
  }

  .mode-tab--active {
    background: var(--color-accent);
    color: var(--color-accent-text);
  }

  .mode-tab:hover:not(.mode-tab--active) {
    background: var(--color-bg-hover);
  }

  /* ---- Download button ---- */
  .btn-download {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-md);
    background: var(--color-accent);
    color: var(--color-accent-text);
    font-family: var(--font-body);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-download:hover {
    background: var(--color-accent-dark);
    border-color: var(--color-accent-dark);
  }

  /* ---- Notice ---- */
  .editor-notice {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background: var(--color-accent-bg);
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-md);
    color: var(--color-accent-dark);
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }

  .editor-notice svg {
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ---- Editor body ---- */
  .editor-body {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    min-height: 60vh;
  }

  .editor-textarea {
    width: 100%;
    min-height: 60vh;
    padding: 1.25rem;
    border: none;
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    line-height: 1.8;
    resize: vertical;
    outline: none;
    direction: ltr;
    text-align: left;
  }

  .editor-preview {
    padding: 1.5rem 2rem;
    background: var(--color-bg-primary);
    line-height: 1.85;
    min-height: 60vh;
  }

  /* ---- Responsive ---- */
  @media (max-width: 640px) {
    .editor-container {
      padding: 1rem;
    }

    .editor-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .editor-preview {
      padding: 1rem;
    }
  }
</style>