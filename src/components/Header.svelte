<script>
  /**
   * Header.svelte – Top navigation bar
   * Shows site title, hamburger menu toggle, search, theme & language controls.
   */
  import { t, getDirection } from '../logic/i18n.js';
  import ThemeToggle from './ThemeToggle.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  let { lang = 'fa', onToggleSidebar, onSearch } = $props();

  let searchQuery = $state('');
  let searchFocused = $state(false);

  function handleSearchInput(e) {
    searchQuery = e.target.value;
    if (onSearch) onSearch(searchQuery);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      searchQuery = '';
      if (onSearch) onSearch('');
    }
  }
</script>

<header class="header">
  <div class="header-inner">
    <!-- Hamburger -->
    <button
      class="hamburger"
      onclick={() => onToggleSidebar && onToggleSidebar()}
      aria-label={t(lang, 'toggleSidebar')}
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- Site title -->
    <a href="/" class="site-title">
      <span class="logo-icon">◆</span>
      <span class="logo-text">{t(lang, 'siteTitle')}</span>
    </a>

    <!-- Search -->
    <div class="search-wrapper" class:search-wrapper--focused={searchFocused}>
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        class="search-input"
        placeholder={t(lang, 'search')}
        value={searchQuery}
        oninput={handleSearchInput}
        onfocus={() => searchFocused = true}
        onblur={() => searchFocused = false}
        onkeydown={handleKeyDown}
      />
    </div>

    <!-- Controls -->
    <div class="header-controls">
      <LanguageSwitcher {lang} />
      <ThemeToggle {lang} />
    </div>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    height: var(--header-height);
    background: var(--color-bg-primary);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    transition: background var(--transition-normal), border var(--transition-normal);
  }

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1rem;
  }

  /* ---- Site title ---- */
  .site-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--color-accent);
    font-weight: 700;
    font-size: var(--font-size-lg);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .logo-icon {
    font-size: 1.4em;
  }

  .logo-text {
    color: var(--color-text-primary);
  }

  /* ---- Hamburger ---- */
  .hamburger {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
    flex-shrink: 0;
  }

  .hamburger:hover {
    background: var(--color-bg-hover);
  }

  .hamburger-line {
    display: block;
    width: 20px;
    height: 2px;
    background: var(--color-text-primary);
    border-radius: 1px;
    transition: background var(--transition-fast);
  }

  /* ---- Search ---- */
  .search-wrapper {
    flex: 1;
    max-width: 360px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.4rem 0.75rem;
    transition: border var(--transition-fast), box-shadow var(--transition-fast);
  }

  .search-wrapper--focused {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-bg);
  }

  .search-icon {
    width: 18px;
    height: 18px;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .search-input {
    width: 100%;
    border: none;
    background: none;
    font-family: var(--font-body);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    outline: none;
    direction: inherit;
  }

  .search-input::placeholder {
    color: var(--color-text-muted);
  }

  /* ---- Controls ---- */
  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  /* ---- Responsive ---- */
  @media (max-width: 640px) {
    .logo-text {
      display: none;
    }

    .search-wrapper {
      max-width: none;
    }
  }
</style>