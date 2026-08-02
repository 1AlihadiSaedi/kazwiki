import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const contentDir=path.resolve(__dirname,'src/wiki-content');

const credsPath=path.resolve(__dirname,'.data','390eb3053a827f81.json');
let hashedCreds={uh:'',ph:'',dn:'Admin'};
try{hashedCreds=JSON.parse(fs.readFileSync(credsPath,'utf-8'))}catch{}
try{
  const cr=fs.readFileSync(path.resolve(__dirname,'src/config.js'),'utf-8');
  const un=(cr.match(/ADMIN_USERNAME\s*=\s*'([^']*)'/)||[,''])[1];
  const pw=(cr.match(/ADMIN_PASSWORD\s*=\s*'([^']*)'/)||[,''])[1];
  const dn=(cr.match(/ADMIN_DISPLAY_NAME\s*=\s*'([^']*)'/)||[,'Admin'])[1];
  if(un&&pw) hashedCreds={uh:crypto.createHash('sha256').update(un).digest('hex'),ph:crypto.createHash('sha256').update(pw).digest('hex'),dn};
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
      if(req.method==='GET'&&req.url.startsWith('/pages/')&&req.url.endsWith('.md')){
        const parts=req.url.split('/');const lang=parts[2];const fname=parts[3];
        if(!lang||!fname){res.writeHead(404);res.end('Not found');return}
        const srcFile=path.join(contentDir,lang,fname);
        try{res.writeHead(200,{'Content-Type':'text/plain;charset=utf-8'});res.end(fs.readFileSync(srcFile,'utf-8'));return}catch{
          const df=path.resolve(__dirname,'dist','pages',lang,fname);
          try{res.writeHead(200,{'Content-Type':'text/plain;charset=utf-8'});res.end(fs.readFileSync(df,'utf-8'));return}catch{}
        }
        res.writeHead(404);res.end('Not found');return;
      }
      if(req.method==='POST'&&req.url==='/api/save'){
        let body='';req.on('data',c=>body+=c);req.on('end',()=>{
          try{
            const{slug,lang,content}=JSON.parse(body);
            const safe=slug.replace(/[^a-zA-Z0-9_-]/g,'');
            const file=path.join(contentDir,lang,`${safe}.md`);
            fs.mkdirSync(path.dirname(file),{recursive:true});
            fs.writeFileSync(file,content,'utf-8');
            const df=path.resolve(__dirname,'dist','pages',lang,`${safe}.md`);
            try{fs.mkdirSync(path.dirname(df),{recursive:true});fs.copyFileSync(file,df)}catch{}
            const v=fs.readFileSync(file,'utf-8')===content;
            res.writeHead(200,{'Content-Type':'application/json'});
            res.end(JSON.stringify({ok:true,file:`${lang}/${safe}.md`,verified:v}));
          }catch(e){res.writeHead(400);res.end(JSON.stringify({ok:false,error:e.message}))}
        });return;
      }
      if(req.method==='DELETE'&&req.url==='/api/page'){
        let body='';req.on('data',c=>body+=c);req.on('end',()=>{
          try{
            const{slug,lang}=JSON.parse(body);
            const safe=slug.replace(/[^a-zA-Z0-9_-]/g,'');
            const file=path.join(contentDir,lang,`${safe}.md`);
            if(fs.existsSync(file))fs.unlinkSync(file);
            res.writeHead(200);res.end(JSON.stringify({ok:true}));
          }catch(e){res.writeHead(400);res.end(JSON.stringify({ok:false,error:e.message}))}
        });return;
      }
      next();
    });
  }
  return{name:'wiki',resolveId(id){if(id===V)return R;if(id===AV)return AR},load(id){if(id===R)return`const data=${JSON.stringify(loadAll(this))};export default data;`;if(id===AR)return`export default ${JSON.stringify(hashedCreds)};`},configureServer:addMiddleware,configurePreviewServer:addMiddleware};
}

function emitPlugin(){
  let cfg={};
  const defs={defaultLanguage:'fa',languages:['fa','en'],homePage:'home',title:{fa:'Emerald Wiki',en:'Emerald Wiki'}};
  return{
    name:'emit',
    async buildStart(){
      try{cfg=await import(path.resolve(__dirname,'src/config.js'));const sd=cfg.SITE_DEFAULTS||defs;for(const l of(sd.languages||['fa','en']))fs.mkdirSync(path.join(contentDir,l),{recursive:true})}catch{}
    },
    transformIndexHtml(html){
      const sd=cfg.SITE_DEFAULTS||defs;
      return html.replace('</head>',`<script>(function(){window.__EMERALD_CONFIG__=${JSON.stringify({admin:{usernameHash:hashedCreds.uh||'',passwordHash:hashedCreds.ph||'',displayName:hashedCreds.dn||'Admin'},defaultLanguage:sd.defaultLanguage||'fa',languages:sd.languages||['fa','en'],homePage:sd.homePage||'home',title:sd.title||{fa:'Emerald Wiki',en:'Emerald Wiki'}})};})();</script></head>`);
    },
    async closeBundle(){
      const dist=path.resolve(__dirname,'dist');let fc=0;
      try{const langs=fs.readdirSync(contentDir,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name);for(const lang of langs){const sd=path.join(contentDir,lang);const dd=path.join(dist,'pages',lang);fs.mkdirSync(dd,{recursive:true});const fs2=fs.readdirSync(sd).filter(f=>f.endsWith('.md'));for(const f of fs2){fs.copyFileSync(path.join(sd,f),path.join(dd,f));fc++}}}catch{}
      console.log('dist/pages: '+fc+' md files');
    }
  };
}

function fpPlugin(){return{name:'fp',transformIndexHtml:{order:'post',handler(h){return h.replace(/type="module"/g,'defer').replace(/\scrossorigin(?:="[^"]*")?/g,'')}}}}

export default defineConfig({plugins:[svelte(),wikiPlugin(),emitPlugin(),fpPlugin()],base:'./',build:{outDir:'dist',assetsDir:'assets',cssCodeSplit:false,minify:'esbuild',rollupOptions:{output:{format:'iife',inlineDynamicImports:true,manualChunks:undefined}}}});
