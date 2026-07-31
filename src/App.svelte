<script>
  import './styles/global.css';
  import { initTheme } from './logic/theme.js';
  import { t, getDirection } from './logic/i18n.js';
  import { getAuthState } from './logic/auth.js';
  import { getMyProfile } from './logic/db.js';
  import { HOME_PAGE, DEFAULT_LANGUAGE, LANGUAGES } from './config.js';
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import WikiPage from './components/WikiPage.svelte';
  import LocalEditor from './components/LocalEditor.svelte';
  import LoginPage from './components/LoginPage.svelte';
  import SettingsPage from './components/SettingsPage.svelte';

  let lang=$state(DEFAULT_LANGUAGE);let currentRoute=$state('wiki');let currentSlug=$state(HOME_PAGE);
  let editorMode=$state(false);let searchQuery=$state('');let user=$state(null);let role=$state(null);
  const DESKTOP=769;const SB_KEY='emerald-wiki-sidebar';
  function getSidebarInit(){if(typeof window==='undefined')return false;if(window.innerWidth<DESKTOP)return false;try{return localStorage.getItem(SB_KEY)==='open'}catch{return false}}
  let sidebarOpen=$state(getSidebarInit());
  function saveSidebar(val){if(typeof window==='undefined')return;if(window.innerWidth>=DESKTOP){try{localStorage.setItem(SB_KEY,val?'open':'closed')}catch{}}}
  $effect(()=>{try{initTheme()}catch{}});
  $effect(()=>{document.documentElement.lang=lang;document.documentElement.dir=getDirection(lang);if(lang==='en')document.body.classList.add('ltr');else document.body.classList.remove('ltr')});
  $effect(()=>{try{restoreAuth()}catch(e){console.warn('Auth:',e)}});
  async function restoreAuth(){try{const r=await getAuthState();if(r&&r.user){user=r.user;try{const p=await getMyProfile();role=p?.role||'viewer'}catch{role='viewer'}}}catch(e){console.warn('Auth unavailable:',e.message)}}

  function readRoute(){
    const hash=window.location.hash.slice(1)||`/${DEFAULT_LANGUAGE}/${HOME_PAGE}`;
    const[path,qs]=hash.split('?');const pr=new URLSearchParams(qs||'');
    if(path==='/login'){currentRoute='login';editorMode=false;return}
    if(path==='/settings'){currentRoute='settings';editorMode=false;return}
    if(path.startsWith('/edit/')){currentRoute='wiki';editorMode=true;parseLS(path.replace('/edit/',''),pr)}
    else{currentRoute='wiki';editorMode=false;parseLS(path.replace(/^\//,''),pr)}
  }
  function parseLS(rest,pr){
    const i=rest.indexOf('/');
    if(i>0){const f=rest.substring(0,i);if(LANGUAGES.includes(f)){lang=f;currentSlug=rest.substring(i+1)||HOME_PAGE}else{currentSlug=rest||HOME_PAGE}}
    else{currentSlug=rest||HOME_PAGE}
    const ql=pr.get('lang');if(ql==='en'||ql==='fa')lang=ql
  }

  $effect(()=>{readRoute();window.addEventListener('hashchange',readRoute);return()=>window.removeEventListener('hashchange',readRoute)});
  function navigate(slug){window.location.hash=`#/${lang}/${slug}`}
  function goTo(page){window.location.hash=`#/${lang}/${page}`}
  function toggleEditor(){if(editorMode)window.location.hash=`#/${lang}/${currentSlug}`;else window.location.hash=`#/edit/${lang}/${currentSlug}`}
  function handleSearch(q){searchQuery=q}
  function toggleSidebar(){sidebarOpen=!sidebarOpen;saveSidebar(sidebarOpen)}
  function closeSidebar(){sidebarOpen=false;saveSidebar(false)}
  function openSidebar(){sidebarOpen=true;saveSidebar(true)}
</script>

<div class="al">
  <Header {lang} {user} {role} {currentRoute} {currentSlug} onToggleSidebar={toggleSidebar} onSearch={handleSearch} onNavigate={goTo}/>
  <div class="ab">
    {#if currentRoute==='wiki'||currentRoute==='login'||currentRoute==='settings'}<Sidebar {lang} isOpen={sidebarOpen} {currentSlug} onNavigate={navigate} onClose={closeSidebar} onOpen={openSidebar}/>{/if}
    <main class="mc">
      {#if currentRoute==='wiki'&&user}
        <button class="fab" onclick={toggleEditor} title={editorMode?'View':'Edit'}>
          {#if editorMode}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {:else}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>{/if}
        </button>
      {/if}
      {#if currentRoute==='login'}<LoginPage {lang}/>
      {:else if currentRoute==='settings'}{#if user}<SettingsPage {lang} {user} {role}/>{:else}<div class="pe"><h2>{t(lang,'pageNotFound')}</h2><p><a href="#/login">{t(lang,'login')}</a></p></div>{/if}
      {:else if editorMode&&user}<LocalEditor slug={currentSlug} {lang}/>
      {:else if editorMode}<div class="pe"><h2>{t(lang,'pageNotFound')}</h2><p><a href="#/login">{t(lang,'login')}</a></p></div>
      {:else}<WikiPage slug={currentSlug} {lang}/>{/if}
    </main>
  </div>
  <Footer {lang}/>
</div>

<style>
  .al{display:flex;flex-direction:column;min-height:100vh;background:var(--color-bg-secondary);transition:background var(--transition-normal)}
  .ab{display:flex;flex:1;max-width:1200px;width:100%;margin:0 auto}
  .mc{flex:1;min-width:0;display:flex;justify-content:center;position:relative}
  .pe{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;gap:1rem}
  .pe h2{color:var(--color-text-secondary);margin:0}
  .fab{position:fixed;bottom:1.5rem;left:1.5rem;z-index:80;width:48px;height:48px;border:none;border-radius:50%;background:var(--color-accent);color:var(--color-accent-text);box-shadow:var(--shadow-md);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--transition-fast)}
  .fab:hover{background:var(--color-accent-dark);box-shadow:var(--shadow-lg);transform:scale(1.05)}
  @media(max-width:768px){.ab{flex-direction:column}}
</style>
