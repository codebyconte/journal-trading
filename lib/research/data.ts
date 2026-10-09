import { assessmentSchema } from "./learning";
import { prisma } from "@/lib/db";
import { planSchema, eventSchema, docContentSchema } from "./schema";
import { ledger } from "./finance";
import { readWithConnectionRetry } from "./retry";
export function workspace() { return readWithConnectionRetry(loadWorkspace); }
async function loadWorkspace() {
  const [
    positions,
    documents,
    legacy,
    settings,
    adjustments,
    journal,
    assessments,
    movements,
  ] = await Promise.all([
    prisma.researchPosition.findMany({
      include: {
        events: { orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }] },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.researchDocument.findMany({
      include: { revisions: { orderBy: { version: "desc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trade.findMany({ orderBy: { datetime: "desc" } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.capitalAdjustment.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.journalEntry.findMany({ orderBy: { date: "desc" } }),
    prisma.decisionAssessment.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.accountMovement.findMany({orderBy:{occurredAt:"asc"}}),
  ]);
  return {
    movements: movements.map(m=>({...m,occurredAt:m.occurredAt.toISOString(),createdAt:m.createdAt.toISOString()})),
    assessments: assessments.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      data: assessmentSchema.parse(a.data),
    })),
    positions: positions.map((p) => {
      const plan = planSchema.parse(p.plan);
      const events = p.events.map((e) => ({
        ...eventSchema.parse({ ...e, occurredAt: e.occurredAt.toISOString() }),
        id: e.id,
        createdAt: e.createdAt.toISOString(),
      }));
      return {
        id: p.id,
        archivedAt:p.archivedAt?.toISOString()??null,
        plan,
        events,
        result: ledger(plan, events),
        createdAt: p.createdAt.toISOString(),
      };
    }),
    documents: documents.map((d) => ({
      id: d.id,
      archivedAt:d.archivedAt?.toISOString()??null,
      kind: d.kind,
      createdAt: d.createdAt.toISOString(),
      revisions: d.revisions.map((r) => ({
        id: r.id,
        version: r.version,
        createdAt: r.createdAt.toISOString(),
        content: docContentSchema.parse(r.content),
      })),
    })),
    legacy: legacy.map((t) => ({
      ...t,
      datetime: t.datetime.toISOString(),
      closedAt: t.closedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      openedAt: t.openedAt?.toISOString() ?? null,
    })),
    settings: settings ?? {
      initialCapital: 0,
      currentCapital: 0,
      riskPercent: 1,
      currency: "USD",
    },
    adjustments: adjustments.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
    journal: journal.map((j) => ({
      ...j,
      date: j.date.toISOString(),
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.updatedAt.toISOString(),
    })),
  };
}
export type Workspace = Awaited<ReturnType<typeof workspace>>;
