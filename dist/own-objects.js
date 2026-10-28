(()=>{
  const ownDialog=document.getElementById('own-object-dialog'),ownForm=document.getElementById('own-object-form'),ownMessage=document.getElementById('own-object-message'),importButton=document.getElementById('own-object-import'),ownFields=ownForm.elements;
  let editingKey=null,importController=null,importedData=null,importedNow=false;
  const ownNumber=name=>ownFields.namedItem(name).value===''?null:Number(ownFields.namedItem(name).value);
  function updateSqm(){const area=ownNumber('area'),amount=ownNumber('amount');document.getElementById('own-object-sqm').textContent=area>0&&amount!==null?euro(amount/area)+(ownFields.namedItem('action').value==='mieten'?' / m² pro Monat':' / m²'):'–'}
  function cancelImport(){if(importController)importController.abort();importController=null;importButton.disabled=false;importButton.textContent='Daten aus Link übernehmen'}
  function openOwnObject(key=null,withLink=false){cancelImport();ownForm.reset();editingKey=key;importedData=null;importedNow=false;ownMessage.textContent='';const saved=key&&savedState[key];const item=saved?.snapshot;
    document.getElementById('own-object-title').textContent=key?'Eigenes Objekt bearbeiten':'Eigenes Objekt anlegen';
    if(item){const values={title:item.title||'',action:item.action||'kaufen',typ:item.typ||'wohnung',area:item.square_meter??'',amount:item.action==='mieten'?item.rent_price??'':item.price??'',rooms:item.rooms??'',city:item.city||'',zipcode:item.zipcode||'',street:item.street||'',energy:item.energy_efficency_class||'',url:item.url||'',date:item.uptime_date?String(item.uptime_date).slice(0,10):'',status:saved.status||'interessant'};for(const [name,value]of Object.entries(values))ownFields.namedItem(name).value=value;importedData=item}
    updateSqm();ownDialog.showModal();ownFields.namedItem(withLink?'url':'title').focus();
  }
  window.openOwnObject=openOwnObject;
  document.getElementById('own-object-add').addEventListener('click',()=>openOwnObject());
  document.getElementById('own-object-add-link').addEventListener('click',()=>openOwnObject(null,true));
  document.getElementById('own-object-close').addEventListener('click',()=>{cancelImport();ownDialog.close()});
  ownDialog.addEventListener('close',cancelImport);
  ownDialog.addEventListener('cancel',cancelImport);
  ownForm.addEventListener('input',updateSqm);
  importButton.addEventListener('click',async()=>{
    const urlField=ownFields.namedItem('url');if(!urlField.value.trim()){ownMessage.textContent='Bitte zuerst einen direkten Inseratlink eingeben.';urlField.focus();return}if(!urlField.reportValidity())return;
    if(['title','area','amount','city'].some(name=>ownFields.namedItem(name).value!=='')&&!confirm('Die ausgefüllten Objektdaten durch die erkannten Angaben ersetzen?'))return;
    cancelImport();const controller=new AbortController();importController=controller;importButton.disabled=true;importButton.textContent='Inserat wird geladen …';ownMessage.textContent='';
    try{const response=await fetch('/api/listings/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:urlField.value.trim()}),signal:controller.signal});const data=await response.json();if(importController!==controller)return;if(!response.ok)throw new Error(data.error||'Das Inserat konnte nicht geladen werden.');const item=data.listing;if(!item||typeof item!=='object')throw new Error('Das Inserat enthält keine verwertbaren Angaben.');
      importedData=item;importedNow=true;const values={title:item.title||'',area:item.square_meter??'',amount:item.amount??(item.action==='mieten'?item.rent_price:item.price)??'',rooms:item.rooms??'',city:item.city||'',zipcode:item.zipcode||'',street:item.street||'',energy:item.energy_efficency_class||'',date:item.uptime_date?String(item.uptime_date).slice(0,10):'',url:item.url||urlField.value,typ:['wohnung','haus'].includes(item.typ)?item.typ:'',action:['kaufen','mieten'].includes(item.action)?item.action:''};for(const [name,value]of Object.entries(values))ownFields.namedItem(name).value=value;
      ownMessage.textContent=data.message||'Angaben übernommen. Bitte vor dem Speichern prüfen.';updateSqm();
    }catch(error){if(error.name!=='AbortError'&&importController===controller)ownMessage.textContent=error.message||'Import nicht möglich. Du kannst die Daten manuell ergänzen.'}finally{if(importController===controller){importController=null;importButton.disabled=false;importButton.textContent='Daten aus Link übernehmen'}}
  });
  function normalizedURL(value){try{const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return null;u.hash='';for(const name of [...u.searchParams.keys()])if(/^(utm_|gad_|gclid$|fbclid$)/i.test(name))u.searchParams.delete(name);u.searchParams.sort();return u.href.replace(/\/$/,'')}catch{return null}}
  ownForm.addEventListener('submit',event=>{
    event.preventDefault();if(importController){ownMessage.textContent='Bitte warten, bis der Linkimport abgeschlossen ist.';return}if(!ownForm.reportValidity())return;
    const get=name=>ownFields.namedItem(name).value.trim(),url=get('url');if(!get('title')||!get('city')){ownMessage.textContent='Bitte einen Objekttitel und einen Ort eingeben.';return}if(url&&!normalizedURL(url)){ownMessage.textContent='Bitte einen HTTP- oder HTTPS-Link ohne Zugangsdaten verwenden.';return}
    const duplicate=url&&Object.entries(savedState).find(([key,value])=>key!==editingKey&&value?.favorite&&[value.snapshot,...(value.snapshot?.portalListings||[])].some(item=>item?.url&&normalizedURL(item.url)===normalizedURL(url)));
    if(duplicate){ownMessage.textContent='Ein Objekt mit diesem Inseratlink befindet sich bereits in deiner Merkliste. Bitte bearbeite das vorhandene Objekt.';return}
    const previous=editingKey?savedState[editingKey]:null,old=previous?.snapshot||{},id=old.immo_id||'own-'+(crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)),source=importedData?.source||old.source||'Eigenes Objekt',key=editingKey||JSON.stringify([source,id]),action=get('action'),area=ownNumber('area'),amount=ownNumber('amount');
    const snapshot={immo_id:id,local_key:key,title:get('title'),source,typ:get('typ'),action,city:get('city'),zipcode:get('zipcode'),street:get('street'),square_meter:area,rooms:ownNumber('rooms'),price:action==='kaufen'?amount:null,rent_price:action==='mieten'?amount:null,price_per_square_meter:action==='kaufen'&&area>0?amount/area:null,rent_per_square_meter:action==='mieten'&&area>0?amount/area:null,energy_efficency_class:get('energy')||null,renovation_needed:typeof importedData?.renovation_needed==='boolean'?importedData.renovation_needed:typeof old.renovation_needed==='boolean'?old.renovation_needed:null,uptime_date:get('date')||null,url,created_at:old.created_at||new Date().toISOString(),import_method:importedNow?'link':old.import_method||'manual'};
    const ranks=orderedFavorites().map(([,value],i)=>Number.isFinite(value.priority)?value.priority:i);savedState[key]={...previous,favorite:true,custom:true,status:get('status'),priority:previous?.priority??(ranks.length?Math.max(...ranks)+1:0),snapshot};
    if(!saveState()){if(previous)savedState[key]=previous;else delete savedState[key];ownMessage.textContent='Das Objekt konnte nicht gespeichert werden. Bitte prüfe den verfügbaren Browserspeicher.';return}
    ownDialog.close();objectFilter.value='all';renderObjects();render();
  });
})();
