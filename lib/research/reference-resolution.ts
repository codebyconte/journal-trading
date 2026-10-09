import { CURATED } from './references';
import { docContentSchema } from './schema';
import type { Prisma } from '@prisma/client';
export async function resolveReferences(tx:Prisma.TransactionClient,refs:{id:string;revisionId?:string;stance:string;note:string}[]){
 return Promise.all(refs.map(async r=>{
  if(r.id.startsWith('curated:')){const c=CURATED.find(c=>c.id===r.id);if(!c||r.revisionId&&r.revisionId!==c.revisionId)throw new Error('Référence de catalogue introuvable');return {...r,revisionId:c.revisionId,snapshot:c.research};}
  const rev=await tx.researchRevision.findFirstOrThrow({where:{documentId:r.id,id:r.revisionId,document:{kind:'RESEARCH'}},orderBy:{version:'desc'}});const c=docContentSchema.parse(rev.content);return {...r,revisionId:rev.id,snapshot:c.research!};
 }));
}
