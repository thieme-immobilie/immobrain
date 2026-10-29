import assert from 'node:assert/strict';
import {crypt,googleEvent,googleService} from '../supabase/functions/calendar-feed/google-calendar.mjs';
const encrypted=await crypt('refresh-test','secret');assert.equal(await crypt(encrypted,'secret',true),'refresh-test');await assert.rejects(()=>crypt(encrypted,'wrong',true));
const event={id:'one',date:'2026-11-01',time:'10:30',duration:60,title:'Besichtigung',path:'/besichtigung.html',note:'Notiz'};
assert.equal(googleEvent(event).start.dateTime,'2026-11-01T09:30:00.000Z');assert.equal(googleEvent({...event,time:''}).end.date,'2026-11-02');
let row=null,oauth=null,events=[event],calls=[];
const db=async(path,method='GET',body)=>{if(path.startsWith('immobrain_google_oauth')){if(method==='POST'){oauth=body;return [body]}if(method==='DELETE'){const value=oauth;oauth=null;return value?[value]:[]}}
if(path.startsWith('immobrain_calendar_state'))return [{events}];
if(method==='POST'){row={...body,mappings:{},lease_until:'1970-01-01'};return [row]}
if(method==='PATCH'){Object.assign(row,body);return [row]}if(method==='DELETE'){row=null;return []}return row?[row]:[]};
const fetcher=async(url,opts)=>{calls.push({url,method:opts.method,body:opts.body});if(url.includes('/token'))return Response.json({access_token:'access',refresh_token:'refresh',scope:'https://www.googleapis.com/auth/calendar.app.created'});if(url.endsWith('/calendars'))return Response.json({id:'calendar'});return opts.method==='DELETE'?new Response(null,{status:204}):Response.json({id:'event'})};
const service=googleService({db,base:'https://test.supabase.co',secret:'secret',fetcher});
const start=await service.start('owner'),url=new URL(start.url);assert.equal(url.searchParams.get('scope'),'https://www.googleapis.com/auth/calendar.app.created');assert.equal(url.searchParams.get('code_challenge_method'),'S256');
const callback=new URL('https://test/?state='+url.searchParams.get('state')+'&code=test');await service.finish(callback);await assert.rejects(()=>service.finish(callback));assert((await service.status('owner')).connected);
await service.sync('owner');assert.equal(calls.filter(c=>c.url.includes('/events')&&c.method==='POST').length,1);await service.sync('owner');assert.equal(calls.filter(c=>c.url.includes('/events')&&c.method==='POST').length,1);
events=[];await service.sync('owner');assert(calls.some(c=>c.url.includes('/events/')&&c.method==='DELETE'));assert.equal(Object.keys(row.mappings).length,0);
console.log('Encryption, OAuth replay protection, narrow scope, date conversion, idempotent sync and removed events passed');
