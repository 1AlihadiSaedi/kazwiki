<script>
  import { t } from '../logic/i18n.js';
  import { getPageContent, parseMarkdown } from '../logic/wiki.js';
  let { slug='home', lang='fa' } = $props();
  let rawMarkdown=$derived(getPageContent(slug,lang)||'');
  let editorContent=$state('');
  let previewHtml=$derived(parseMarkdown(editorContent));
  let mode=$state('write');
  let saving=$state(false);
  let saveMsg=$state('');
  let saveOk=$state(false);
  $effect(()=>{editorContent=rawMarkdown;saveMsg=''});

  async function saveToFile(){
    saving=true;saveMsg='';
    const fn=`${slug}.${lang}.md`;
    try{
      const r=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,lang,content:editorContent})});
      if(r.ok){const d=await r.json();if(d.ok){saveOk=true;saveMsg=t(lang,'saved')+' → '+d.file;saving=false;setTimeout(()=>saveMsg='',4000);return}}
    }catch{}
    try{
      if(window.showSaveFilePicker){
        const h=await window.showSaveFilePicker({suggestedName:fn,types:[{description:'Markdown',accept:{'text/markdown':['.md']}}]});
        const w=await h.createWritable();await w.write(editorContent);await w.close();
        saveOk=true;saveMsg=t(lang,'saved')+' → '+fn;saving=false;setTimeout(()=>saveMsg='',4000);return
      }
    }catch(e){if(e?.name==='AbortError'){saving=false;return}}
    const b=new Blob([editorContent],{type:'text/markdown'});
    const u=URL.createObjectURL(b);
    const a=document.createElement('a');a.href=u;a.download=fn;a.click();
    URL.revokeObjectURL(u);
    saveOk=true;saveMsg=t(lang,'downloaded')+' → '+fn;
    saving=false;setTimeout(()=>saveMsg='',4000)
  }
</script>
<div class="ec">
  <div class="eh"><h2 class="et">{slug}.{lang}.md</h2>
    <div class="ea"><div class="mt"><button class="m" class:m--a={mode==='write'} onclick={()=>mode='write'}>{t(lang,'write')}</button><button class="m" class:m--a={mode==='preview'} onclick={()=>mode='preview'}>{t(lang,'preview')}</button></div>
      <button class="bs" onclick={saveToFile} disabled={saving}>
        {#if saving}<span class="sp"></span>{t(lang,'saving')}
        {:else}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" w="16" h="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>{t(lang,'save')}{/if}
      </button>
    </div>
  </div>
  {#if saveMsg}<div class="sm" class:sm--ok={saveOk} class:sm--er={!saveOk}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" w="16" h="16">{#if saveOk}<polyline points="20 6 9 17 4 12"/>{:else}<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>{/if}</svg><span>{saveMsg}</span></div>{/if}
  <div class="eb">{#if mode==='write'}<textarea class="ta" value={editorContent} oninput={e=>editorContent=e.target.value} spellcheck="false"></textarea>{:else}<div class="ep">{@html previewHtml}</div>{/if}</div>
</div>
<style>
  .ec{max-width:1000px;width:100%;padding:1.5rem;animation:pi 300ms ease}@keyframes pi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .eh{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.75rem;margin-bottom:1rem}
  .et{font-size:var(--font-size-xl);margin:0;color:var(--color-accent)}
  .ea{display:flex;align-items:center;gap:0.75rem}
  .mt{display:flex;border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden}
  .m{padding:0.4rem 1rem;border:none;background:var(--color-bg-secondary);color:var(--color-text-secondary);font-family:var(--font-body);font-size:var(--font-size-sm);cursor:pointer;transition:all var(--transition-fast)}
  .m:first-child{border-left:1px solid var(--color-border)}
  .m--a{background:var(--color-accent);color:var(--color-accent-text)}
  .m:hover:not(.m--a){background:var(--color-bg-hover)}
  .bs{display:flex;align-items:center;gap:0.5rem;padding:0.4rem 1rem;border:1px solid var(--color-accent);border-radius:var(--radius-md);background:var(--color-accent);color:var(--color-accent-text);font-family:var(--font-body);font-size:var(--font-size-sm);font-weight:600;cursor:pointer;transition:all var(--transition-fast)}
  .bs:hover:not(:disabled){background:var(--color-accent-dark)}
  .bs:disabled{opacity:0.65;cursor:not-allowed}
  .sm{display:flex;align-items:center;gap:0.5rem;padding:0.6rem 1rem;margin-bottom:1rem;border-radius:var(--radius-md);font-size:var(--font-size-sm)}
  .sm--ok{background:#d1fae5;border:1px solid #6ee7b7;color:#065f46}
  .sm--er{background:#fef2f2;border:1px solid #fecaca;color:#dc2626}
  :global([data-theme="dark"]) .sm--ok{background:#064e3b;border-color:#059669;color:#34d399}
  :global([data-theme="dark"]) .sm--er{background:#450a0a;border-color:#7f1d1d;color:#fca5a5}
  .eb{border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;min-height:60vh}
  .ta{width:100%;min-height:60vh;padding:1.25rem;border:none;background:var(--color-bg-primary);color:var(--color-text-primary);font-family:var(--font-mono);font-size:var(--font-size-sm);line-height:1.8;resize:vertical;outline:none;direction:ltr;text-align:left}
  .ep{padding:1.5rem 2rem;background:var(--color-bg-primary);line-height:1.85;min-height:60vh}
  .sp{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spi 0.6s linear infinite}
  @keyframes spi{to{transform:rotate(360deg)}}
  @media(max-width:640px){.ec{padding:1rem}.eh{flex-direction:column;align-items:flex-start}.ep{padding:1rem}}
</style>