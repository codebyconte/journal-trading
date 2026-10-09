import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { z } from "zod";
export async function POST(req: Request) {
  try {
    await requireSession();
    const input = z
      .object({
        action: z.enum(["initialize", "cashflow"]),
        amount: z.number().finite().min(-1e12).max(1e12),
        note: z.string().max(1000).default(""),
      })
      .parse(await req.json());
    if (input.amount === 0) throw new Error("Montant non nul requis");
    await prisma.$transaction(async (tx) => {
      await tx.settings.upsert({
        where: { id: "singleton" },
        create: { id: "singleton", initialCapital: 0, currentCapital: 0 },
        update: {},
      });
      await tx.$queryRaw`SELECT id FROM "Settings" WHERE id = 'singleton' FOR UPDATE`;
      const s = await tx.settings.findUniqueOrThrow({
        where: { id: "singleton" },
      });
      if (input.action === "initialize") {
        const n =
          (await tx.trade.count()) +
          (await tx.researchPosition.count()) +
          (await tx.capitalAdjustment.count());
        if (n || input.amount <= 0)
          throw new Error(
            "Initialisation réservée à un journal vide. Utilise un mouvement de fonds pour la suite.",
          );
        await tx.settings.update({
          where: { id: s.id },
          data: { initialCapital: input.amount, currentCapital: input.amount },
        });
      } else {
        const realAll = await tx.researchPosition.findMany({
          where: { mode: "REAL" },
          include: { events: true },
        });
        const { ledger } = await import("@/lib/research/finance");
        const { planSchema, eventSchema } =
          await import("@/lib/research/schema");
        const real=realAll.filter(p=>!planSchema.parse(p.plan).accountId&&!p.archivedAt);
        if (input.amount < 0 && real.some(p => ledger(planSchema.parse(p.plan), p.events.map(e => eventSchema.parse({...e, occurredAt: e.occurredAt.toISOString()}))).netUsd == null)) throw new Error("Solde incomplet : renseigne les coûts et conversions avant un retrait.");
        const pnl = real.reduce(
          (total, p) =>
            total +
            (ledger(
              planSchema.parse(p.plan),
              p.events.map((e) =>
                eventSchema.parse({
                  ...e,
                  occurredAt: e.occurredAt.toISOString(),
                }),
              ),
            ).netUsd??0),
          0,
        );
        if (s.currentCapital + pnl + input.amount < 0)
          throw new Error("Retrait supérieur au solde du journal");
        await tx.settings.update({
          where: { id: s.id },
          data: { currentCapital: { increment: input.amount } },
        });
        await tx.capitalAdjustment.create({
          data: {
            amount: input.amount,
            note: input.note,
            balanceAfter: s.currentCapital + pnl + input.amount,
          },
        });
      }
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur de compte" },
      { status: 400 },
    );
  }
}
