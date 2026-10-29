export const destinations={search:'/suche.html#suche',objects:'/suche.html#meine-objekte',profiles:'/suche.html#meine-suche',market:'/suche.html#marktwert',calculator:'/fix-flip.html',calendar:'/besichtigungskalender.html',checklist:'/besichtigung.html',connect:'/besichtigungskalender.html#verbinden'};
export const statusLabels={interessant:'Objekt interessant',angefragt:'Objekt angefragt',besichtigt:'Besichtigt',angebot:'Angebot gestellt'};
export function validDate(value){if(typeof value!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value}
export function validatePlan(p){
 if(!p||!['navigate','search','status','visit','read','help'].includes(p.action))throw Error('Diese Aktion wird noch nicht unterstützt.');
 const text=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
 const plan={action:p.action,message:text(p.message,600),target:text(p.target,30),objectQuery:text(p.objectQuery,200),status:text(p.status,30),date:p.date||'',time:p.time||'',filters:{}};
 if(plan.action==='navigate'&&!Object.hasOwn(destinations,plan.target))throw Error('Unbekannter Bereich.');
 if(plan.action==='read'&&!['next_visit','visits','next_contact','contacts','overview','object_details'].includes(plan.target))throw Error('Unbekannte Datenabfrage.');
 if(plan.action==='status'&&!Object.hasOwn(statusLabels,plan.status))throw Error('Unbekannter Objektstatus.');
 if(plan.date&&!validDate(plan.date))throw Error('Bitte ein gültiges Datum angeben.');
 if(plan.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(plan.time))throw Error('Bitte eine gültige Uhrzeit angeben.');
 if(plan.action==='visit'&&(!plan.date||!plan.time))throw Error('Für einen Termin brauche ich Datum und Uhrzeit.');
 if(plan.action==='visit'){const stamp=Date.parse(plan.date+'T'+plan.time+':00Z'),format=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});if(![60,120].some(offset=>format.format(new Date(stamp-offset*60000))===plan.date+' '+plan.time))throw Error('Diese Uhrzeit existiert wegen der Zeitumstellung nicht. Bitte eine andere Uhrzeit wählen.');}
 const f=p.filters||{};plan.filters.place=text(f.place,100);
 for(const key of ['price','area','rooms','sqm']){const v=f[key];if(v==null||v==='')continue;if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1e8)throw Error('Ungültiger Suchfilter.');plan.filters[key]=v}
 for(const [key,allowed]of [['type',['Wohnung','Haus']],['deal',['Kaufen','Mieten']]]){if(f[key]&& !allowed.includes(f[key]))throw Error('Ungültiger Suchfilter.');if(f[key])plan.filters[key]=f[key]}
 return plan;
}
export function searchURL(filters){const q=new URLSearchParams();for(const k of ['place','type','deal','price','area','rooms','sqm'])if(filters[k]!==undefined&&filters[k]!=='')q.set(k,String(filters[k]));return '/suche.html?'+q.toString()+'#suche'}
export function favoriteOptions(state){return Object.entries(state).filter(([,v])=>v?.favorite&&v.snapshot).map(([key,v])=>{const x={...v.snapshot,...v.address};return {key,label:[x.street||x.title||'Immobilie',x.zipcode,x.city].filter(Boolean).join(' · ')}})}
export function matchObjects(options,query){const norm=s=>s.toLocaleLowerCase('de').normalize('NFKD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();const words=norm(query).split(' ').filter(Boolean);return words.length?options.filter(x=>words.every(w=>norm(x.label).includes(w))):options}
export function commitAction(storage,input,key,{costs=[],id=crypto.randomUUID(),today=new Date().toISOString().slice(0,10)}={}){
 const plan=validatePlan(input),F='immobrain-listing-status-v1',T='immobrain-viewing-timeline-v1',V='immobrain-viewings-v1';
 const state=JSON.parse(storage.getItem(F)||'{}'),item=state[key];if(!item?.favorite||!item.snapshot)throw Error('Das Objekt ist nicht mehr in deinen Favoriten. Bitte neu auswählen.');
 if(plan.action==='visit'){
 const list=JSON.parse(storage.getItem(V)||'[]');if(!Array.isArray(list))throw Error('Gespeicherte Checklisten konnten nicht gelesen werden.');
 const timeline=JSON.parse(storage.getItem(T)||'{}'),r=timeline['object:'+key]||{};
 if(list.some(v=>v.data?.fields?.listingRef===key&&v.data.fields.date===plan.date&&v.data.fields.time===plan.time)||r.visit===plan.date&&r.visitTime===plan.time)throw Error('Für dieses Objekt besteht bereits ein Termin mit diesem Datum und dieser Uhrzeit.');
 const x={...item.snapshot,...item.address},name=[x.street||x.title,x.zipcode,x.city].filter(Boolean).join(' · ');
 const fields={listingRef:key,address:name,date:plan.date,time:plan.time,duration:'60',reserve:'15',contact:item.contact?.name||'',phone:item.contact?.phone||'',email:''};
 const entry={id,name,updatedAt:new Date().toISOString(),data:{fields,rows:costs.map(([group,label,unit,actions],i)=>({id:'p'+i,group,label,unit,actions,action:0,qty:0,price:0,prices:{}})),checks:{},notes:{}}};
 storage.setItem(V,JSON.stringify([...list,entry]));return {message:'Besichtigung gespeichert.',href:'/besichtigung.html?viewing='+encodeURIComponent(id)};
 }
 if(plan.action!=='status')throw Error('Diese Aktion speichert keine Objektdaten.');
 const before=storage.getItem(T),timeline=JSON.parse(before||'{}'),record=timeline['object:'+key]||{};
 if(plan.status!=='angebot'&&(record.offer||[1,2,3,4].some(n=>record['follow'+n])||record.decision==='no'&&plan.status!=='besichtigt'))throw Error('Zu diesem Objekt gibt es bereits eine Angebotsentscheidung oder Nachfassdaten. Bitte ändere den Status in der Terminpflege, damit die Historie erhalten bleibt.');
 if(['angebot','besichtigt'].includes(plan.status)&&(!plan.date||plan.date>today))throw Error('Bitte ein gültiges Datum bis einschließlich heute eintragen.');
 const next={...record};if(plan.status==='angebot'){next.decision='yes';next.offer=plan.date}else if(plan.status==='besichtigt'){next.visit=plan.date;if(next.decision!=='no')next.decision='pending'}
 timeline['object:'+key]=next;const updated={...state,[key]:{...item,status:plan.status,statusManual:true}};
 storage.setItem(T,JSON.stringify(timeline));try{storage.setItem(F,JSON.stringify(updated))}catch(error){try{if(before===null)storage.removeItem(T);else storage.setItem(T,before)}catch{}throw error}
 return {message:'Status auf „'+statusLabels[plan.status]+'“ gesetzt.',href:'/besichtigungskalender.html#obj-'+encodeURIComponent('object:'+key)};
}
