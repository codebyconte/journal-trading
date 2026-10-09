import { resolveReferences } from "@/lib/research/reference-resolution";
import Decimal from "decimal.js";
import { SKILLS } from "@/lib/research/learning";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { workspace } from "@/lib/research/data";
import { planSchema, eventSchema, documentSchema, docContentSchema } from "@/lib/research/schema";
import { ledger } from "@/lib/research/finance";
import { revalidateTradingPaths } from "@/lib/revalidate";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireSession();
    return NextResponse.json(await workspace());
  } catch {
    return NextResponse.json(
      {
        error: "Données indisponibles. Vérifie la connexion et les migrations.",
      },
      { status: 503 },
    );
  }
}
export async function POST(req: Request) {
  try {
    await requireSession();
    if (Number(req.headers.get("content-length") ?? 0) > 500000)
      return NextResponse.json(
        { error: "Requête trop volumineuse" },
        { status: 413 },
      );
    const body = await req.json();
    let result;
    if (body.action === "position") {
      const p = planSchema.parse(body.plan);
      if (p.datetime > new Date().toISOString())
        throw new Error(
          "Une exécution ne peut pas être datée dans le futur. Utilise la watchlist.",
        );
      const requestId = String(body.requestId ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(requestId))
        throw new Error("Identifiant de requête manquant");
      const existing = await prisma.positionEvent.findUnique({
        where: { requestId },
      });
      if (existing)
        return NextResponse.json({ success: true, id: existing.positionId });
      if (
        p.strategyRevisionId &&
        !(await prisma.researchRevision.findFirst({
          where: { id: p.strategyRevisionId, document: { kind: "STRATEGY" } },
        }))
      )
        throw new Error("Version de stratégie introuvable");
      if(p.accountId){
        const a=await prisma.researchDocument.findFirstOrThrow({where:{id:p.accountId,kind:'ACCOUNT',archivedAt:null},include:{revisions:{orderBy:{version:'desc'},take:1}}});
        const spec=docContentSchema.parse(a.revisions[0].content).accountSpec!;
        if(spec.currency!==p.accountCurrency)throw new Error('Devise du compte différente du plan');
      }
      if(p.instrumentRevisionId){
        const r=await prisma.researchRevision.findFirstOrThrow({where:{id:p.instrumentRevisionId,document:{kind:'INSTRUMENT'}}});
        const spec=docContentSchema.parse(r.content).instrumentSpec!;
        if(!p.instrumentSpec||JSON.stringify(spec)!==JSON.stringify(p.instrumentSpec))throw new Error('Les spécifications doivent correspondre à la version sélectionnée');
        if(p.quantity<spec.minQuantity||!new Decimal(p.quantity).div(spec.quantityStep).isInteger())throw new Error('Quantité incompatible avec le minimum ou le pas du contrat');
        if(p.asset!==spec.symbol||p.instrument!==spec.type||p.multiplier!==spec.multiplier||p.quoteCurrency!==spec.quoteCurrency)throw new Error('Les champs financiers ne correspondent pas au contrat sélectionné');
      }
      if(p.accountCurrency!=='USD' && p.accountToUsd!=null && (!p.fxSource||!p.fxObservedAt))throw new Error('Conversion globale : source et date requises');
      p.researchRefs=await resolveReferences(prisma,p.researchRefs) as typeof p.researchRefs;
      result = await prisma.researchPosition.create({
        data: {
          asset: p.asset,
          mode: p.mode,
          plan: p as unknown as Prisma.InputJsonValue,
          events: {
            create: {
              requestId,
              type: "ENTRY",
              occurredAt: new Date(p.datetime),
              payload: {
                price: p.entry,
                quantity: p.quantity,
                fee: p.initialFee,
                text: "Entrée initiale — frais dans la devise du compte",
              },
            },
          },
        },
      });
    } else if (body.action === "event") {
      const e = eventSchema.parse(body.event);
      if (e.occurredAt > new Date().toISOString())
        throw new Error("Date future interdite");
      result = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "ResearchPosition" WHERE id = ${e.positionId} FOR UPDATE`;
        if (
          await tx.positionEvent.findUnique({
            where: { requestId: e.requestId },
          })
        )
          return { id: e.positionId };
        const p = await tx.researchPosition.findUniqueOrThrow({
          where: { id: e.positionId },
          include: {
            events: { orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }] },
          },
        });
        const events = p.events.map((x) =>
          eventSchema.parse({ ...x, occurredAt: x.occurredAt.toISOString() }),
        );
        if(e.type==='CORRECTION'&&!p.events.some(x=>x.id===e.payload.corrects&&x.type!=='CORRECTION'))throw new Error('Événement à corriger introuvable');
        if (e.occurredAt < (events.at(-1)?.occurredAt ?? ""))
          throw new Error(
            "Ajoute les événements dans leur ordre chronologique ; les événements passés restent inchangés.",
          );
        const plan = planSchema.parse(p.plan);
        if(e.payload.conversion!=null && plan.quoteCurrency!==plan.accountCurrency && !e.payload.fxSource)throw new Error('Source de conversion de cet événement requise');
        const computed = ledger(plan, [...events, e]);
        await tx.positionEvent.create({
          data: {
            positionId: e.positionId,
            requestId: e.requestId,
            type: e.type,
            occurredAt: new Date(e.occurredAt),
            payload: e.payload as Prisma.InputJsonValue,
          },
        });
        await tx.researchPosition.update({
          where: { id: e.positionId },
          data: { status: computed.closed ? "CLOSED" : "OPEN" },
        });
        return { id: e.positionId };
      });
    } else if (body.action === "document") {
      const input = documentSchema.parse(body.document);
      input.content.researchRefs=await resolveReferences(prisma,input.content.researchRefs) as typeof input.content.researchRefs;
      if(input.kind==='INSTRUMENT'&&!input.content.instrumentSpec)throw new Error('Spécifications de contrat requises');
      if(input.kind==='ACCOUNT'&&!input.content.accountSpec)throw new Error('Spécifications de compte requises');
      if(input.kind==='RESEARCH'&&!input.content.research)throw new Error('Fiche de recherche requise');
      if(input.kind==='ACCOUNT'&&input.id){
        const old=await prisma.researchDocument.findUniqueOrThrow({where:{id:input.id},include:{revisions:{orderBy:{version:'desc'},take:1}}});
        const prev=docContentSchema.parse(old.revisions[0].content).accountSpec!;
        const ps=await prisma.researchPosition.findMany();
        const used=ps.some(p=>planSchema.parse(p.plan).accountId===input.id)||await prisma.accountMovement.count({where:{accountId:input.id}})>0;
        if(used&&(prev.currency!==input.content.accountSpec!.currency||prev.mode!==input.content.accountSpec!.mode||prev.initialCapital!==input.content.accountSpec!.initialCapital))throw new Error('Compte utilisé : devise, environnement et capital initial figés. Utilise un mouvement ou un nouveau compte.');
      }
      if (input.kind === "LEARNING") {
        if (
          !SKILLS.some((s) => s.id === input.content.skill) ||
          !input.content.criterion.trim() ||
          !input.content.action.trim() ||
          !input.content.reviewDate
        )
          throw new Error(
            "Compétence, critère observable, action et date de revue requis.",
          );
        const count = await prisma.decisionAssessment.count({
          where: { id: { in: input.content.evidenceIds } },
        });
        if (count !== new Set(input.content.evidenceIds).size)
          throw new Error("Une preuve référencée est introuvable.");
      }
      result = await prisma.$transaction(async (tx) => {
        if (!input.id)
          return tx.researchDocument.create({
            data: {
              kind: input.kind,
              revisions: { create: { version: 1, content: input.content } },
            },
          });
        await tx.$queryRaw`SELECT id FROM "ResearchDocument" WHERE id = ${input.id} FOR UPDATE`;
        const doc = await tx.researchDocument.findUniqueOrThrow({
          where: { id: input.id },
          include: { revisions: { orderBy: { version: "desc" }, take: 1 } },
        });
        if (
          doc.kind !== input.kind ||
          doc.revisions[0].version !== input.expectedVersion
        )
          throw new Error(
            "Cette fiche a changé. Recharge avant de créer une nouvelle version.",
          );
        return tx.researchRevision.create({
          data: {
            documentId: input.id,
            version: input.expectedVersion + 1,
            content: input.content,
          },
        });
      });
    } else throw new Error("Action inconnue");
    revalidateTradingPaths();
    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Enregistrement impossible";
    return NextResponse.json(
      {
        error: message.includes("Prisma")
          ? "Enregistrement impossible. Vérifie la connexion et les données."
          : message,
      },
      { status: 400 },
    );
  }
}
