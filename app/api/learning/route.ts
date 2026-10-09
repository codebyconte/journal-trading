import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { assessmentSchema } from "@/lib/research/learning";
import { planSchema, docContentSchema } from "@/lib/research/schema";
export async function POST(req: Request) {
  try {
    await requireSession();
    const data = assessmentSchema.parse(await req.json());
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.decisionAssessment.findUnique({
        where: { requestId: data.requestId },
      });
      if (existing) return existing;
      let snapshot: Prisma.InputJsonValue,
        timing = "BEFORE_RECORDED_OUTCOME";
      if (data.subjectType === "POSITION") {
        await tx.$queryRaw`SELECT id FROM "ResearchPosition" WHERE id = ${data.subjectId} FOR UPDATE`;
        const position = await tx.researchPosition.findUniqueOrThrow({
          where: { id: data.subjectId },
          include: {
            events: { orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }] },
          },
        });
        const plan = planSchema.parse(position.plan);
        snapshot = {
          label: `${plan.asset} · ${plan.direction}`,
          mode: plan.mode,
          plan: plan as unknown as Prisma.InputJsonValue,
          changes: position.events
            .filter((e) => ["ENTRY", "STOP"].includes(e.type) || (e.type === "CORRECTION" && position.events.some(original => original.id === (e.payload as { corrects?: string }).corrects && ["ENTRY", "STOP"].includes(original.type))))
            .map((e) => ({
              type: e.type,
              occurredAt: e.occurredAt.toISOString(),
              payload: e.payload,
            })),
        };
        if (
          position.events.some((e) =>
            ["EXIT", "MARK", "REVIEW"].includes(e.type),
          )
        )
          timing = "RETROSPECTIVE";
        if (data.revisionId)
          throw new Error(
            "Une position conserve son plan initial ; aucun identifiant de document attendu.",
          );
      } else {
        await tx.$queryRaw`SELECT id FROM "ResearchDocument" WHERE id = ${data.subjectId} FOR UPDATE`;
        const document = await tx.researchDocument.findUniqueOrThrow({
          where: { id: data.subjectId },
        });
        if (!["MARKET", "WATCH", "REVIEW"].includes(document.kind))
          throw new Error("Choisis une analyse, une opportunité ou une revue.");
        const revision = await tx.researchRevision.findFirstOrThrow({
          where: { id: data.revisionId, documentId: document.id },
          orderBy: { version: "desc" },
        });
        const content = docContentSchema.parse(revision.content);
        if (!data.revisionId)
          throw new Error("La version évaluée doit être précisée.");
        const later = await tx.researchRevision.findMany({
          where: { documentId: document.id },
        });
        if (
          later.some((r) => {
            const c = docContentSchema.parse(r.content);
            return (
              c.evidence.trim() ||
              ["TRIGGERED", "INVALIDATED", "EXPIRED", "MISSED"].includes(
                c.status,
              )
            );
          })
        )
          timing = "RETROSPECTIVE";
        snapshot = {
          label: content.title,
          kind: document.kind,
          version: revision.version,
          recordedAt: revision.createdAt.toISOString(),
          body: content.body,
          bullish: content.bullish,
          bearish: content.bearish,
          invalidation: content.invalidation,
          sources: content.sources,
        };
      }
      if (data.cycleRevisionId) {
        const cycle = await tx.researchRevision.findFirstOrThrow({
          where: { id: data.cycleRevisionId, document: { kind: "LEARNING" } },
        });
        const c = docContentSchema.parse(cycle.content);
        if (c.skill !== data.skill || !data.cycleCriterion)
          throw new Error(
            "Le critère évalué doit correspondre à la compétence du plan.",
          );
        snapshot = {
          ...(snapshot as Prisma.InputJsonObject),
          cycle: {
            revisionId: cycle.id,
            criterion: c.criterion,
            title: c.title,
          },
        };
      } else if (data.cycleCriterion)
        throw new Error("Sélectionne le plan correspondant au critère.");
      if (data.knownOutcome) timing = "RETROSPECTIVE";
      if (data.supersedesId) {
        const old = await tx.decisionAssessment.findUniqueOrThrow({
          where: { id: data.supersedesId },
        });
        const oldData = assessmentSchema.parse(old.data);
        if (
          old.subjectId !== data.subjectId ||
          old.subjectType !== data.subjectType ||
          old.revisionId !== (data.revisionId ?? null) ||
          oldData.skill !== data.skill
        )
          throw new Error(
            "La correction doit porter sur la même décision, version et compétence.",
          );
        if (
          await tx.decisionAssessment.findFirst({
            where: { supersedesId: old.id },
          })
        )
          throw new Error(
            "Cette évaluation a déjà été corrigée. Recharge son historique.",
          );
      }
      return tx.decisionAssessment.create({
        data: {
          requestId: data.requestId,
          subjectType: data.subjectType,
          subjectId: data.subjectId,
          revisionId: data.revisionId,
          supersedesId: data.supersedesId,
          timing,
          snapshot,
          data: data as unknown as Prisma.InputJsonValue,
        },
      });
    });
    return NextResponse.json({ success: true, id: result.id });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error && !e.message.includes("Prisma")
            ? e.message
            : "Évaluation non enregistrée. Vérifie la source et recharge les données.",
      },
      { status: 400 },
    );
  }
}
