import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseFills } from "@/lib/research/import";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireSession();
    return NextResponse.json(
      await prisma.importedFill.findMany({
        orderBy: { importedAt: "desc" },
        take: 5000,
      }),
    );
  } catch {
    return NextResponse.json(
      { error: "Importations indisponibles" },
      { status: 503 },
    );
  }
}
export async function POST(req: Request) {
  try {
    await requireSession();
    const body = await req.json();
    if (body.action === "match") {
      if (typeof body.id !== "string" || typeof body.positionId !== "string")
        throw new Error("Identifiants invalides");
      const p = await prisma.researchPosition.findUniqueOrThrow({
        where: { id: body.positionId },
      });
      const f = await prisma.importedFill.findUniqueOrThrow({
        where: { id: body.id },
      });
      if (p.mode !== "REAL" || p.asset !== (f.data as { coin: string }).coin)
        throw new Error(
          "Le rapprochement exige une position réelle du même actif",
        );
      if (f.matchedPositionId && f.matchedPositionId !== p.id)
        throw new Error("Cette exécution est déjà rapprochée");
      await prisma.importedFill.update({
        where: { id: f.id },
        data: { matchedPositionId: p.id, matchedAt: new Date() },
      });
      return NextResponse.json({ success: true });
    }
    const rows = parseFills(String(body.csv ?? ""), String(body.account ?? ""));
    const known = await prisma.importedFill.findMany({
      where: { sourceKey: { in: rows.map((r) => r.sourceKey) } },
      select: { sourceKey: true },
    });
    const ids = new Set(known.map((r) => r.sourceKey));
    const fresh = rows.filter((r) => !ids.has(r.sourceKey));
    if (body.action === "preview")
      return NextResponse.json({
        rows: rows.slice(0, 20),
        total: rows.length,
        newCount: fresh.length,
        duplicates: known.length,
      });
    if (body.action !== "commit") throw new Error("Action inconnue");
    const r = await prisma.importedFill.createMany({
      data: fresh,
      skipDuplicates: true,
    });
    return NextResponse.json({
      success: true,
      imported: r.count,
      duplicates: rows.length - r.count,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import impossible" },
      { status: 400 },
    );
  }
}
