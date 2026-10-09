import type { Workspace } from './data';
import { accountSpecSchema, instrumentSpecSchema } from './catalog-schema';
export function accounts(w:Workspace){return w.documents.filter(d=>d.kind==='ACCOUNT'&&!d.archivedAt).map(d=>({id:d.id,revision:d.revisions[0],spec:accountSpecSchema.parse(d.revisions[0].content.accountSpec)}));}
export function instruments(w:Workspace){return w.documents.filter(d=>d.kind==='INSTRUMENT'&&!d.archivedAt).map(d=>({id:d.id,revision:d.revisions[0],spec:instrumentSpecSchema.parse(d.revisions[0].content.instrumentSpec)}));}
export function accountSummary(w:Workspace,id:string){
 const a=accounts(w).find(a=>a.id===id);if(!a)return null;
 const positions=w.positions.filter(p=>!p.archivedAt&&p.plan.accountId===id&&p.plan.mode===a.spec.mode);
 const flows=w.movements.filter(m=>m.accountId===id).reduce((s,m)=>s+m.amount,0);
 const unknownPnl=positions.filter(p=>p.result.net==null).length;
 const realized=unknownPnl?null:positions.reduce((s,p)=>s+p.result.net!,0);
 const open=positions.filter(p=>!p.result.closed),unknownRisk=open.filter(p=>p.result.openRisk==null).length;
 const knownRisk=open.reduce((s,p)=>s+(p.result.openRisk??0),0);
 const usdRate=a.spec.currency==='USD'?1:a.spec.usdRate??null;
 return {...a,flows,realized,capital:realized==null?null:a.spec.initialCapital+flows+realized,knownRisk,unknownRisk,unknownPnl,usdRate,open:open.length};
}
export function portfolioRisk(w:Workspace){
 const real=w.positions.filter(p=>!p.archivedAt&&p.plan.mode==='REAL'&&!p.result.closed);
 const missing=real.filter(p=>p.result.openRisk==null||p.plan.accountToUsd==null);
 return {knownUsd:real.reduce((s,p)=>s+(p.result.openRisk!=null&&p.plan.accountToUsd!=null?p.result.openRisk*p.plan.accountToUsd:0),0),unknown:missing.length,positions:real.length};
}
