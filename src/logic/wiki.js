import pageModules from 'virtual:wiki-content';
const pages=(typeof window!=='undefined'&&window.__EMERALD_PAGES__)?window.__EMERALD_PAGES__:pageModules;
export const liveCache={};

export async function fetchLiveContent(slug,lang){
  const key=`${lang}/${slug}`;
  try{const r=await fetch(`/pages/${lang}/${slug}.md`);if(r.ok){const t=await r.text();liveCache[key]=t;return t}}catch{}
  return null;
}

export function getPageIndex(){
  const idx=[];
  for(const[fp,content]of Object.entries(pages)){
    if(!content)continue;
    const parts=fp.split('/');const fname=parts.pop();const lang=parts.pop();
    const slug=fname.replace(/\.md$/,'');
    const m=content.match(/^#\s+(.+)$/m);const title=m?m[1].trim():slug;
    idx.push({slug,lang,title,path:fp});
  }
  return idx;
}

export function getPageContent(slug,lang){
  const key=`${lang}/${slug}`;
  if(liveCache[key])return liveCache[key];
  const tp=`/src/wiki-content/${lang}/${slug}.md`;
  if(pages[tp])return pages[tp];
  const fp2=`/src/wiki-content/fa/${slug}.md`;
  if(pages[fp2])return pages[fp2];
  return null;
}

export function parseMarkdown(md){if(!md)return'';let h=md;
h=h.replace(/```(\w*)\n([\s\S]*?)```/g,(_m,lang,code)=>{const e=escapeHtml(code.trim());const a=lang?` data-lang="${lang}"`:'';return`<pre${a}><code>${e}</code></pre>`});
h=h.replace(/^######\s+(.+)$/gm,'<h6>$1</h6>');h=h.replace(/^#####\s+(.+)$/gm,'<h5>$1</h5>');h=h.replace(/^####\s+(.+)$/gm,'<h4>$1</h4>');h=h.replace(/^###\s+(.+)$/gm,'<h3>$1</h3>');h=h.replace(/^##\s+(.+)$/gm,'<h2>$1</h2>');h=h.replace(/^#\s+(.+)$/gm,'<h1>$1</h1>');
h=h.replace(/^(---|\*\*\*|___)\s*$/gm,'<hr>');h=h.replace(/^&gt;\s?(.+)$/gm,'<blockquote>$1</blockquote>');
h=h.replace(/^[\-\*]\s+(.+)$/gm,'<li>$1</li>');h=h.replace(/((?:<li>.*<\/li>\n?)+)/g,'<ul>$1</ul>');
h=h.replace(/^\d+\.\s+(.+)$/gm,'<oli>$1</oli>');h=h.replace(/((?:<oli>.*<\/oli>\n?)+)/g,'<ol>$1</ol>');h=h.replace(/<\/?oli>/g,(t)=>t.replace('oli','li'));
h=h.replace(/^\|(.+)\|$/gm,(_m,cells)=>{const ca=cells.split('|').map(c=>c.trim());return'<tr>'+ca.map(c=>`<td>${c}</td>`).join('')+'</tr>'});
h=h.replace(/((?:<tr>.*<\/tr>\n?)+)/g,'<table>$1</table>');
h=h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1">');
h=h.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
h=h.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>');h=h.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');h=h.replace(/\*(.+?)\*/g,'<em>$1</em>');
h=h.replace(/~~(.+?)~~/g,'<del>$1</del>');h=h.replace(/`([^`]+)`/g,'<code>$1</code>');
h=h.replace(/  \n/g,'<br>');h=h.replace(/\n\n+/g,'</p><p>');h='<p>'+h+'</p>';
h=h.replace(/<p>\s*<\/p>/g,'');h=h.replace(/<p>(<\/(?:h[1-6]|ul|ol|pre|table|hr|blockquote)>)/g,'$1');h=h.replace(/(<(?:h[1-6]|ul|ol|pre|table|hr|blockquote)[^>]*>)<\/p>/g,'$1');
h=h.replace(/\n/g,'');return h}

function escapeHtml(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

export function getAllSlugs(){const idx=getPageIndex();const s={};for(const p of idx){if(!s[p.slug])s[p.slug]={slug:p.slug,titles:{}};s[p.slug].titles[p.lang]=p.title}return Object.values(s)}
