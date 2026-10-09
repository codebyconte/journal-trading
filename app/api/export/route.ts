import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { readFile } from "fs/promises";
import { workspace } from "@/lib/research/data";
import { observations } from "@/lib/research/metrics";
export const dynamic = "force-dynamic";
function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return `"${s.replaceAll('"', '""')}"`;
}
export async function GET(req: Request) {
  try {
    await requireSession();
    const format = new URL(req.url).searchParams.get("format");
    let body: string, type: string, name: string;
    if (format === "archive") {
      body =
        "ARCHIVE V0 — CONTENU HISTORIQUE NON VÉRIFIÉ, NON APPLICABLE COMME PROTOCOLE ACTUEL\n\n" +
        (await readFile("archive/protocol-v0.tsx.txt", "utf8"));
      type = "text/plain";
      name = "protocole-v0-non-verifie.txt";
    } else if (format === "csv") {
      const rows = observations(await workspace());
      const columns = [
        "id",
        "asset",
        "mode",
        "accountId","instrument","assetClass","currency",
        "date",
        "direction",
        "setup",
        "version",
        "regime",
        "net",
        "r",
        "costs",
      ];
      body =
        "\uFEFF" +
        [
          columns.join(","),
          ...rows.map((r) =>
            columns.map((k) => csvCell(r[k as keyof typeof r])).join(","),
          ),
        ].join("\r\n");
      type = "text/csv";
      name = "tradinglog-resultats.csv";
    } else {
      const [
        trades,
        journal,
        settings,
        adjustments,
        positions,
        events,
        documents,
        revisions,
        imports,
        assessments,
        movements,
      ] = await prisma.$transaction(
        [
          prisma.trade.findMany(),
          prisma.journalEntry.findMany(),
          prisma.settings.findMany(),
          prisma.capitalAdjustment.findMany(),
          prisma.researchPosition.findMany(),
          prisma.positionEvent.findMany(),
          prisma.researchDocument.findMany(),
          prisma.researchRevision.findMany(),
          prisma.importedFill.findMany(),
          prisma.decisionAssessment.findMany(),
          prisma.accountMovement.findMany(),
        ],
        { isolationLevel: "RepeatableRead" },
      );
      body = JSON.stringify(
        {
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          trades,
          journal,
          settings,
          adjustments,
          positions,
          events,
          documents,
          revisions,
          imports,
          movements,
          assessments,
        },
        null,
        2,
      );
      type = "application/json";
      name = "tradinglog-sauvegarde.json";
    }
    return new NextResponse(body, {
      headers: {
        "Content-Type": `${type}; charset=utf-8`,
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Export impossible : vérifie la connexion et ta session." },
      { status: 503 },
    );
  }
}
