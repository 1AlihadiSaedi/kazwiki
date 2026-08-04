<script>
import'./styles/global.css';import{onMount}from'svelte';import{initTheme}from'./logic/theme.js';import{t,getDirection}from'./logic/i18n.js';
import{getAuthState,hasPermission}from'./logic/auth.js';import{getMyProfile}from'./logic/db.js';
import{SITE_DEFAULTS}from'./config.js';import{isInstalled,getSiteConfig}from'./logic/config.js';
import Header from'./components/Header.svelte';import Sidebar from'./components/Sidebar.svelte';
import WikiPage from'./components/WikiPage.svelte';import LocalEditor from'./components/LocalEditor.svelte';
import LoginPage from'./components/LoginPage.svelte';import SettingsPage from'./components/SettingsPage.svelte';
import SetupWizard from'./components/SetupWizard.svelte';

let installed=$state(null);
let sc=$state(SITE_DEFAULTS);
let ready=$state(false);
$effect(()=>{
  isInstalled().then(val=>{
    installed=val;
    if(val){
      getSiteConfig().then(c=>{
        if(c?.defaultLanguage)sc=c;
        else if(c?.site)sc=c.site;
        const s=sc?.site||sc;
        if(s?.title)document.title=typeof s.title==='object'?(s.title[lang]||s.title.en||'Emerald Wiki'):s.title;
        if(s?.icon){let l=document.querySelector('link[rel=icon]');if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l)}l.href=s.icon}
        ready=true;
      });
    }else{ready=true;}
  });
});

let hash=$state(typeof window!=='undefined'?window.location.hash:'');
function ph(){
  let h=hash.slice(1)||'/'+(sc.defaultLanguage||'fa')+'/'+(sc.homePage||'home');
  const[p,q]=h.split('?');const pr=new URLSearchParams(q||'');
  const parts=p.replace(/^\//,'').split('/');
  const e=parts[0]==='edit';if(e)parts.shift();
  let lfp=null;
  const allLangs=[...new Set([...(sc.languages||[]),'fa','en'])];
  if(parts.length&&allLangs.includes(parts[0]))lfp=parts.shift();
  let l=lfp||(sc.defaultLanguage||'fa');
  const ql=pr.get('lang');if(ql==='en'||ql==='fa')l=ql;
  const f=parts[0];
  if(f==='login')return{l,r:'login',sl:f,edit:false};
  if(f==='settings')return{l,r:'settings',sl:f,edit:false};
  return{l,r:'wiki',sl:parts.join('/')||(sc.homePage||'home'),edit:e};
}
let lang=$derived(ph().l);
let route=$derived(ph().r);
let slug=$derived(ph().sl);
let edit=$derived(ph().edit);
let sq=$state('');
let user=$state(null);
let role=$state(null);
let mobile=$state(typeof window!=='undefined'&&window.innerWidth<769);

$effect(()=>{try{initTheme()}catch{}});
$effect(()=>{
  document.documentElement.lang=lang;
  document.documentElement.dir=getDirection(lang);
  document.body.classList.toggle('ltr',lang==='en')
});
$effect(()=>{try{restoreAuth()}catch{}});

async function restoreAuth(){
  try{
    const r=await getAuthState();
    if(r?.user){
      try{
        const p=await getMyProfile();
        if(p){user=r.user;role=p.role||'viewer'}
        else{
          const{signOut}=await import('./logic/auth.js');
          await signOut();
        }
      }catch{user=r.user;role='viewer'}
    }
  }catch{}
}

function hc(){hash=window.location.hash}
onMount(()=>{hash=window.location.hash;window.addEventListener('hashchange',hc);return()=>window.removeEventListener('hashchange',hc)});

function nav(s){window.location.hash='#'+lang+'/'+s}
function go(rt){window.location.hash='#'+lang+'/'+rt}
function te(){window.location.hash=edit?'#'+lang+'/'+slug:'#/edit/'+lang+'/'+slug}
function hs(q){sq=q;if(window.innerWidth>=769&&q&&!so){so=true;ss(true)}}

const SK='emerald-wiki-sidebar';
function gsi(){
  if(typeof window==='undefined')return false;
  if(window.innerWidth<769)return false;
  try{return localStorage.getItem(SK)==='open'}catch{return false}
}
let so=$state(gsi());
function ss(v){
  if(typeof window!=='undefined'&&window.innerWidth>=769)
    try{localStorage.setItem(SK,v?'open':'closed')}catch{}
}
function ts(){so=!so;ss(so)}

let _was=$state(typeof window!=='undefined'&&window.innerWidth<769);
$effect(()=>{
  function rs(){
    const m=window.innerWidth<769;
    if(m!==mobile)mobile=m;
    if(m&&!_was){so=false;ss(false)}
    _was=m
  }
  window.addEventListener('resize',rs);
  return()=>window.removeEventListener('resize',rs)
});
</script>

{#if ready}
{#if !installed}
  <SetupWizard/>
{:else}
<div class="al">
  <Header {lang} {user} {role} currentRoute={route} currentSlug={slug} onToggleSidebar={ts} onSearch={hs} onNavigate={nav} onRoute={go}/>
  <div class="ab">
    {#if route==='wiki'||route==='login'||route==='settings'}
      <Sidebar {lang} isOpen={so} currentSlug={slug} isMobile={mobile} sq={sq} onNavigate={nav} onToggle={ts} onSearch={hs}/>
    {/if}
    <main class="mc">
      {#if route==='wiki'&&user&&(hasPermission(role,'edit_any_page')||hasPermission(role,'edit_own_page')||hasPermission(role,'create_page'))}
        <button class="fab" onclick={te} title={edit?'View':'Edit'}>
          {#if edit}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          {/if}
        </button>
      {/if}
      {#if route==='login'}
        <LoginPage {lang}/>
      {:else if route==='settings'}
        {#if user}
          <SettingsPage {lang} {user} {role}/>
        {:else}
          <div class="pe"><h2>{t(lang,'pageNotFound')}</h2><p><a href="#/{lang}/login">{t(lang,'login')}</a></p></div>
        {/if}
      {:else if edit&&user}
        <LocalEditor {slug} {lang} {user} {role}/>
      {:else if edit}
        <div class="pe"><h2>{t(lang,'pageNotFound')}</h2><p><a href="#/{lang}/login">{t(lang,'login')}</a></p></div>
      {:else}
        <WikiPage {slug} {lang}/>
      {/if}
    </main>
  </div>
</div>
{/if}
{/if}

<style>
.al{display:flex;flex-direction:column;height:100vh;overflow:hidden;background:var(--color-bg-secondary);transition:background var(--transition-normal)}
.ab{display:flex;flex:1;width:100%;height:calc(100vh - var(--header-height));overflow:hidden}
.mc{flex:1;min-width:0;display:flex;justify-content:flex-start;position:relative;overflow-y:auto;overflow-x:hidden}
.pe{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;text-align:center;gap:1rem}
.pe h2{color:var(--color-text-secondary);margin:0}
.fab{position:fixed;bottom:1.5rem;left:1.5rem;z-index:80;width:48px;height:48px;border:none;border-radius:50%;background:var(--color-accent);color:var(--color-accent-text);box-shadow:var(--shadow-md);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--transition-fast)}
.fab:hover{background:var(--color-accent-dark);box-shadow:var(--shadow-lg);transform:scale(1.05)}
@media(max-width:768px){.ab{flex-direction:column}}
</style>