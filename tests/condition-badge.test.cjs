const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../dist/suche.html'),'utf8');
const start=html.indexOf('function renovationBadge('),end=html.indexOf('function cardMarkup(',start);assert.ok(start>=0&&end>start);const context={};vm.createContext(context);vm.runInContext(html.slice(start,end),context);
assert.match(context.renovationBadge({renovation_needed:true}),/Renovierungsbedürftig/);
for(const value of [false,null,undefined,'false','true'])assert.equal(context.renovationBadge({renovation_needed:value}),'');
assert.match(context.renovationBadge({portalListings:[{renovation_needed:true}]}),/Renovierungsbedürftig/);
assert.equal(context.renovationBadge({portalListings:[{renovation_needed:false}]}),'');
for(const file of ['worker.js','listing-import.mjs']){const code=fs.readFileSync(path.join(__dirname,'../src/',file),'utf8');assert.match(code,/energy_efficency_class renovation_needed uptime_date/)}
console.log('Renovation badge: true, false, missing and grouped listings passed');
