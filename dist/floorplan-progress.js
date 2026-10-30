var FloorplanProgress=(()=>{
function baseline(samples){const valid=(Array.isArray(samples)?samples:[]).filter(n=>Number.isFinite(n)&&n>=5&&n<=270).slice(-8).sort((a,b)=>a-b);const mid=Math.floor(valid.length/2);return {seconds:valid.length?(valid.length%2?valid[mid]:(valid[mid-1]+valid[mid])/2):180,measured:valid.length>0}}
function state(elapsed,expected){const seconds=Math.max(0,Math.floor(elapsed)),target=Math.max(5,expected);return {seconds,percent:Math.min(95,Math.round(5+90*(1-Math.exp(-seconds/(target/2))))),remaining:seconds<target?Math.ceil(target-seconds):null}}
function time(seconds){return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')}
return {baseline,state,time};})();
if(typeof module!=='undefined')module.exports=FloorplanProgress;
