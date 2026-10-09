import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3101';
async function post(path, body, status=200) {
 const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(body)});
 const d=await r.json(); assert.equal(r.status,status,JSON.stringify(d)); return d;
}
const workspace=async()=>await (await fetch(base+'/api/workspace')).json();
const doc=await post('/api/workspace',{action:'document',document:{kind:'MARKET',content:{title:'Validation progression '+randomUUID().slice(0,6),body:'Contexte Daily haussier, attendre confirmation 4H.',invalidation:'Cassure du dernier creux',bullish:'Retest puis continuation',bearish:'Correction sous le creux'}}});
let w=await workspace(); const rev=w.documents.find(d=>d.id===doc.id).revisions[0];
const rating={value:'MET',evidence:'Observation explicitement documentée dans le plan initial.'};
const a={requestId:randomUUID(),subjectType:'DOCUMENT',subjectId:doc.id,revisionId:rev.id,skill:'entry',decision:'WAIT',criteria:{analysis:rating,plan:rating,execution:rating,rules:rating},observation:'Confirmation attendue avant une éventuelle entrée.',uncertainty:'Un seul exemple ne démontre aucune compétence stable.',errors:['EARLY_ENTRY'],errorStatus:'SUSPECTED'};
const first=await post('/api/learning',a); assert.equal((await post('/api/learning',a)).id,first.id);
w=await workspace(); const saved=w.assessments.find(x=>x.id===first.id); assert.equal(saved.timing,'BEFORE_RECORDED_OUTCOME');
await post('/api/workspace',{action:'document',document:{kind:'MARKET',id:doc.id,expectedVersion:1,content:{...rev.content,body:'Nouvelle interprétation',evidence:'Résultat observé après échéance'}}});
const correction=await post('/api/learning',{...a,requestId:randomUUID(),supersedesId:first.id,errorStatus:'REFUTED'});
await post('/api/learning',{...a,requestId:randomUUID(),supersedesId:first.id},400);
w=await workspace(); assert.deepEqual(w.assessments.find(x=>x.id===first.id).snapshot,saved.snapshot); assert.equal(w.assessments.find(x=>x.id===correction.id).timing,'RETROSPECTIVE');
const plan={title:'Attendre confirmation 4H',skill:'entry',criterion:'Heure de confirmation consignée avant entrée',action:'Revoir trois captures sans résultat et comparer les heures.',reviewDate:'2026-10-16',priority:true,status:'TESTING',evidenceIds:[first.id]};
const cycle=await post('/api/workspace',{action:'document',document:{kind:'LEARNING',content:plan}});
w=await workspace(); const cycleRev=w.documents.find(x=>x.id===cycle.id).revisions[0];
await post('/api/learning',{...a,requestId:randomUUID(),cycleRevisionId:cycleRev.id,cycleCriterion:rating});
await post('/api/learning',{...a,requestId:randomUUID(),skill:'risk',cycleRevisionId:cycleRev.id,cycleCriterion:rating},400);
await post('/api/workspace',{action:'document',document:{kind:'LEARNING',content:{...plan,evidenceIds:['inexistent']}}},400);
const backup=await (await fetch(base+'/api/export?format=json')).json(); assert.ok(backup.assessments.some(x=>x.id===first.id)); assert.ok(backup.assessments.some(x=>x.id===correction.id));
console.log('PASS: assessments, immutable snapshots, corrections, retrospective classification, criterion linking, invalid evidence rejection, export.');
