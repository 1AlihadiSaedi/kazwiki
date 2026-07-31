<script>
  import './styles/global.css';
  import { initTheme } from './logic/theme.js';
  import { t, getDirection } from './logic/i18n.js';
  import { getAuthState } from './logic/auth.js';
  import { getMyProfile } from './logic/db.js';
  import { HOME_PAGE, DEFAULT_LANGUAGE } from './config.js';
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import WikiPage from './components/WikiPage.svelte';
  import LocalEditor from './components/LocalEditor.svelte';
  import LoginPage from './components/LoginPage.svelte';
  import SettingsPage from './components/SettingsPage.svelte';

  let lang = $state(DEFAULT_LANGUAGE);
  let currentRoute = $state('wiki');
  let currentSlug = $state(HOME_PAGE);
  let editorMode = $state(false);
  let searchQuery = $state('');
  let user = $state(null);
  let role = $state(null);

  const DESKTOP = 769;
  const SB_KEY = 'emerald-wiki-sidebar';

  function getSidebarInit() {
    if (typeof window === 'undefined') return false;
    if (window.innerWidth < DESKTOP) return false;
    try { return localStorage.getItem(SB_KEY) === 'open'; }
    catch { return false; }
  }

  let sidebarOpen = $state(getSidebarInit());

  function saveSidebar(val) {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= DESKTOP) {
      try { localStorage.setItem(SB_KEY, val ? 'open' : 'closed'); } catch {}
    }
  }

  $effect(() => { try { initTheme(); } catch {} });
  $effect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = getDirection(lang);
    if (lang === 'en') document.body.classList.add('ltr');
    else document.body.classList.remove('ltr');
  });
  $effect(() => { try { restoreAuth(); } catch (e) { console.warn('Auth:', e); } });

  async function restoreAuth() {
    try {
      const result = await getAuthState();
      if (result && result.user) {
        user = result.user;
        try { const profile = await getMyProfile(); role = profile?.role || 'viewer'; }
        catch { role = 'viewer'; }
      }
    } catch (e) { console.warn('Auth unavailable:', e.message); }
  }

  function readRoute() {
    const hash = window.location.hash.slice(1) || `/${HOME_PAGE}`;
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');
    if (path === '/login') { currentRoute = 'login'; editorMode = false; }
    else if (path === '/settings') { currentRoute = 'settings'; editorMode = false; }
    else if (path.startsWith('/edit/')) {
      currentRoute = 'wiki'; editorMode = true;
      currentSlug = path.replace('/edit/', '') || HOME_PAGE;
    } else {
      currentRoute = 'wiki'; editorMode = false;
      currentSlug = path.replace(/^\//, '') || HOME_PAGE;
    }
    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'fa') lang = urlLang;
  }

  $effect(() => {
    readRoute();
    window.addEventListener('hashchange', readRoute);
    return () => window.removeEventListener('hashchange', readRoute);
  });

  function navigate(slug) { window.location.hash = `#/${slug}?lang=${lang}`; }
  function goTo(page) { window.location.hash = `#/${page}?lang=${lang}`; }
  function toggleEditor() {
    if (editorMode) window.location.hash = `#/${currentSlug}?lang=${lang}`;
    else window.location.hash = `#/edit/${currentSlug}?lang=${lang}`;
  }
  function handleSearch(query) { searchQuery = query; }
  function toggleSidebar() { sidebarOpen = !sidebarOpen; saveSidebar(sidebarOpen); }
  function closeSidebar() { sidebarOpen = false; saveSidebar(false); }
  function openSidebar() { sidebarOpen = true; saveSidebar(true); }
</script>

<div class="app-layout">
  <Header {lang} {user} {role} currentRoute={currentRoute} onToggleSidebar={toggleSidebar} onSearch={handleSearch} onNavigate={goTo} />
  <div class="app-body">
    {#if currentRoute === 'wiki' || currentRoute === 'login' || currentRoute === 'settings'}
      <Sidebar {lang} isOpen={sidebarOpen} currentSlug={currentSlug} onNavigate={navigate} onClose={closeSidebar} onOpen={openSidebar} />
    {/if}
    <main class="main-content">
      {#if currentRoute === 'wiki' && user}
        <button class="editor-fab" onclick={toggleEditor} title={editorMode ? 'View' : 'Edit'}>
          {#if editorMode}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          {/if}
        </button>
      {/if}
      {#if currentRoute === 'login'}
        <LoginPage {lang} />
      {:else if currentRoute === 'settings'}
        {#if user}
          <SettingsPage {lang} {user} {role} />
        {:else}
          <div class="page-empty"><h2>{t(lang, 'pageNotFound')}</h2><p><a href="#/login">{t(lang, 'login')}</a></p></div>
        {/if}
      {:else if editorMode && user}
        <LocalEditor slug={currentSlug} {lang} />
      {:else if editorMode}
        <div class="page-empty"><h2>{t(lang, 'pageNotFound')}</h2><p><a href="#/login">{t(lang, 'login')}</a></p></div>
      {:else}
        <WikiPage slug={currentSlug} {lang} />
      {/if}
    </main>
  </div>
  <Footer {lang} />
</div>

<style>
  .app-layout { display:flex; flex-direction:column; min-height:100vh; background:var(--color-bg-secondary); transition:background var(--transition-normal); }
  .app-body { display:flex; flex:1; max-width:1200px; width:100%; margin:0 auto; }
  .main-content { flex:1; min-width:0; display:flex; justify-content:center; position:relative; }
  .page-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:50vh; text-align:center; gap:1rem; }
  .page-empty h2 { color:var(--color-text-secondary); margin:0; }
  .editor-fab { position:fixed; bottom:1.5rem; left:1.5rem; z-index:80; width:48px; height:48px; border:none; border-radius:50%; background:var(--color-accent); color:var(--color-accent-text); box-shadow:var(--shadow-md); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all var(--transition-fast); }
  .editor-fab:hover { background:var(--color-accent-dark); box-shadow:var(--shadow-lg); transform:scale(1.05); }
  @media (max-width:768px) { .app-body { flex-direction:column; } }
</style>
