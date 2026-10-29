(()=>{
const panels=[...document.querySelectorAll('[data-viewing-panel]')],links=[...document.querySelectorAll('[data-viewing-tab]')];if(!panels.length)return;
function activate(){const hash=location.hash.slice(1);for(const panel of panels)panel.hidden=false;for(const link of links){if(link.dataset.viewingTab==='kalender')link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')}let target;if(hash==='verbinden'||hash==='calendar-connect'){target=document.getElementById('calendar-connect');if(target)target.open=true}else if(hash==='objekte'||hash==='objektuebersicht')target=document.getElementById('overview-panel');else if(hash.startsWith('obj-')){try{target=document.getElementById(decodeURIComponent(hash))}catch{}}if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'smooth'}))}
window.addEventListener('hashchange',activate);activate();
})();
