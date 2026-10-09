import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { docContentSchema,planSchema,eventSchema } from '@/lib/research/schema';
import { ledger } from '@/lib/research/finance';
export async function POST(req:Request){try{
 await requireSession();const v=z.object({accountId:z.string(),requestId:z.string().uuid(),amount:z.number().finite().min(-1e12).max(1e12).refine(v=>v!==0),occurredAt:z.string().datetime(),note:z.string().trim().min(3).max(1000)}).parse(await req.json());
 if(v.occurredAt>new Date().toISOString())throw new Error('Date future interdite');
 const result=await prisma.$transaction(async tx=>{
 await tx.$queryRaw`SELECT id FROM "ResearchDocument" WHERE id=${v.accountId} FOR UPDATE`;
 const duplicate=await tx.accountMovement.findUnique({where:{requestId:v.requestId}});if(duplicate)return duplicate;
 const a=await tx.researchDocument.findFirstOrThrow({where:{id:v.accountId,kind:'ACCOUNT',archivedAt:null},include:{revisions:{orderBy:{version:'desc'},take:1}}});const spec=docContentSchema.parse(a.revisions[0].content).accountSpec!;
 const movements=await tx.accountMovement.findMany({where:{accountId:a.id}});let balance=spec.initialCapital+movements.reduce((s,m)=>s+m.amount,0);
 for(const p of await tx.researchPosition.findMany({where:{archivedAt:null},include:{events:true}})){const plan=planSchema.parse(p.plan);if(plan.accountId!==a.id||plan.mode!==spec.mode)continue;const r=ledger(plan,p.events.map(e=>eventSchema.parse({...e,occurredAt:e.occurredAt.toISOString()})));if(r.net==null&&v.amount<0)throw new Error('Solde incomplet : renseigne frais et conversions avant ce retrait');balance+=r.net??0;}
 if(balance+v.amount<0)throw new Error('Retrait supérieur au solde du journal');return tx.accountMovement.create({data:{...v,occurredAt:new Date(v.occurredAt)}});
 });return NextResponse.json({success:true,id:result.id});
}catch(e){return NextResponse.json({error:e instanceof Error&&!e.message.includes('Prisma')?e.message:'Mouvement non enregistré'},{status:400});}}
