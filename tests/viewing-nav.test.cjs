const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const panels=['kalender','objekte','verbinden'].map(key=>({dataset:{viewingPanel:key},hidden:true})),links=['kalender','checkliste'].map(key=>({dataset:{viewingTab:key},attrs:{},setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]}}));
let change,scrolled='';const connect={open:false,scrollIntoView(){scrolled='connect'}};
const ctx={document:{querySelectorAll:s=>s==='[data-viewing-panel]'?panels:links,getElementById:id=>id==='calendar-connect'?connect:id==='overview-panel'?{scrollIntoView(){scrolled='overview'}}:id==='obj-object:test'?{scrollIntoView(){scrolled='object'}}:null},location:{hash:''},window:{addEventListener(type,fn){change=fn}},requestAnimationFrame:fn=>fn()};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/besichtigung-nav.js'),'utf8'),ctx);
for(const hash of ['', '#verbinden','#objekte','#obj-object%3Atest']){
ctx.location.hash=hash;change();assert(panels.every(p=>!p.hidden));assert.equal(links[0].attrs['aria-current'],'page');
if(hash==='#verbinden'){assert(connect.open);assert.equal(scrolled,'connect')}
if(hash==='#objekte')assert.equal(scrolled,'overview');
if(hash.startsWith('#obj-'))assert.equal(scrolled,'object');
}
for(const file of ['besichtigung.html','besichtigungskalender.html']){
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist',file),'utf8'),nav=html.match(/<nav class="viewing-section-nav"[\s\S]*?<\/nav>/)[0];
assert.equal((nav.match(/data-viewing-tab=/g)||[]).length,2);
assert(nav.includes('>Besichtigungskalender</a>'));assert(nav.includes('>Besichtigungs-Checkliste</a>'));
}
console.log('Two tabs, shared calendar sections and existing deep links passed');
