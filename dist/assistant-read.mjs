import {validatePlan,favoriteOptions,matchObjects,statusLabels} from './assistant-actions.mjs';
const F='immobrain-listing-status-v1';
function read(storage,key,fallback){try{return JSON.parse(storage.getItem(key))??fallback}catch{return fallback}}
export function queryLocal(storage,input,events=[],now=new Date()){
 const p=validatePlan(input);if(p.action!=='read')throw Error('Keine Datenabfrage.');
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(now),clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
 const state=read(storage,F,{}),options=favoriteOptions(state),matches=matchObjects(options,p.objectQuery);
 const dateLabel=d=>d.split('-').reverse().join('.'),money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
 if(['overview','object_details'].includes(p.target)){
  const selected=(p.objectQuery?matches:options).filter(o=>!p.status||(state[o.key].status||'interessant')===p.status);
  if(p.objectQuery&&!matches.length)return {title:'Kein passendes Objekt',text:'Für „'+p.objectQuery+'“ ist auf diesem Gerät kein favorisiertes Objekt gespeichert.',items:[]};
  if(p.target==='overview'){
   const counts=Object.entries(statusLabels).filter(([key])=>!p.status||key===p.status).map(([key,label])=>label+': '+selected.filter(o=>(state[o.key].status||'interessant')===key).length).join(' · ');
   return {title:'Deine Objektübersicht',text:selected.length+' favorisierte Objekte'+(p.status?' mit Status „'+statusLabels[p.status]+'“':'')+'. '+counts,items:selected.slice(0,5).map(o=>({title:o.label,detail:statusLabels[state[o.key].status||'interessant']||'Objekt interessant',href:'/besichtigungskalender.html#obj-'+encodeURIComponent('object:'+o.key)})),count:selected.length};
  }
  return {title:'Gespeicherte Objektdaten',text:selected.length?(selected.length>1?'Mehrere passende Objekte – hier sind ihre gespeicherten Angaben.':'Angaben aus deiner Merkliste.'): 'Keine Objekte für diese Auswahl.',items:selected.slice(0,5).map(o=>{const v=state[o.key],x=v.snapshot||{},amount=x.action==='mieten'?x.rent_price:x.price,parts=[statusLabels[v.status||'interessant']||'Objekt interessant'];if(amount!==null&&amount!==undefined&&amount!==''&&Number.isFinite(Number(amount)))parts.push((x.action==='mieten'?'Miete: ':'Kaufpreis: ')+money(Number(amount))+(x.action==='mieten'?' / Monat':''));if(x.square_meter!==null&&x.square_meter!==undefined&&x.square_meter!=='')parts.push(x.square_meter+' m²');if(x.rooms!==null&&x.rooms!==undefined&&x.rooms!=='')parts.push(x.rooms+' Zimmer');return {title:o.label,detail:parts.join(' · '),href:'/besichtigungskalender.html#obj-'+encodeURIComponent('object:'+o.key)}}),count:selected.length};
 }
 const visits=['next_visit','visits'].includes(p.target),nextOnly=['next_visit','next_contact'].includes(p.target),wanted=visits?e=>e.id.startsWith('visit:')||e.id.startsWith('manual-visit:'):e=>e.id.startsWith('next:');
 let selected=events.filter(e=>wanted(e)&&(!p.date||e.date===p.date));
 if(p.objectQuery){if(!matches.length)return {title:'Kein passendes Objekt',text:'Für „'+p.objectQuery+'“ ist kein favorisiertes Objekt auf diesem Gerät gespeichert.',items:[]};const allowed=new Set(matches.map(o=>'object:'+o.key)),viewings=read(storage,'immobrain-viewings-v1',[]),viewIds=new Set((Array.isArray(viewings)?viewings:[]).filter(v=>matches.some(o=>v.data?.fields?.listingRef===o.key)).map(v=>'visit:'+v.id));selected=selected.filter(e=>viewIds.has(e.id)||[...allowed].some(id=>e.id===('manual-visit:'+id)||e.id===('next:'+id)))}
 selected=selected.filter(e=>p.date||!visits&&!nextOnly||e.date>today||e.date===today&&(!e.time||e.time>=clock)).sort((a,b)=>(a.date+' '+(a.time||'00:00')).localeCompare(b.date+' '+(b.time||'00:00')));
 const items=selected.slice(0,nextOnly?1:5).map(e=>({title:e.title,detail:dateLabel(e.date)+(e.time?' um '+e.time+' Uhr':' · ohne Uhrzeit')+(!visits&&e.date<today?' · überfällig':'')+(e.location?' · '+e.location:''),href:e.path}));
 return {title:visits?(nextOnly?'Deine nächste Besichtigung':'Deine Besichtigungen'):(nextOnly?'Dein nächster Kontakt':'Geplante Nachfasskontakte'),text:items.length?(nextOnly?'Der nächste gespeicherte Termin'+(p.date?' am '+dateLabel(p.date):'')+'.':selected.length+' gespeicherte Termine'+(p.date?' am '+dateLabel(p.date):'')+'.'):(visits?'Keine anstehende Besichtigung':'Kein anstehender Kontakt')+(p.date?' am '+dateLabel(p.date):'')+' auf diesem Gerät gespeichert.',items,count:selected.length};
}
