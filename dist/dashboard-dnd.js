(()=>{'use strict';const grid=document.getElementById('dashboard-groups');if(!grid)return;
const F='immobrain-listing-status-v1',T='immobrain-viewing-timeline-v1',labels={interessant:'Objekt interessant',angefragt:'Objekt angefragt',besichtigt:'Besichtigt',angebot:'Angebot gestellt'};let dragged=null;
const notice=document.createElement('p');notice.className='dashboard-move-message';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');grid.after(notice);
function clear(){dragged=null;grid.querySelectorAll('.drop-active,.is-dragging').forEach(el=>el.classList.remove('drop-active','is-dragging'))}
function move(id,status){if(!Object.hasOwn(labels,status))return;try{
 const state=JSON.parse(localStorage.getItem(F)||'{}'),timeline=JSON.parse(localStorage.getItem(T)||'{}');
 if(id.startsWith('object:')&&state[id.slice(7)]?.favorite){const key=id.slice(7);state[key]={...state[key],status,statusManual:true};localStorage.setItem(F,JSON.stringify(state))}
 else{const views=JSON.parse(localStorage.getItem('immobrain-viewings-v1')||'[]');if(!Array.isArray(views)||!views.some(v=>id==='viewing:'+v.id||id==='object:'+v.data?.fields?.listingRef))throw Error('Objekt nicht mehr vorhanden.');timeline[id]={...timeline[id],objectStatus:status,statusManual:true};localStorage.setItem(T,JSON.stringify(timeline))}
 clear();window.dispatchEvent(new Event('immobrain-calendar-changed'));window.dispatchEvent(new Event('focus'));notice.textContent='Status gespeichert: '+labels[status]+'. Vorhandene Termine und Historie bleiben erhalten.';
 }catch{clear();notice.textContent='Status konnte nicht gespeichert werden. Bitte den Browserspeicher prüfen.'}}
grid.addEventListener('dragstart',e=>{const card=e.target.closest('[data-object-id]');if(!card||e.target.closest('select,option,button')){e.preventDefault();return}dragged=card.dataset.objectId;card.classList.add('is-dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragged)});
grid.addEventListener('dragover',e=>{const column=e.target.closest('[data-drop-status]');if(!dragged||!column)return;e.preventDefault();e.dataTransfer.dropEffect='move';grid.querySelectorAll('.drop-active').forEach(el=>el.classList.remove('drop-active'));column.classList.add('drop-active')});
grid.addEventListener('dragleave',e=>{const column=e.target.closest('[data-drop-status]');if(column&&!column.contains(e.relatedTarget))column.classList.remove('drop-active')});
grid.addEventListener('drop',e=>{const column=e.target.closest('[data-drop-status]');if(!dragged||!column)return;e.preventDefault();move(dragged,column.dataset.dropStatus)});
grid.addEventListener('dragend',clear);
grid.addEventListener('change',e=>{const select=e.target.closest('[data-move]');if(select?.value)move(select.dataset.move,select.value)});
})();

