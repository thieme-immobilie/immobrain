var ImmoMarket = (() => {
  const storageKey = 'immobrain-manual-market-values-v1';
  const bands = {
    strong_under: {label:'Stark unterbewertet',range:'Unter −20 %',color:'market-darkgreen',bars:5},
    under: {label:'Leicht unterbewertet',range:'−20 % bis unter −5 %',color:'market-green',bars:4},
    fair: {label:'Fair bewertet',range:'−5 % bis +5 %',color:'market-lime',bars:3},
    over: {label:'Leicht überbewertet',range:'Über +5 % bis +20 %',color:'market-orange',bars:2},
    strong_over: {label:'Stark überbewertet',range:'Über +20 %',color:'market-red',bars:1}
  };
  function read() {
    try {
      const raw=JSON.parse(localStorage.getItem(storageKey)||'{}');
      if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
      return Object.fromEntries(Object.entries(raw).filter(([zip,item])=>/^\d{5}$/.test(zip)&&item&&typeof item==='object').map(([zip,item])=>[zip,{city:String(item.city||'').slice(0,150),purchase:positive(item.purchase),rent:positive(item.rent)}]));
    } catch { return {}; }
  }
  function positive(value) { if(value==null||value==='')return null;const n=Number(value);return Number.isFinite(n)&&n>=0.01&&n<=100000000?n:null; }
  let values=read(),notify=()=>{},documentRef=null,editing=null;
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=value=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
  function postcode(value) { if(value==null||value==='')return null;const raw=String(value).trim();if(!/^\d{1,5}$/.test(raw))return null;return raw.padStart(5,'0'); }
  function category(delta) { return delta < -20-1e-9?'strong_under':delta < -5-1e-9?'under':delta <=5+1e-9?'fair':delta<=20+1e-9?'over':'strong_over'; }
  function comparison(item,state={}) {
    const zip=postcode(state.address?.zipcode??item.zipcode),entry=zip&&values[zip],rental=item.action==='mieten',override=positive(state.market_override?.[rental?'rent':'purchase']),reference=override||(entry&&(rental?entry.rent:entry.purchase));
    if(!reference)return {available:false,zipcode:zip,reason:!zip?'Postleitzahl fehlt':'Kein '+(rental?'Mietwert':'Kaufwert')+' für diese PLZ hinterlegt'};
    const provided=rental?item.rent_per_square_meter:item.price_per_square_meter,price=rental?item.rent_price:item.price,area=Number(item.square_meter);
    const current=provided!=null&&provided!==''&&Number.isFinite(Number(provided))&&Number(provided)>=0?Number(provided):price!=null&&price!==''&&Number.isFinite(Number(price))&&Number(price)>=0&&Number.isFinite(area)&&area>0?Number(price)/area:null;
    if(current===null)return {available:false,zipcode:zip,reference,overridden:!!override,reason:'Inseratspreis pro m² fehlt'};
    const delta=(current-reference)/reference*100;if(!Number.isFinite(delta))return {available:false,zipcode:zip,reason:'Inseratspreis pro m² ist nicht auswertbar'};
    const total=area>0&&Number.isFinite(area)?reference*area:null,offerTotal=total===null?null:price!=null&&price!==''&&Number.isFinite(Number(price))&&Number(price)>=0?Number(price):current*area,difference=total!==null?offerTotal-total:null,potential=difference!==null?(difference===0?0:-difference):null,costMargin=offerTotal>0?potential/offerTotal*100:null,totalDelta=total>0?difference/total*100:null;return {available:true,zipcode:zip,overridden:!!override,reference,current,delta,band:category(delta),total,rental,offerTotal,difference,potential,costMargin,totalDelta};
  }
  function bars(band) { const info=bands[band];return `<span class="market-bars ${info.color}" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i class="${i<info.bars?'lit':''}"></i>`).join('')}</span>`; }
  function percent(value) { const rounded=Math.abs(value)<.0000001?0:value;return (rounded>0?'+':'')+new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(rounded)+' %'; }
  function signedMoney(value){const n=Math.abs(value)<0.005?0:value;return (n>0?'+':'')+money(n)}
  function markup(item,state={},key=item.local_key||JSON.stringify([String(item.source??''),String(item.immo_id??'')])) {
    const result=comparison(item,state),edit=`<button class="market-object-edit" type="button" data-action="market" data-key="${escape(key)}" title="Marktwert nur für dieses Objekt anpassen">Bearbeiten</button>`;
    if(!result.available)return `<div class="manual-market-panel market-missing"><div><strong>Dein Marktwert: Keine Angabe</strong><small>${escape(result.reason)}</small></div>${edit}</div>`;
    const info=bands[result.band],amountClass=value=>value>0?'market-amount-positive':value<0?'market-amount-negative':'market-amount-neutral';
    const difference=result.difference===null?'Keine Angabe':signedMoney(result.difference)+(result.rental?' / Monat':'');
    const differenceTone=result.difference===null?'market-amount-neutral':result.difference<0?'market-amount-positive':result.difference>0?'market-amount-negative':'market-amount-neutral';
    const margin=result.costMargin===null?'Keine Angabe':percent(result.costMargin),marginTone=result.costMargin===null?'market-amount-neutral':amountClass(result.costMargin);
    return `<section class="manual-market-panel${result.rental?' market-rental':''} ${info.color}" aria-label="Vergleich mit deinem Marktwert"><div class="market-overview"><span class="market-kicker">${result.overridden?'Eigener Objektwert':'Dein Marktwert · PLZ '+result.zipcode}</span><div class="market-delta"><strong>${percent(result.delta)}</strong>${bars(result.band)}<span>${info.label}</span></div><small>${money(result.reference)} / m²${result.rental?' pro Monat':''}${result.total!==null?' · Vergleichswert: '+money(result.total)+(result.rental?' / Monat':''):''}</small></div><div class="market-compact-stat"><small>Preisabweichung zum Vergleichswert</small><strong class="${differenceTone}">${difference}</strong></div>${result.rental?'':`<div class="market-compact-stat"><small title="Ohne Kaufnebenkosten, Renovierung, Finanzierung und Verkaufskosten">Marge auf Kaufpreis · vor Kosten</small><strong class="${marginTone}" title="(Vergleichswert − Kaufpreis) ÷ Kaufpreis">${margin}</strong></div>`}${edit}</section>`;
  }
  function matches(item,state,filters={}) {
    const band=filters.manual_market_band||'',from=filters.manual_market_min,to=filters.manual_market_max,hasFrom=from!==''&&from!=null,hasTo=to!==''&&to!=null;
    if(!band&&!hasFrom&&!hasTo)return true;
    const result=comparison(item,state);
    if(band==='unknown')return !result.available&&!hasFrom&&!hasTo;
    if(!result.available)return false;
    if(band&&result.band!==band)return false;
    return (!hasFrom||result.delta>=Number(from)-1e-9)&&(!hasTo||result.delta<=Number(to)+1e-9);
  }
  function compare(a,b,stateA,stateB,direction=1) {
    const left=comparison(a,stateA),right=comparison(b,stateB);
    if(!left.available&&!right.available)return 0;if(!left.available)return 1;if(!right.available)return -1;
    return direction*(left.delta-right.delta);
  }
  function syncFilter() {
    if(!documentRef)return;
    const field=documentRef.querySelector('[name=manual_market_band]');if(!field)return;
    documentRef.querySelectorAll('[data-market-band]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.marketBand===field.value)));
  }
  function save(next) { try{localStorage.setItem(storageKey,JSON.stringify(next));values=next;return true}catch{return false} }
  function render() {
    if(!documentRef)return;const list=documentRef.getElementById('market-value-list');if(!list)return;
    const rows=Object.entries(values).sort(([a],[b])=>a.localeCompare(b));
    list.innerHTML=rows.length?rows.map(([zip,value])=>`<article class="market-entry"><div><h3>${zip}${value.city?' · '+escape(value.city):''}</h3><p>Kauf: <strong>${value.purchase?money(value.purchase)+' / m²':'Keine Angabe'}</strong><br>Kaltmiete: <strong>${value.rent?money(value.rent)+' / m² pro Monat':'Keine Angabe'}</strong></p></div><div class="market-entry-actions"><a class="filter-trigger" href="/markt.html?plz=${zip}">Marktübersicht &amp; Karte öffnen</a><button class="filter-trigger" type="button" data-market-action="edit" data-zip="${zip}">Bearbeiten</button><button class="reset" type="button" data-market-action="delete" data-zip="${zip}">Löschen</button></div></article>`).join(''):'<p class="saved-empty">Noch keine PLZ-Marktwerte hinterlegt.</p>';
  }
  function init({document:doc,onChange}={}) {
    documentRef=doc||document;notify=onChange||(()=>{});const form=documentRef.getElementById('market-value-form');if(!form)return;
    const message=documentRef.getElementById('market-value-message'),cancel=documentRef.getElementById('market-value-cancel'),field=name=>form.elements.namedItem(name);
    const reset=()=>{editing=null;form.reset();cancel.hidden=true;field('zipcode').readOnly=false;documentRef.getElementById('market-value-save').textContent='Marktwert speichern'};
    form.addEventListener('submit',event=>{
      event.preventDefault();if(!form.reportValidity())return;const zip=field('zipcode').value.trim(),purchase=positive(field('purchase').value),rent=positive(field('rent').value);
      if(!/^\d{5}$/.test(zip)){message.textContent='Bitte eine fünfstellige PLZ eingeben.';return}if(!purchase&&!rent){message.textContent='Bitte mindestens einen positiven Kauf- oder Mietwert angeben.';return}
      const next={...read(),[zip]:{city:field('city').value.trim(),purchase,rent}};if(!save(next)){message.textContent='Der Marktwert konnte nicht im Browser gespeichert werden.';return}reset();message.textContent='Marktwert für '+zip+' gespeichert. Die Vergleiche wurden aktualisiert.';render();notify();
    });
    cancel.addEventListener('click',()=>{reset();message.textContent=''});
    documentRef.getElementById('market-value-list').addEventListener('click',event=>{
      const button=event.target.closest('button[data-market-action]');if(!button)return;const zip=button.dataset.zip,entry=values[zip];if(!entry)return;
      if(button.dataset.marketAction==='edit'){editing=zip;field('zipcode').value=zip;field('zipcode').readOnly=true;field('city').value=entry.city;field('purchase').value=entry.purchase??'';field('rent').value=entry.rent??'';cancel.hidden=false;documentRef.getElementById('market-value-save').textContent='Änderungen speichern';message.textContent='Marktwert für '+zip+' bearbeiten.';field('purchase').focus();return}
      if(button.dataset.marketAction==='delete'&&confirm('Marktwert für '+zip+' löschen?')){const next=read();delete next[zip];if(!save(next)){message.textContent='Der Marktwert konnte nicht gelöscht werden.';return}if(editing===zip)reset();message.textContent='Marktwert gelöscht. Inserate ohne passenden PLZ-Wert zeigen „Keine Angabe“.';render();notify()}
    });
    documentRef.querySelectorAll('[data-market-band]').forEach(button=>button.addEventListener('click',()=>{documentRef.querySelector('[name=manual_market_band]').value=button.dataset.marketBand;syncFilter()}));
    window.addEventListener('storage',event=>{if(event.key===storageKey||event.key===null){values=read();render();notify()}});
    render();syncFilter();
  }
  return {storageKey,bands,comparison,category,markup,matches,compare,syncFilter,render,init,refresh(){values=read();render()},percent};
})();
