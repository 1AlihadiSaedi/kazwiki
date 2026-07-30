<script>
  /**
   * App.svelte – Root component for Emerald Wiki
   * Manages routing (page slug + language), theme, and layout.
   */
  import './styles/global.css';

  import { initTheme } from './logic/theme.js';
  import { getDirection } from './logic/i18n.js';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import WikiPage from './components/WikiPage.svelte';
  import LocalEditor from './components/LocalEditor.svelte';

  // ---- Application state ----
  let lang = $state('fa');
  let currentSlug = $state('home');
  let editorMode = $state(false);
  let sidebarOpen = $state(false);
  let searchQuery = $state('');

  // Apply theme on mount
  $effect(() => {
    initTheme();
  });

  // Update document direction and language when lang changes
  $effect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = getDirection(lang);

    if (lang === 'en') {
      document.body.classList.add('ltr');
    } else {
      document.body.classList.remove('ltr');
    }
  });

  /**
   * Simple hash-based routing.
   * Supports: #/slug, #/edit/slug, #/slug?lang=en
   */
  function readRoute() {
    const hash = window.location.hash.slice(1) || '/home';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    // Check for editor route
    if (path.startsWith('/edit/')) {
      editorMode = true;
      currentSlug = path.replace('/edit/', '') || 'home';
    } else {
      editorMode = false;
      currentSlug = path.replace(/^\//, '') || 'home';
    }

    // Read language from query param
    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'fa') {
      lang = urlLang;
    }
  }

  // Read route on mount and on hash change
  $effect(() => {
    readRoute();
    window.addEventListener('hashchange', readRoute);
    return () => window.removeEventListener('hashchange', readRoute);
  });

  /** Navigate to a wiki page */
  function navigate(slug) {
    window.location.hash = `#/${slug}?lang=${lang}`;
  }

  /** Toggle editor for current page */
  function toggleEditor() {
    if (editorMode) {
      window.location.hash = `#/${currentSlug}?lang=${lang}`;
    } else {
      window.location.hash = `#/edit/${currentSlug}?lang=${lang}`;
    }
  }

  /** Handle language change */
  function handleLanguageChange(newLang) {
    lang = newLang;
    window.location.hash = `#/${currentSlug}?lang=${newLang}`;
  }

  /** Filter pages by search query */
  function handleSearch(query) {
    searchQuery = query;
  }

  /** Toggle sidebar */
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  /** Close sidebar */
  function closeSidebar() {
    sidebarOpen = false;
  }
</script>

<div class="app-layout">
  <Header
    {lang}
    onToggleSidebar={toggleSidebar}
    onSearch={handleSearch}
  />

  <div class="app-body">
    <Sidebar
      {lang}
      isOpen={sidebarOpen}
      currentSlug={currentSlug}
      onNavigate={navigate}
      onClose={closeSidebar}
    />

    <main class="main-content">
      <!-- Editor toggle button (floating) -->
      <button
        class="editor-fab"
        onclick={toggleEditor}
        title={editorMode ? 'View page' : 'Edit page'}
      >
        {#if editorMode}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        {/if}
      </button>

      {#if editorMode}
        <LocalEditor slug={currentSlug} {lang} />
      {:else}
        <WikiPage slug={currentSlug} {lang} />
      {/if}
    </main>
  </div>

  <Footer {lang} />
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--color-bg-secondary);
    transition: background var(--transition-normal);
  }

  .app-body {
    display: flex;
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .main-content {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
    position: relative;
  }

  /* ---- Editor FAB (Floating Action Button) ---- */
  .editor-fab {
    position: fixed;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 80;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-accent-text);
    box-shadow: var(--shadow-md);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
  }

  .editor-fab:hover {
    background: var(--color-accent-dark);
    box-shadow: var(--shadow-lg);
    transform: scale(1.05);
  }

  /* ---- Responsive: stack sidebar on mobile ---- */
  @media (max-width: 768px) {
    .app-body {
      flex-direction: column;
    }
  }
</style>