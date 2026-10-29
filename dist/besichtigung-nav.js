(()=>{
const panels=[...document.querySelectorAll('[data-viewing-panel]')],links=[...document.querySelectorAll('[data-viewing-tab]')];if(!panels.length)return;
function activate(){const hash=location.hash.slice(1),key=hash==='verbinden'||hash==='calendar-connect'?'verbinden':hash==='objekte'||hash==='objektuebersicht'||hash.startsWith('obj-')?'objekte':'kalender';for(const panel of panels){panel.hidden=panel.dataset.viewingPanel!==key;if(panel.dataset.viewingPanel==='verbinden'&&!panel.hidden)panel.open=true}for(const link of links){if(link.dataset.viewingTab===key)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')}if(hash.startsWith('obj-')){let target;try{target=document.getElementById(decodeURIComponent(hash))}catch{}if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'smooth'}))}}
window.addEventListener('hashchange',activate);activate();
})();
