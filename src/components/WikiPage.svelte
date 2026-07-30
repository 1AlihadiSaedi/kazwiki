<script>
  /**
   * WikiPage.svelte – Renders a wiki page from markdown content
   */
  import { t } from '../logic/i18n.js';
  import { getPageContent, getPageIndex, parseMarkdown } from '../logic/wiki.js';

  let { slug = 'home', lang = 'fa' } = $props();

  // Derived state: raw markdown and parsed HTML
  let rawMarkdown = $derived(getPageContent(slug, lang));
  let htmlContent = $derived(rawMarkdown ? parseMarkdown(rawMarkdown) : null);

  // Get page title from index
  let pageIndex = $derived(getPageIndex());
  let pageTitle = $derived(
    pageIndex.find((p) => p.slug === slug && p.lang === lang)?.title ||
    pageIndex.find((p) => p.slug === slug)?.title ||
    slug
  );
</script>

<article class="wiki-page">
  {#if htmlContent}
    <header class="page-header">
      <h1 class="page-heading">{pageTitle}</h1>
    </header>
    <div class="page-content">
      {@html htmlContent}
    </div>
  {:else}
    <div class="page-empty">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <h2>{t(lang, 'pageNotFound')}</h2>
      <p>
        <a href="/">{t(lang, 'backToHome')}</a>
      </p>
    </div>
  {/if}
</article>

<style>
  .wiki-page {
    max-width: 800px;
    width: 100%;
    padding: 2rem;
    animation: pageIn 300ms ease;
  }

  @keyframes pageIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .page-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .page-heading {
    margin: 0;
    font-size: var(--font-size-3xl);
    color: var(--color-accent);
  }

  .page-content {
    line-height: 1.85;
    color: var(--color-text-primary);
  }

  /* Empty / 404 state */
  .page-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
    gap: 1rem;
  }

  .empty-icon {
    color: var(--color-text-muted);
  }

  .page-empty h2 {
    color: var(--color-text-secondary);
    margin: 0;
  }

  /* ---- Responsive ---- */
  @media (max-width: 640px) {
    .wiki-page {
      padding: 1rem;
    }

    .page-heading {
      font-size: var(--font-size-2xl);
    }
  }
</style>