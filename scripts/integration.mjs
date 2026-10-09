import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3101";
async function post(path, body, status = 200) {
  const r = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  assert.equal(r.status, status, JSON.stringify(data));
  return data;
}
const w = await (await fetch(base + "/api/workspace")).json();
assert.ok(w.positions, "workspace ready");
assert.equal(
  w.positions.length,
  0,
  "Use a fresh disposable integration database",
);
await post("/api/account", { action: "initialize", amount: 10000, note: "" });
const doc = await post("/api/workspace", {
  action: "document",
  document: {
    kind: "STRATEGY",
    content: {
      title: "Test EMA / fixture",
      status: "HYPOTHESIS",
      testProtocol: "Test indépendant",
      body: "Fixture de validation",
    },
  },
});
let d = await (await fetch(base + "/api/workspace")).json();
const version = d.documents.find((v) => v.id === doc.id).revisions[0];
await post("/api/workspace", {
  action: "document",
  document: {
    id: doc.id,
    expectedVersion: 1,
    kind: "STRATEGY",
    content: { ...version.content, title: "Test EMA v2", status: "TESTING" },
  },
});
await post(
  "/api/workspace",
  {
    action: "document",
    document: {
      id: doc.id,
      expectedVersion: 1,
      kind: "STRATEGY",
      content: version.content,
    },
  },
  400,
);
const plan = {
  asset: "BTC",
  mode: "REAL",
  instrument: "PERP",
  direction: "LONG",
  datetime: "2026-01-01T00:00:00.000Z",
  timezone: "UTC",
  entry: 100,
  stop: 90,
  quantity: 2,
  capital: 10000,
  initialRisk: 20,initialFee:0,
  strategyRevisionId: version.id,
};
const requestId = randomUUID(),
  p = await post("/api/workspace", { action: "position", requestId, plan });
const duplicate = await post("/api/workspace", {
  action: "position",
  requestId,
  plan,
});
assert.equal(p.id, duplicate.id);
const event = (type, payload, day) => ({
  action: "event",
  event: {
    positionId: p.id,
    requestId: randomUUID(),
    type,
    payload,
    occurredAt: `2026-01-0${day}T00:00:00.000Z`,
  },
});
await post(
  "/api/workspace",
  event("EXIT", { price: 110, quantity: 3 }, 2),
  400,
);
const partial = event("EXIT", { price: 110, quantity: 1, fee: 1 }, 2);
await post("/api/workspace", partial);
await post("/api/workspace", partial);
await post(
  "/api/workspace",
  event("EXIT", { price: 120, quantity: 1, fee: 1 }, 3),
);
await post("/api/workspace", event("COST", { amount: 2 }, 4));
await post("/api/account", {
  action: "cashflow",
  amount: 500,
  note: "Dépôt test",
});
d = await (await fetch(base + "/api/workspace")).json();
assert.equal(d.positions.length, 1);
assert.equal(d.positions[0].result.net, 26);
assert.equal(d.positions[0].result.r, 1.3);
assert.equal(d.positions[0].events.length, 4);
assert.equal(d.documents[0].revisions.length, 2);
const csv =
  "tid,coin,time,px,sz,fee,feeToken,dir,closedPnl\n123,BTC,1700000000000,100,2,1,USDC,Open Long,0";
const check = await post("/api/import", {
  action: "preview",
  csv,
  account: "fixture",
});
assert.equal(check.newCount, 1);
const imported = await post("/api/import", {
  action: "commit",
  csv,
  account: "fixture",
});
assert.equal(imported.imported, 1);
assert.equal(
  (await post("/api/import", { action: "commit", csv, account: "fixture" }))
    .duplicates,
  1,
);
const fills = await (await fetch(base + "/api/import")).json();
await post("/api/import", {
  action: "match",
  id: fills[0].id,
  positionId: p.id,
});
const backup = await (await fetch(base + "/api/export?format=json")).json();
assert.equal(backup.events.length, 4);
assert.equal(backup.imports.length, 1);
const csrf = await fetch(base + "/api/workspace", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://attacker.invalid",
  },
  body: "{}",
});
assert.equal(csrf.status, 403);
console.log(
  "PASS: migration, persistence, version conflict, idempotency, partial exits, costs, cashflow, CSV deduplication, reconciliation, complete export, CSRF",
);
