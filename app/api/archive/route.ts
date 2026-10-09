import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { planSchema } from '@/lib/research/schema';
export async function POST(req:Request){try{
 await requireSession();const v=z.object({id:z.string(),type:z.enum(['POSITION','DOCUMENT']),archive:z.boolean(),reason:z.string().trim().min(5).max(2000)}).parse(await req.json());
 await prisma.$transaction(async tx=>{
 if(v.type==='POSITION'){
  await tx.$queryRaw`SELECT id FROM "ResearchPosition" WHERE id=${v.id} FOR UPDATE`;
  await tx.researchPosition.update({where:{id:v.id},data:{archivedAt:v.archive?new Date():null}});
 }else{
  await tx.$queryRaw`SELECT id FROM "ResearchDocument" WHERE id=${v.id} FOR UPDATE`;
  const d=await tx.researchDocument.findUniqueOrThrow({where:{id:v.id}});
  if(v.archive&&d.kind==='ACCOUNT'&&(await tx.researchPosition.findMany({where:{archivedAt:null}})).some(p=>planSchema.parse(p.plan).accountId===d.id))throw new Error('Archive les positions du compte avant le compte. Les écritures sont conservées.');
  await tx.researchDocument.update({where:{id:v.id},data:{archivedAt:v.archive?new Date():null}});
 }
 await tx.researchDocument.create({data:{kind:'AUDIT',revisions:{create:{version:1,content:{title:v.archive?'Archivage contrôlé':'Restauration',body:v.reason,asset:v.id,action:v.type,status:'OBSERVATION'}}}}});
 });return NextResponse.json({success:true});
}catch(e){return NextResponse.json({error:e instanceof Error&&!e.message.includes('Prisma')?e.message:'Archivage non effectué'},{status:400});}}
