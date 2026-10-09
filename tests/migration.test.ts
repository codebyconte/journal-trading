import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
test("additive migrations preserve legacy journal and trade data", async () => {
  const db = await PGlite.create();
  try {
    const dirs = (await readdir("prisma/migrations"))
      .filter((n) => /^\d/.test(n))
      .sort();
    for (const dir of dirs.filter((n) => n.startsWith("2025")))
      await db.exec(
        await readFile(`prisma/migrations/${dir}/migration.sql`, "utf8"),
      );
    await db.exec(
      `INSERT INTO "JournalEntry" (id,"updatedAt",date,content) VALUES ('sentinel',now(),now(),'Texte privé conservé'); UPDATE "Settings" SET "initialCapital"=10000,"currentCapital"=10000 WHERE id='singleton';`,
    );
    await db.exec(`INSERT INTO "Trade" (id,"updatedAt",datetime,asset,direction,"orderType","entryPrice","stopLoss","takeProfit",units,"riskAmount","riskPercent","plannedRR") VALUES ('legacy-trade',now(),now(),'XAUUSD','SHORT','LIMITE',2000,2010,1970,1,10,1,3)`);
    for (const dir of dirs.filter((n) => n.startsWith("2026")))
      await db.exec(
        await readFile(`prisma/migrations/${dir}/migration.sql`, "utf8"),
      );
    const r = await db.query<{content: string}>('SELECT content FROM "JournalEntry" WHERE id=$1', [
      "sentinel",
    ]);
    assert.equal(r.rows[0].content, "Texte privé conservé");
    const s = await db.query<{initialCapital: number}>('SELECT "initialCapital" FROM "Settings"');
    assert.equal(s.rows[0].initialCapital, 10000);
    assert.equal((await db.query<{asset:string}>('SELECT asset FROM "Trade" WHERE id=$1',["legacy-trade"])).rows[0].asset,"XAUUSD");
    const tables = await db.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'",
    );
    assert.ok(tables.rows.some((r: any) => r.tablename === "PositionEvent"));
  } finally {
    await db.close();
  }
});
