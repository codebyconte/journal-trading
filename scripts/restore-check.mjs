import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const db = await PGlite.create();
for (const m of (await readdir("prisma/migrations"))
  .filter((n) => /^\d/.test(n))
  .sort())
  await db.exec(await readFile(`prisma/migrations/${m}/migration.sql`, "utf8"));
await mkdir("work", { recursive: true });
const backup = await (
  await fetch((process.env.TEST_BASE_URL||"http://127.0.0.1:3101")+"/api/export?format=json")
).json();
await writeFile("work/restore-fixture.json", JSON.stringify(backup));
const server = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 55441 });
await server.start();
function run() {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [
        "scripts/restore.mjs",
        "work/restore-fixture.json",
        "--empty-database-only",
      ],
      {
        env: {
          ...process.env,
          DATABASE_URL:
            "postgresql://postgres:postgres@127.0.0.1:55441/postgres?connection_limit=1&pgbouncer=true&statement_cache_size=0",
        },
        stdio: "pipe",
      },
    );
    child.on("exit", (code) => resolve(code));
  });
}
try {
  assert.equal(await run(), 0);
  assert.equal(
    (await db.query('SELECT count(*)::int AS n FROM "PositionEvent"')).rows[0]
      .n,
    backup.events.length,
  );
  assert.equal((await db.query('SELECT count(*)::int AS n FROM "DecisionAssessment"')).rows[0].n,backup.assessments.length);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM "AccountMovement"')).rows[0].n,backup.movements.length);
  assert.notEqual(await run(), 0);
  console.log(
    "PASS: full JSON restoration into migrated empty database; overwrite refused.",
  );
} finally {
  await server.stop();
  await db.close();
}
