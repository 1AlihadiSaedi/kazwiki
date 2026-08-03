import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const contentDir=path.resolve(__dirname,'src/wiki-content');

// ── Admin creds (embedded at build) ──
let hashedCreds={uh:'',ph:'',dn:'Admin'};
try{
  const cf=path.resolve(__dirname,'dist','.data','390eb3053a827f81.json');
  if(fs.existsSync(cf)){const d=JSON.parse(fs.readFileSync(cf,'utf-8'));hashedCreds={uh:d.uh||'',ph:d.ph||'',dn:d.dn||'Admin'};}
}catch{}

function wikiPlugin(){
  const V='virtual:wiki-content',R='\0'+V,AV='virtual:admin-creds',AR='\0'+AV;
  function loadAll(ctx){
    const pages={};
    try{
      const langs=fs.readdirSync(contentDir,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name);
      for(const lang of langs){
        const langDir=path.join(contentDir,lang);
        const files=fs.readdirSync(langDir).filter(f=>f.endsWith('.md'));
        for(const f of files){
          const fp=path.join(langDir,f);ctx?.addWatchFile?.(fp);
          const slug=f.replace(/\.md$/,'');
          pages[`/src/wiki-content/${lang}/${slug}.md`]=fs.readFileSync(fp,'utf-8');
        }
      }
    }catch{}
    return pages;
  }
  function addMiddleware(server){
    server.middlewares.use((req,res,next)=>{
      if (res.headersSent) { next(); return; }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      if(req.method==='GET'&&req.url.startsWith('/pages/')&&req.url.endsWith('.md')){
        const parts=req.url.split('/');const lang=parts[2];const fname=parts[3];
        if(!lang||!fname){res.writeHead(404);res.end('Not found');return}
        const srcFile=path.join(contentDir,lang,fname);
        try{res.writeHead(200,{'Content-Type':'text/plain;charset=utf-8'});res.end(fs.readFileSync(srcFile,'utf-8'));return}catch{
          const root=process.cwd();
          const df=path.join(root,'dist','pages',lang,fname);
          try{res.writeHead(200,{'Content-Type':'text/plain;charset=utf-8'});res.end(fs.readFileSync(df,'utf-8'));return}catch{}
        }
        res.writeHead(404);res.end('Not found');return;
      }
      if(req.method==='POST'&&req.url==='/api/save'){
        let body='';req.on('data',c=>body+=c);req.on('end',()=>{
          try{
            const{slug,lang,content,creator}=JSON.parse(body);
            const safe=slug.replace(/[^a-zA-Z0-9_-]/g,'');
            const file=path.join(contentDir,lang,`${safe}.md`);
            fs.mkdirSync(path.dirname(file),{recursive:true});
            fs.writeFileSync(file,content,'utf-8');
            const df=path.resolve(__dirname,'dist','pages',lang,`${safe}.md`);
            try{fs.mkdirSync(path.dirname(df),{recursive:true});fs.copyFileSync(file,df)}catch{}
            const v=fs.readFileSync(file,'utf-8')===content;
            console.log(`Saved: ${lang}/${safe}.md`);
            const metaFile = path.join(process.cwd(), 'dist', '.data', 'page-meta.json');
            let meta = {}; try{ meta=JSON.parse(fs.readFileSync(metaFile,'utf-8')); }catch{}
            const metaKey = `${lang}:${safe}`;
            if (!meta[metaKey]) {
              meta[metaKey] = { creator: creator || 'unknown', createdAt: new Date().toISOString() };
              fs.mkdirSync(path.dirname(metaFile), {recursive: true});
              fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));
            }
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify({ok:true,file:`${lang}/${safe}.md`,verified:v}));
          }catch(e){console.error('Save:',e.message);res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}))}
        });return;
      }
      if(req.method==='DELETE'&&req.url==='/api/page'){
        let body='';req.on('data',c=>body+=c);req.on('end',()=>{
          try{
            const{slug,lang}=JSON.parse(body);
            const safe=slug.replace(/[^a-zA-Z0-9_-]/g,'');
            const file=path.join(contentDir,lang,`${safe}.md`);
            if(fs.existsSync(file))fs.unlinkSync(file);
            const df=path.resolve(__dirname,'dist','pages',lang,`${safe}.md`);
            if(fs.existsSync(df))fs.unlinkSync(df);
            console.log(`Deleted: ${lang}/${safe}.md`);
            res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
          }catch(e){console.error('Delete:',e.message);res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}))}
        });return;
      }
      if(req.method==='POST'&&req.url==='/api/install'){
        let body='';req.on('data',c=>body+=c);req.on('end',()=>{
          try{
            const d=JSON.parse(body);
            const{uh,ph,dn}=d;
            const root=process.cwd();
            const dd=path.resolve(root,'dist','.data');
            fs.mkdirSync(dd,{recursive:true});
            fs.writeFileSync(path.join(dd,'390eb3053a827f81.json'),JSON.stringify({uh,ph,dn:dn||'Admin'}));
            fs.writeFileSync(path.join(dd,'site-config.json'),JSON.stringify({
              defaultLanguage:d.defaultLanguage||'en',languages:d.languages||['fa','en'],
              homePage:d.homePage||'home',title:d.title||{en:'Emerald Wiki',fa:'ویکی زمردین'},
              icon:d.icon||'',theme:d.theme||'dark'
            }));
            hashedCreds={uh,ph,dn:dn||'Admin'};
            console.log('Installed to dist/.data/');
            res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true}));
          }catch(e){console.error('Install:',e.message);res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}))}
        });return;
      }
      if(req.method==='GET'&&req.url==='/api/config'){
        const root=process.cwd();
        const sf=path.resolve(root,'dist','.data','site-config.json');
        try{const fc=fs.readFileSync(sf,'utf-8');res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(fc)}catch{res.writeHead(404);res.end(JSON.stringify({ok:false}))}
        return;
      }
      if(req.method==='POST'&&req.url==='/api/config'){
        let body='';req.on('data',c=>body+=c);req.on('end',()=>{
          try{
            const d=JSON.parse(body);const root=process.cwd();
            const sf=path.resolve(root,'dist','.data','site-config.json');
            let existing={};try{existing=JSON.parse(fs.readFileSync(sf,'utf-8'))}catch{}
            const merged={...existing,...d};
            fs.mkdirSync(path.dirname(sf),{recursive:true});
            fs.writeFileSync(sf,JSON.stringify(merged));
            console.log('Config updated');
            res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,config:merged}));
          }catch(e){console.error('Config:',e.message);res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}))}
        });return;
      }
      if(req.method==='GET'&&req.url==='/api/auth/creds'){
        const root=process.cwd();
        const cf=path.resolve(root,'dist','.data','390eb3053a827f81.json');
        try{const d=JSON.parse(fs.readFileSync(cf,'utf-8'));res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({uh:d.uh||'',ph:d.ph||'',dn:d.dn||'Admin'}))}catch{res.writeHead(404);res.end(JSON.stringify({uh:'',ph:'',dn:'Admin'}))}
        return;
      }
      if(req.method==='GET'&&req.url==='/api/is-installed'){
        const root=process.cwd();
        const cf=path.resolve(root,'dist','.data','390eb3053a827f81.json');
        try{const d=JSON.parse(fs.readFileSync(cf,'utf-8'));res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({installed:!!(d.uh&&d.ph)}))}catch{res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({installed:false}))}
        return;
      }
      const usersFile = path.join(process.cwd(), 'dist', '.data', 'users.json');
      if(req.url && req.url.startsWith('/api/users')){
        const u = new URL(req.url, 'http://localhost');
        const qUsername = u.searchParams.get('username');
        const qUh = u.searchParams.get('usernameHash');
        if(req.method === 'GET'){
          let users = []; try{ users=JSON.parse(fs.readFileSync(usersFile,'utf-8')); }catch{}
          if(qUh){
            const user = users.find(x => x.usernameHash === qUh);
            if(user){ res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify(user)); }
            else{ res.writeHead(404); res.end('null'); }
            return;
          }
          res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
          res.end(JSON.stringify(users));
          return;
        }
        if(req.method === 'POST'){
          let body=''; req.on('data',c=>body+=c); req.on('end',()=>{
            try{
              const d=JSON.parse(body);
              if(!d||!d.username){ res.writeHead(400,{'Content-Type':'application/json'}); res.end(JSON.stringify({ok:false})); return; }
              let users=[]; try{ users=JSON.parse(fs.readFileSync(usersFile,'utf-8')); }catch{}
              const idx=users.findIndex(x=>x.username===d.username);
              const entry={
                username:d.username,usernameHash:d.usernameHash||'',
                displayName:d.displayName||d.username,passwordHash:d.passwordHash||'',
                role:d.role||'author',updatedAt:new Date().toISOString()
              };
              if(idx>=0){ users[idx]={...users[idx],...entry,createdAt:users[idx].createdAt||entry.updatedAt}; }
              else{ entry.createdAt=entry.updatedAt; users.push(entry); }
              fs.mkdirSync(path.dirname(usersFile),{recursive:true});
              fs.writeFileSync(usersFile,JSON.stringify(users));
              res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({ok:true}));
            }catch(e){ res.writeHead(400,{'Content-Type':'application/json'}); res.end(JSON.stringify({ok:false})); }
          }); return;
        }
        if(req.method === 'DELETE'){
          if(!qUsername){ res.writeHead(400,{'Content-Type':'application/json'}); res.end(JSON.stringify({ok:false})); return; }
          let users=[]; try{ users=JSON.parse(fs.readFileSync(usersFile,'utf-8')); }catch{}
          users=users.filter(x=>x.username!==qUsername);
          fs.writeFileSync(usersFile,JSON.stringify(users));
          res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({ok:true}));
          return;
        }
      }
      const pageMetaFile = path.join(process.cwd(), 'dist', '.data', 'page-meta.json');
      if(req.method === 'GET' && req.url && req.url.startsWith('/api/page-meta')){
        const pu = new URL(req.url, 'http://localhost');
        let meta = {}; try{ meta=JSON.parse(fs.readFileSync(pageMetaFile,'utf-8')); }catch{}
        const pSlug = pu.searchParams.get('slug');
        const pLang = pu.searchParams.get('lang');
        if(pSlug && pLang){
          const key = `${pLang}:${pSlug}`;
          res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
          res.end(JSON.stringify(meta[key] || {}));
          return;
        }
        res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
        res.end(JSON.stringify(meta));
        return;
      }
      if(req.url.startsWith('/.data/')){
        const fp=path.join(process.cwd(),'dist',req.url.slice(1));
        try{const fc=fs.readFileSync(fp,'utf-8');res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(fc)}catch{res.writeHead(404,{'Cache-Control':'no-store'});res.end('Not found')}
        return;
      }
      next();
    });
  }
  return{name:'wiki',resolveId(id){if(id===V)return R;if(id===AV)return AR},load(id){if(id===R)return`const data=${JSON.stringify(loadAll(this))};export default data;`;if(id===AR)return`export default ${JSON.stringify(hashedCreds)};`},configureServer:addMiddleware,configurePreviewServer:addMiddleware};
}

function emitPlugin(){
  let cfg={};
  const defaults={defaultLanguage:'fa',languages:['fa','en'],homePage:'home',title:{fa:'ویکی زمردین',en:'Emerald Wiki'}};
  return{
    name:'emit',
    async buildStart(){
      try{
        cfg=await import(path.resolve(__dirname,'src/config.js'));
        const sd=cfg.SITE_DEFAULTS||defaults;
        for(const l of(sd.languages||['fa','en']))fs.mkdirSync(path.join(contentDir,l),{recursive:true});
      }catch{console.error('buildStart error')}
    },
    transformIndexHtml(html){
      const sd=cfg.SITE_DEFAULTS||defaults;
      let sc=null;
      try{const sf=path.resolve(__dirname,'dist','.data','site-config.json');if(fs.existsSync(sf))sc=JSON.parse(fs.readFileSync(sf,'utf-8'))}catch{}
      const out={
        admin:{usernameHash:hashedCreds.uh||'',passwordHash:hashedCreds.ph||'',displayName:hashedCreds.dn||'Admin'},
        defaultLanguage:sc?.defaultLanguage||sd.defaultLanguage||'en',
        languages:sc?.languages||sd.languages||['fa','en'],
        homePage:sc?.homePage||sd.homePage||'home',
        title:sc?.title||sd.title||{fa:'ویکی زمردین',en:'Emerald Wiki'},
        icon:sc?.icon||sd.icon||'',
        theme:sc?.theme||sd.theme||'dark'
      };
      const script=`(function(){window.__EMERALD_CONFIG__=${JSON.stringify(out)};})();`;
      return html.replace('</head>',`<script>${script}</script></head>`);
    },
    async closeBundle(){
      const dist=path.resolve(__dirname,'dist');let fc=0;
      try{
        const langs=fs.readdirSync(contentDir,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name);
        for(const lang of langs){
          const sd=path.join(contentDir,lang);const dd=path.join(dist,'pages',lang);
          fs.mkdirSync(dd,{recursive:true});
          const fs2=fs.readdirSync(sd).filter(f=>f.endsWith('.md'));
          for(const f of fs2){fs.copyFileSync(path.join(sd,f),path.join(dd,f));fc++}
        }
      }catch{}
      console.log(`pages/ (${fc} .md files)`);
    }
  };
}

function fpPlugin(){return{name:'fp',transformIndexHtml:{order:'post',handler(h){return h.replace(/type="module"/g,'defer').replace(/\scrossorigin(?:="[^"]*")?/g,'')}}}}

export default defineConfig({plugins:[svelte(),wikiPlugin(),emitPlugin(),fpPlugin()],base:'./',build:{outDir:'dist',assetsDir:'assets',cssCodeSplit:false,minify:'esbuild',rollupOptions:{output:{format:'iife',inlineDynamicImports:true,manualChunks:undefined}}}});
