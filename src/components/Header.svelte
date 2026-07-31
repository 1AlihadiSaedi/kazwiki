<script>
  import { t } from '../logic/i18n.js';
  import ThemeToggle from './ThemeToggle.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  let { lang = 'fa', user = null, role = null, currentRoute = 'wiki', onToggleSidebar, onSearch, onNavigate } = $props();

  let searchQuery = $state('');
  let searchFocused = $state(false);

  function handleSearchInput(e) { searchQuery = e.target.value; if (onSearch) onSearch(searchQuery); }
  function handleKeyDown(e) { if (e.key === 'Escape') { searchQuery = ''; if (onSearch) onSearch(''); } }
</script>

<header class="header">
  <div class="header-inner">
    <button class="hamburger" onclick={() => onToggleSidebar && onToggleSidebar()} aria-label={t(lang, 'toggleSidebar')}>
      <span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span>
    </button>

    <a href="#/home" class="site-title">
      <span class="logo-icon">◆</span><span class="logo-text">{t(lang, 'siteTitle')}</span>
    </a>

    <div class="search-wrapper" class:search-wrapper--focused={searchFocused}>
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input type="text" class="search-input" placeholder={t(lang, 'search')} value={searchQuery} oninput={handleSearchInput} onfocus={() => searchFocused = true} onblur={() => searchFocused = false} onkeydown={handleKeyDown} />
    </div>

    <div class="header-controls">
      {#if user}
        <span class="user-name">{user.displayName || user.username || ''}</span>
        <a href="#/settings" class="header-btn" title={t(lang, 'settings')} class:header-btn--active={currentRoute === 'settings'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </a>
      {:else}
        <a href="#/login" class="header-btn header-btn--login" title={t(lang, 'login')} class:header-btn--active={currentRoute === 'login'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        </a>
      {/if}

      <LanguageSwitcher {lang} />
      <ThemeToggle {lang} />
    </div>
  </div>
</header>

<style>
  .header { position:sticky; top:0; z-index:100; height:var(--header-height); background:var(--color-bg-primary); border-bottom:1px solid var(--color-border); box-shadow:var(--shadow-sm); transition:background var(--transition-normal),border var(--transition-normal); }
  .header-inner { max-width:1200px; margin:0 auto; height:100%; display:flex; align-items:center; gap:0.75rem; padding:0 1rem; }
  .hamburger { display:flex; flex-direction:column; gap:4px; background:none; border:none; cursor:pointer; padding:6px; border-radius:var(--radius-sm); }
  .hamburger:hover { background:var(--color-bg-hover); }
  .hamburger-line { width:20px; height:2px; background:var(--color-text-secondary); border-radius:2px; transition:all var(--transition-fast); }
  .site-title { display:flex; align-items:center; gap:0.4rem; text-decoration:none; color:var(--color-text-primary); font-weight:700; font-size:var(--font-size-lg); white-space:nowrap; }
  .logo-icon { color:var(--color-accent); font-size:1.4rem; }
  .search-wrapper { position:relative; flex:1; max-width:320px; }
  .search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--color-text-muted); }
  .search-input { width:100%; padding:0.45rem 0.7rem 0.45rem 2rem; border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg-secondary); color:var(--color-text-primary); font-family:var(--font-body); font-size:var(--font-size-sm); outline:none; transition:border var(--transition-fast); }
  .search-input:focus,.search-wrapper--focused .search-input { border-color:var(--color-accent); }
  .header-controls { display:flex; align-items:center; gap:0.5rem; margin-left:auto; }
  .header-btn { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg-secondary); color:var(--color-text-secondary); transition:all var(--transition-fast); }
  .header-btn:hover { background:var(--color-bg-hover); color:var(--color-accent); }
  .header-btn--active { background:var(--color-accent-bg); color:var(--color-accent); border-color:var(--color-accent); }
  .header-btn--login { color:var(--color-accent); border-color:var(--color-accent); }
  .user-name { font-size:var(--font-size-sm); font-weight:600; color:var(--color-text-primary); max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  @media (min-width:769px) { .hamburger { display:none; } }
  @media (max-width:640px) { .logo-text { display:none; } .search-wrapper { max-width:none; } }
</style>
