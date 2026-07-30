<script>
  /**
   * App.svelte – Root component for Emerald Wiki
   * Manages routing, auth state, theme, and layout.
   */
  import './styles/global.css';

  import { initTheme } from './logic/theme.js';
  import { t, getDirection } from './logic/i18n.js';
  import { getAuthState, onAuthChange } from './logic/auth.js';
  import { getMyProfile } from './logic/db.js';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import WikiPage from './components/WikiPage.svelte';
  import LocalEditor from './components/LocalEditor.svelte';
  import LoginPage from './components/LoginPage.svelte';
  import SettingsPage from './components/SettingsPage.svelte';

  // ---- UI state ----
  let lang = $state('fa');
  let currentRoute = $state('home');   // 'home', 'login', 'settings'
  let currentSlug = $state('home');
  let editorMode = $state(false);
  let sidebarOpen = $state(false);
  let searchQuery = $state('');

  // ---- Auth state ----
  let user = $state(null);
  let role = $state(null);
  let authLoading = $state(true);

  // Apply theme on mount
  $effect(() => { initTheme(); });

  // Update document direction + language
  $effect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = getDirection(lang);
    if (lang === 'en') document.body.classList.add('ltr');
    else document.body.classList.remove('ltr');
  });

  // Restore auth session on mount
  $effect(() => {
    restoreAuth();
  });

  async function restoreAuth() {
    authLoading = true;
    const { user: u, role: r } = await getAuthState();
    if (u) {
      user = u;
      // Fetch role from profiles table
      try {
        const profile = await getMyProfile();
        role = profile?.role || 'viewer';
      } catch { role = 'viewer'; }
    }
    authLoading = false;
  }

  /**
   * Hash-based routing.
   * Routes: #/slug, #/edit/slug, #/login, #/settings
   */
  function readRoute() {
    const hash = window.location.hash.slice(1) || '/home';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    // Special routes
    if (path === '/login') {
      currentRoute = 'login';
      editorMode = false;
    } else if (path === '/settings') {
      currentRoute = 'settings';
      editorMode = false;
    } else if (path.startsWith('/edit/')) {
      currentRoute = 'wiki';
      editorMode = true;
      currentSlug = path.replace('/edit/', '') || 'home';
    } else {
      currentRoute = 'wiki';
      editorMode = false;
      currentSlug = path.replace(/^\//, '') || 'home';
    }

    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'fa') lang = urlLang;
  }

  // Read route on mount + hash changes
  $effect(() => {
    readRoute();
    window.addEventListener('hashchange', readRoute);
    return () => window.removeEventListener('hashchange', readRoute);
  });

  /** Navigate */
  function navigate(slug) {
    window.location.hash = `#/${slug}?lang=${lang}`;
  }

  function goTo(page) {
    window.location.hash = `#/${page}?lang=${lang}`;
  }

  function toggleEditor() {
    if (editorMode) window.location.hash = `#/${currentSlug}?lang=${lang}`;
    else window.location.hash = `#/edit/${currentSlug}?lang=${lang}`;
  }

  function handleLanguageChange(newLang) {
    lang = newLang;
    const hash = window.location.hash.slice(1) || '/home';
    const [path] = hash.split('?');
    window.location.hash = `${path}?lang=${newLang}`;
  }

  function handleSearch(query) { searchQuery = query; }
  function toggleSidebar() { sidebarOpen = !sidebarOpen; }
  function closeSidebar() { sidebarOpen = false; }
</script>

<div class="app-layout">
  <Header
    {lang}
    {user}
    {role}
    currentRoute={currentRoute}
    onToggleSidebar={toggleSidebar}
    onSearch={handleSearch}
    onNavigate={goTo}
  />

  <div class="app-body">
    {#if currentRoute === 'wiki' || currentRoute === 'login' || currentRoute === 'settings'}
      <Sidebar
        {lang}
        isOpen={sidebarOpen}
        currentSlug={currentSlug}
        onNavigate={navigate}
        onClose={closeSidebar}
      />
    {/if}

    <main class="main-content">
      {#if currentRoute === 'wiki'}
        <button class="editor-fab" onclick={toggleEditor}
          title={editorMode ? 'View page' : 'Edit page'}>
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
      {/if}

      {#if currentRoute === 'login'}
        <LoginPage {lang} />
      {:else if currentRoute === 'settings'}
        {#if user}
          <SettingsPage {lang} {user} {role} />
        {:else}
          <div class="page-empty">
            <h2>{t(lang, 'pageNotFound')}</h2>
            <p><a href="#/login">{t(lang, 'login')}</a></p>
          </div>
        {/if}
      {:else if editorMode}
        <LocalEditor slug={currentSlug} {lang} />
      {:else}
        <WikiPage slug={currentSlug} {lang} />
      {/if}
    </main>
  </div>

  <Footer {lang} />
</div>

<style>
  .app-layout { display: flex; flex-direction: column; min-height: 100vh; background: var(--color-bg-secondary); transition: background var(--transition-normal); }
  .app-body { display: flex; flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; }
  .main-content { flex: 1; min-width: 0; display: flex; justify-content: center; position: relative; }
  .page-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; gap: 1rem; }
  .page-empty h2 { color: var(--color-text-secondary); margin: 0; }
  .editor-fab { position: fixed; bottom: 1.5rem; left: 1.5rem; z-index: 80; width: 48px; height: 48px; border: none; border-radius: 50%; background: var(--color-accent); color: var(--color-accent-text); box-shadow: var(--shadow-md); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); }
  .editor-fab:hover { background: var(--color-accent-dark); box-shadow: var(--shadow-lg); transform: scale(1.05); }
  @media (max-width: 768px) { .app-body { flex-direction: column; } }
</style>
