<script>
  /**
   * Sidebar.svelte – Navigation sidebar with page list
   * Slides in/out on mobile; always visible on desktop.
   */
  import { t } from '../logic/i18n.js';
  import { getAllSlugs } from '../logic/wiki.js';

  let { lang = 'fa', isOpen = false, currentSlug = 'home', onNavigate, onClose } = $props();

  const pages = $derived(getAllSlugs());
</script>

<!-- Overlay for mobile -->
{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="sidebar-overlay" role="button" tabindex="-1" onclick={() => onClose && onClose()}
    onkeydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') { onClose && onClose(); } }}></div>
{/if}

<aside class="sidebar" class:sidebar--open={isOpen}>
  <div class="sidebar-header">
    <span class="sidebar-title">{t(lang, 'allPages')}</span>
    <button class="sidebar-close" onclick={() => onClose && onClose()} aria-label={t(lang, 'closeSidebar')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>

  <nav class="sidebar-nav">
    <ul class="page-list">
      {#each pages as page (page.slug)}
        <li>
          <button
            class="page-link"
            class:page-link--active={currentSlug === page.slug}
            onclick={() => {
              if (onNavigate) onNavigate(page.slug);
              if (onClose) onClose();
            }}
          >
            <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span class="page-title">{page.titles[lang] || page.titles.fa || page.slug}</span>
          </button>
        </li>
      {/each}
    </ul>
  </nav>
</aside>

<style>
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 90;
    animation: fadeIn 200ms ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--sidebar-width);
    max-width: 85vw;
    background: var(--color-bg-primary);
    border-left: 1px solid var(--color-border);
    z-index: 95;
    transform: translateX(100%);
    transition: transform var(--transition-normal);
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
  }

  .sidebar--open {
    transform: translateX(0);
  }

  /* On desktop, always visible inline */
  @media (min-width: 769px) {
    .sidebar-overlay {
      display: none;
    }

    .sidebar {
      position: sticky;
      top: var(--header-height);
      height: calc(100vh - var(--header-height));
      transform: none;
      border-left: none;
      border-right: 1px solid var(--color-border);
      box-shadow: none;
      z-index: 10;
    }

    .sidebar-close {
      display: none;
    }
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar-title {
    font-weight: 600;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
  }

  .sidebar-close:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem 0;
  }

  .page-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .page-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.6rem 1rem;
    border: none;
    background: none;
    color: var(--color-text-secondary);
    font-family: var(--font-body);
    font-size: var(--font-size-sm);
    cursor: pointer;
    text-align: right;
    transition: all var(--transition-fast);
  }

  .page-link:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .page-link--active {
    background: var(--color-accent-bg);
    color: var(--color-accent);
    font-weight: 600;
    border-left: 3px solid var(--color-accent);
  }

  .page-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .page-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>