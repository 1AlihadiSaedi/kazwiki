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
  let lang=$state(DEFAULT_LANGUAGE);let cr=$state('wiki');let cs=$state(HOME_PAGE);
  let em=$state(false);let sq=$state('');let user=$state(null);let role=$state(null);
  const DK=769;const SK='emerald-wiki-sidebar';
  function gsi(){if(typeof window==='undefined')return false;if(window.innerWidth<DK)return false;try{return localStorage.getItem(SK)==='open'}catch{return false}}
  let so=$state(gsi());
  function ss(v){if(typeof window==='undefined')return;if(window.innerWidth>=DK){try{localStorage.setItem(SK,v?'open':'closed')}catch{}}}
  $effect(()=>{try{initTheme()}catch{}});
  $effect(()=>{document.documentElement.lang=lang;document.documentElement.dir=getDirection(lang);if(lang==='en')document.body.classList.add('ltr');else document.body.classList.remove('ltr')});
  $effect(()=>{try{restoreAuth()}catch(e){console.warn('Auth:',e)}});
  async function restoreAuth(){try{const r=await getAuthState();if(r&&r.user){user=r.user;try{const p=await getMyProfile();role=p?.role||'viewer'}catch{role='viewer'}}}catch(e){console.warn('Auth unavailable:',e.message)}}

  function rr(){
    let h=window.location.hash.slice(1);
    if(!h){window.location.hash=`#/${DEFAULT_LANGUAGE}/${HOME_PAGE}`;return}
    const[p,q]=h.split('?');const pr=new URLSearchParams(q||'');
    if(p==='/login'){cr='login';em=false;return}
    if(p==='/settings'){cr='settings';em=false;return}
    if(p.startsWith('/edit/')){cr='wiki';em=true;pl(p.replace('/edit/',''),pr)}
    else{cr='wiki';em=false;pl(p.replace(/^\//,''),pr)}
  }
  function pl(r,pr){const i=r.indexOf('/');if(i>0){const f=r.substring(0,i);if(LANGUAGES.includes(f)){lang=f;cs=r.substring(i+1)||HOME_PAGE}else{cs=r||HOME_PAGE}}else{cs=r||HOME_PAGE}const ql=pr.get('lang');if(ql==='en'||ql==='fa')lang=ql}

  $effect(()=>{rr();window.addEventListener('hashchange',rr);return()=>window.removeEventListener('hashchange',rr)});
  function nav(s){window.location.hash=`#/${lang}/${s}`}
  function gt(p){window.location.hash=`#/${lang}/${p}`}
  function te(){if(em)window.location.hash=`#/${lang}/${cs}`;else window.location.hash=`#/edit/${lang}/${cs}`}
  function hs(q){sq=q}
  function ts(){so=!so;ss(so)}
  function cls(){so=false;ss(false)}
  function opn(){so=true;ss(true)}
</script>

<div class="al">
  <Header {lang} {user} {role} currentRoute={cr} currentSlug={cs} onToggleSidebar={ts} onSearch={hs} onNavigate={gt}/>
  <div class="ab">
    {#if cr==='wiki'||cr==='login'||cr==='settings'}<Sidebar {lang} isOpen={so} currentSlug={cs} onNavigate={nav} onClose={cls} onOpen={opn}/>{/if}
    <main class="mc">
      {#if cr==='wiki'&&user}<button class="fab" onclick={te} title={em?'View':'Edit'}>{#if em}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>{:else}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>{/if}</button>{/if}
      {#if cr==='login'}<LoginPage {lang}/>
      {:else if cr==='settings'}{#if user}<SettingsPage {lang} {user} {role}/>{:else}<div class="pe"><h2>{t(lang,'pageNotFound')}</h2><p><a href="#/login">{t(lang,'login')}</a></p></div>{/if}
      {:else if em&&user}<LocalEditor slug={cs} {lang}/>
      {:else if em}<div class="pe"><h2>{t(lang,'pageNotFound')}</h2><p><a href="#/login">{t(lang,'login')}</a></p></div>
      {:else}<WikiPage slug={cs} {lang}/>{/if}
    </main>
  </div>
  <Footer {lang}/>
</div>

<style>
  .al{display:flex;flex-direction:column;min-height:100vh;background:var(--color-bg-secondary);transition:background var(--transition-normal)}
  .ab{display:flex;flex:1;max-width:1200px;width:100%;margin:0 auto}
  .mc{flex:1;min-width:0;display:flex;justify-content:center;position:relative}
  .pe{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;gap:1rem}.pe h2{color:var(--color-text-secondary);margin:0}
  .fab{position:fixed;bottom:1.5rem;left:1.5rem;z-index:80;width:48px;height:48px;border:none;border-radius:50%;background:var(--color-accent);color:var(--color-accent-text);box-shadow:var(--shadow-md);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--transition-fast)}
  .fab:hover{background:var(--color-accent-dark);box-shadow:var(--shadow-lg);transform:scale(1.05)}
  @media(max-width:768px){.ab{flex-direction:column}}
</style>
