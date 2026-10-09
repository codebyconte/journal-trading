import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { readdir, readFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
const root = process.cwd(),
  dir =
    process.env.JOURNAL_LOCAL_DIR || path.join(root, "work", "local-database");
await mkdir(dir, { recursive: true });
const db = await PGlite.create(dir);
await db.exec(
  "CREATE TABLE IF NOT EXISTS _local_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())",
);
const fresh =
  (await db.query("SELECT name FROM _local_migrations LIMIT 1")).rows.length ===
  0;
for (const name of (await readdir("prisma/migrations"))
  .filter((n) => /^\d/.test(n))
  .sort()) {
  const done = await db.query(
    "SELECT name FROM _local_migrations WHERE name=$1",
    [name],
  );
  if (done.rows.length) continue;
  const sql = await readFile(
    path.join("prisma/migrations", name, "migration.sql"),
    "utf8",
  );
  await db.transaction(async (tx) => {
    await tx.exec(sql);
    await tx.query("INSERT INTO _local_migrations (name) VALUES ($1)", [name]);
  });
  console.log(`Migration locale appliquée : ${name}`);
}
if (fresh)
  await db.exec('UPDATE "Settings" SET "initialCapital"=0, "currentCapital"=0');
const port = Number(process.env.JOURNAL_DB_PORT || 55439);
const server = new PGLiteSocketServer({ db, host: "127.0.0.1", port });
await server.start();
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    process.env.PORT || "3100",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_JOURNAL_TEST:
        process.env.JOURNAL_TEST_DATA === "true" ? "true" : "false",
      JOURNAL_BUILD_DIR: `.next-dev-${process.env.PORT || "3100"}`,
      WATCHPACK_POLLING: "true",
      DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${port}/postgres?connection_limit=1&pgbouncer=true&statement_cache_size=0`,
      LOCAL_ONLY: process.env.JOURNAL_PASSWORD ? "false" : "true",
    },
  },
);
async function stop() {
  child.kill("SIGTERM");
  await server.stop();
  await new Promise(r=>setTimeout(r,100));
  await db.close();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", stop);
