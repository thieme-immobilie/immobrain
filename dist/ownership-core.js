var OwnershipCore=(()=>{
const usages={leer:'Leerstand',renovierung:'In Renovierung',vermietet:'Vermietet',eigennutzung:'Eigennutzung',verkauf:'Verkauf geplant'};
const numeric=['purchasePrice','rent','hausgeld','loanPayment'],dates=['purchaseDate','handoverDate'];
function validate(input){const out={};for(const key of numeric){const v=input[key];if(v===''||v===null||v===undefined){out[key]=null;continue}const n=Number(v);if(!Number.isFinite(n)||n<0||n>1e9)throw Error('Bitte gültige Beträge ab null eingeben.');out[key]=n}for(const key of dates){const v=String(input[key]||'');if(v&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(new Date(v+'T12:00:00Z').getTime())||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v))throw Error('Bitte ein gültiges Datum eingeben.');out[key]=v}if(input.usage&&!usages[input.usage])throw Error('Bitte eine gültige Nutzung wählen.');out.usage=input.usage||'';for(const [key,max]of Object.entries({managerName:200,managerPhone:80,managerEmail:254,notes:10000}))out[key]=String(input[key]||'').trim().slice(0,max);return out}
function purchased(state){return Object.entries(state||{}).filter(([,v])=>v?.status==='gekauft')}
function update(previous,input,now=new Date().toISOString()){return {...previous,favorite:true,status:'gekauft',statusManual:true,ownership:{...previous?.ownership,...validate(input),updatedAt:now}}}
return {usages,validate,purchased,update};})();
if(typeof module!=='undefined')module.exports=OwnershipCore;
