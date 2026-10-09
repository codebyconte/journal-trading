import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
const file = process.argv[2];
if (!file || !process.argv.includes("--empty-database-only"))
  throw new Error(
    "Usage : node scripts/restore.mjs sauvegarde.json --empty-database-only. Définis DATABASE_URL vers une base vide migrée.",
  );
const b = JSON.parse(await readFile(file, "utf8"));
if (b.schemaVersion !== 1) throw new Error("Version de sauvegarde inconnue");
const tables = [
  ["settings", "settings"],
  ["trades", "trade"],
  ["journal", "journalEntry"],
  ["adjustments", "capitalAdjustment"],
  ["positions", "researchPosition"],
  ["documents", "researchDocument"],
  ["events", "positionEvent"],
  ["revisions", "researchRevision"],
  ["imports", "importedFill"],
  ["assessments", "decisionAssessment"],
  ["movements","accountMovement"],
];
if(!b.movements)b.movements=[];
if (!b.assessments) b.assessments = []; // backward compatibility with pre-learning v1 backups
for (const [key] of tables)
  if (!Array.isArray(b[key])) throw new Error(`Table manquante : ${key}`);
const db = new PrismaClient();
try {
  await db.$transaction(
    async (tx) => {
      for (const [, model] of tables)
        if (model !== "settings" && (await tx[model].count()))
          throw new Error(`Base non vide : ${model}. Restauration refusée.`);
      const defaults = await tx.settings.findMany();
      if (
        defaults.some(
          (s) =>
            s.id !== "singleton" ||
            ![0, 100000].includes(s.initialCapital) ||
            s.currentCapital !== s.initialCapital ||
            s.riskPercent !== 1 ||
            s.currency !== "USD",
        )
      )
        throw new Error("Paramètres personnalisés : restauration refusée.");
      await tx.settings.deleteMany();
      for (const [key, model] of tables)
        if (b[key].length) await tx[model].createMany({ data: b[key] });
    },
    { timeout: 60000 },
  );
  console.log("Restauration complète terminée sans écrasement.");
} finally {
  await db.$disconnect();
}
