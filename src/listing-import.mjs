// Only public property pages on explicitly supported portals may be fetched.
const PORTALS = [
  {hosts:['immobilienscout24.de','www.immobilienscout24.de'],source:'immoscout',pattern:/^\/expose\/(\d+)(?:\/|$)/i},
  {hosts:['immowelt.de','www.immowelt.de'],source:'immowelt',pattern:/^\/expose\/([a-z0-9-]+)(?:\/|$)/i},
  {hosts:['immonet.de','www.immonet.de'],source:'immonet',pattern:/^\/(?:expose|angebot)\/([a-z0-9-]+)(?:\/|$)/i},
  {hosts:['kleinanzeigen.de','www.kleinanzeigen.de'],source:'kleinanzeigen',pattern:/^\/s-anzeige\/[^/]+\/(\d+)(?:-|\/|$)/i},
  {hosts:['ohne-makler.net','www.ohne-makler.net'],source:'ohne-makler',pattern:/^\/immobilie\/(\d+)(?:\/|$)/i},
  {hosts:['immobilien.de','www.immobilien.de'],source:'immobilien.de',pattern:/^\/wohnen\/.+-([0-9]+)\/?(?:\.html)?$/i}
];
export function validateListingURL(value){
  let url;try{url=new URL(value)}catch{throw new Error('Bitte einen gültigen Inseratlink eingeben.')}
  if(url.protocol!=='https:'||url.username||url.password||url.port||String(value).length>2048)throw new Error('Bitte einen öffentlichen HTTPS-Inseratlink ohne Zugangsdaten verwenden.');
  const portal=PORTALS.find(x=>x.hosts.includes(url.hostname.toLowerCase())),match=portal&&url.pathname.match(portal.pattern);
  if(!match)throw new Error('Unterstützt werden direkte Inseratlinks von ImmoScout24, immowelt, immonet, Kleinanzeigen, ohne-makler und Immobilien.de. Andere Links kannst du manuell hinterlegen.');
  url.hash='';url.search='';return {url,source:portal.source,id:match[1]};
}
const clean=value=>String(value??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim().slice(0,500);
function numeric(value){if(value===undefined||value===null||value==='')return null;if(typeof value==='object')value=value.value??value.price;if(typeof value==='number')return Number.isFinite(value)&&value>=0?value:null;let text=String(value).trim().replace(/\s|€|EUR|m²/gi,'');if(!/^\d[\d.,]*$/.test(text))return null;if(text.includes(','))text=text.replace(/\./g,'').replace(',','.');else if(/^\d{1,3}(\.\d{3})+$/.test(text))text=text.replace(/\./g,'');const result=Number(text);return Number.isFinite(result)&&result>=0?result:null}
const list=x=>x==null?[]:Array.isArray(x)?x:[x];
const types=x=>list(x?.['@type']).map(v=>String(v).toLowerCase());
function metadata(html){const result={};for(const match of html.matchAll(/<meta\b([^>]{0,10000})>/gi)){const attributes={};for(const a of match[1].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))attributes[a[1].toLowerCase()]=a[2]??a[3];const key=attributes.property||attributes.name;if(key&&attributes.content)result[key.toLowerCase()]=clean(attributes.content)}return result}
export function extractListing(html, info){
  const nodes=[];function walk(x,depth=0){if(!x||typeof x!=='object'||depth>15||nodes.length>1000)return;if(!Array.isArray(x))nodes.push(x);for(const v of Object.values(x))if(v&&typeof v==='object')walk(v,depth+1)}
  for(const match of html.matchAll(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)){try{walk(JSON.parse(match[1]))}catch{}}
  const estateTypes=['apartment','house','singlefamilyresidence','residence','accommodation'];
  const root=nodes.find(x=>types(x).includes('realestatelisting'));
  const residence=nodes.find(x=>estateTypes.some(t=>types(x).includes(t)));
  const product=nodes.find(x=>types(x).includes('product'));
  const offer=nodes.find(x=>types(x).some(t=>['offer','offerforsale','offerforlease'].includes(t)))||root?.offers||product?.offers;
  const subject=residence||root?.mainEntity||offer?.itemOffered||product||{},meta=metadata(html);
  const address=subject.address||residence?.address||root?.address||{};
  const result={url:info.url.href,source:info.source,external_id:info.id};
  const assign=(key,value)=>{if(value!==null&&value!==undefined&&value!=='')result[key]=value};
  assign('title',clean(root?.name||subject.name||offer?.name||meta['og:title']||meta['twitter:title']));
  if(address&&typeof address==='object'){assign('street',clean(address.streetAddress));assign('city',clean(address.addressLocality));const zip=clean(address.postalCode);if(/^\d{5}$/.test(zip))result.zipcode=zip}
  let size=subject.floorSize||residence?.floorSize;const unit=String(size?.unitCode||size?.unitText||'').toLowerCase();if(!unit||['mtk','sqm','m2','m²','square metre','square meter'].includes(unit))assign('square_meter',numeric(size));
  assign('rooms',numeric(subject.numberOfRooms||residence?.numberOfRooms));
  if(estateTypes.some(t=>types(subject).includes(t)))result.typ=types(subject).includes('apartment')?'wohnung':types(subject).some(t=>['house','singlefamilyresidence'].includes(t))?'haus':undefined;
  const offers=list(offer),eur=offers.find(o=>o&&(!o.priceCurrency||o.priceCurrency==='EUR'));const currency=eur?.priceSpecification?.priceCurrency||eur?.priceCurrency||'EUR';
  const business=String(eur?.businessFunction||'').toLowerCase(),action=types(eur).includes('offerforlease')||business.includes('leaseout')||types(root?.potentialAction).includes('rentaction')?'mieten':business.includes('sell')||types(eur).includes('offerforsale')?'kaufen':null;
  if(action)result.action=action;
  if(currency==='EUR')assign('amount',numeric(eur?.price??eur?.priceSpecification?.price??meta['product:price:amount']));
  const energyProperties=nodes.filter(x=>types(x).includes('propertyvalue')&&/energie.*(?:klasse|effizienz)|energy.*class/i.test(String(x.name||x.propertyID||'')));
  const energy=String(energyProperties[0]?.value||'').trim().toUpperCase();if(['A+','A','B','C','D','E','F','G','H'].includes(energy)&&energyProperties.length)result.energy_efficency_class=energy;
  const date=root?.datePosted||root?.datePublished||subject.datePosted||meta['article:published_time'];if(/^\d{4}-\d{2}-\d{2}/.test(String(date||'')))result.uptime_date=String(date).slice(0,10);
  return result;
}
async function readBounded(response,limit=1500000){if(Number(response.headers.get('Content-Length'))>limit){await response.body?.cancel();throw new Error('Die Inseratseite ist für den Import zu groß.')}if(!response.body)return '';const reader=response.body.getReader();const chunks=[];let length=0;try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit)throw new Error('Die Inseratseite ist für den Import zu groß.');chunks.push(value)}}finally{await reader.cancel().catch(()=>{})}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return new TextDecoder().decode(bytes)}
async function fromSomantic(info,key,fetcher){if(!key)return null;const fields='immo_id title url source typ action city zipcode price rent_price square_meter rooms energy_efficency_class uptime_date';const query='{ '+['appartments','houses'].map(t=>`${t}: all_${t}(per_page: 5, filters: {immo_id: ${JSON.stringify(info.id)}}) { edges { node { ${fields} } } }`).join(' ')+' }';const response=await fetcher('https://www.somantic.net/api/graphql',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':key},body:JSON.stringify({query}),signal:AbortSignal.timeout(12000)});if(response.status===429)throw new Error('Somantic-Anfragelimit erreicht.');if(!response.ok)return null;const data=await response.json();const candidates=Object.values(data.data||{}).flatMap(x=>list(x?.edges).map(e=>e.node).filter(Boolean));for(const item of candidates){try{const match=validateListingURL(item.url);if(match.source===info.source&&match.id===info.id){const result={...item,url:info.url.href,external_id:info.id};result.amount=item.action==='mieten'?item.rent_price:item.price;return result}}catch{}}return null}
export async function importListing(request,env,fetcher=fetch){
  const respond=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
  let info;try{const raw=await request.text();if(raw.length>4096)return respond({error:'Der Link ist zu lang.'},400);const body=JSON.parse(raw);info=validateListingURL(body.url)}catch(error){return respond({error:error.message||'Ungültiger Inseratlink.'},400)}
  let apiMessage='';try{const listing=await fromSomantic(info,env.SOMANTIC_API_KEY,fetcher);if(listing)return respond({listing,method:'somantic',message:'Daten aus Somantic übernommen. Bitte alle Angaben vor dem Speichern prüfen.'})}catch(error){apiMessage=error.message==='Somantic-Anfragelimit erreicht.'?error.message:''}
  try{let current=info.url,response;const signal=AbortSignal.timeout(12000);for(let i=0;i<3;i++){response=await fetcher(current.href,{redirect:'manual',headers:{'Accept':'text/html','User-Agent':'ImmoBrain-Linkimport/1.0'},signal});if(response.status>=300&&response.status<400){const location=response.headers.get('Location');await response.body?.cancel();if(!location)throw new Error('Das Portal hat auf eine unbekannte Seite weitergeleitet.');const next=validateListingURL(new URL(location,current).href);if(next.source!==info.source||next.id!==info.id)throw new Error('Das Portal hat auf eine andere Seite weitergeleitet.');current=next.url;response=null;continue}break}
    if(!response||!response.ok)throw new Error('Das Portal blockiert den Abruf oder das Inserat ist nicht mehr verfügbar.');
    if(!/text\/html|application\/xhtml\+xml/i.test(response.headers.get('Content-Type')||''))throw new Error('Das Portal liefert keine auslesbare Inseratseite.');
    const html=await readBounded(response);if(/<title[^>]*>[^<]*(?:captcha|access denied|just a moment|zugriff verweigert|robot)/i.test(html))throw new Error('Das Portal schützt diese Seite vor automatischem Abruf.');
    const listing=extractListing(html,info);const fields=['square_meter','amount','city','zipcode','rooms','energy_efficency_class'];if(!fields.some(key=>listing[key]!=null))return respond({error:'Es konnten keine verlässlichen Objektdaten ausgelesen werden. Bitte die Angaben manuell ergänzen.'},422);
    return respond({listing,method:'public-page',message:'Öffentliche Inseratdaten übernommen. Fehlende Angaben bitte ergänzen; insbesondere Vermarktung und Preis prüfen.'});
  }catch(error){return respond({error:(apiMessage?apiMessage+' ':'')+(error.name==='TimeoutError'?'Das Portal hat nicht rechtzeitig geantwortet.':error.message||'Das Inserat konnte nicht geladen werden.')+' Du kannst das Objekt manuell mit diesem Link anlegen.'},422)}
}
