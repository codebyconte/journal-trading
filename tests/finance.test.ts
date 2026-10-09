import { test } from "node:test";
import assert from "node:assert/strict";
import { ledger, performance, sizePosition } from "../lib/research/finance";
import {
  planSchema,
  documentSchema,
  eventSchema,
} from "../lib/research/schema";
const plan = planSchema.parse({
  asset: "BTC",
  mode: "PAPER",
  instrument: "PERP",
  direction: "LONG",
  datetime: "2026-01-01T00:00:00.000Z",
  timezone: "UTC",
  entry: 100,
  stop: 90,
  quantity: 2,
  capital: 1000,
  initialRisk: 20,
});
const event = (
  type: "ENTRY" | "EXIT" | "COST" | "STOP",
  payload: Record<string, unknown>,
  day = 1,
) =>
  eventSchema.parse({
    requestId: "00000000-0000-4000-8000-000000000001",
    positionId: "test",
    type,
    occurredAt: `2026-01-${String(day).padStart(2, "0")}T00:00:00.000Z`,
    payload,
  });
test("partial exits and scale-ins use weighted average and preserve initial risk", () => {
  const r = ledger(plan, [
    event("ENTRY", { price: 100, quantity: 2, fee: 1 }),
    event("EXIT", { price: 110, quantity: 1, fee: 1 }, 2),
    event("ENTRY", { price: 120, quantity: 1, fee: 1 }, 3),
    event("EXIT", { price: 130, quantity: 2, fee: 2 }, 4),
    event("COST", { amount: -2 }, 5),
  ]);
  assert.equal(r.gross, 50);
  assert.equal(r.net, 47);
  assert.equal(r.r, 2.35);
  assert.equal(r.quantity, 0);
  assert.equal(r.closed, true);
});
test("shorts reverse price PnL and include FX contract multiplier", () => {
  const p = {
    ...plan,
    direction: "SHORT" as const,
    multiplier: 100000,
    quoteToAccount: 1.1,
    entry: 1.2,
    stop: 1.3,
  };
  const r = ledger(p, [
    event("ENTRY", { price: 1.2, quantity: 1 }),
    event("EXIT", { price: 1.1, quantity: 1 }, 2),
  ]);
  assert.equal(r.net, 11000);
});
test("cannot exit more than held or reopen a closed trade", () => {
  assert.throws(() =>
    ledger(plan, [
      event("ENTRY", { price: 100, quantity: 1 }),
      event("EXIT", { price: 110, quantity: 2 }, 2),
    ]),
  );
  assert.throws(() =>
    ledger(plan, [
      event("ENTRY", { price: 100, quantity: 1 }),
      event("EXIT", { price: 110, quantity: 1 }, 2),
      event("ENTRY", { price: 100, quantity: 1 }, 3),
    ]),
  );
});
test("stop changes affect exposure, not initial R denominator", () => {
  const r = ledger(plan, [
    event("ENTRY", { price: 100, quantity: 2 }),
    event("STOP", { price: 95 }, 2),
  ]);
  assert.equal(r.openRisk, 10);
  assert.equal(r.r, 0);
});
test("cost-aware sizing rounds down and leverage only changes margin", () => {
  const p = {
    capital: 10000,
    riskPercent: 1,
    entry: 100,
    stop: 90,
    multiplier: 1,
    conversion: 1,
    leverage: 2,
    feeBps: 10,
    slippageBps: 5,
    fundingBps: 2,
    quantityStep: 0.01,
  };
  const a = sizePosition(p),
    b = sizePosition({ ...p, leverage: 5 });
  assert.ok(a.risk <= 100);
  assert.equal(a.quantity, b.quantity);
  assert.equal(a.notional, b.notional);
  assert.equal(a.margin, b.margin * 2.5);
  assert.ok(a.costs > 0);
});
test("invalid or unbounded sizing is rejected", () => {
  assert.throws(() =>
    sizePosition({
      capital: 100,
      riskPercent: 1,
      entry: 10,
      stop: 10,
      multiplier: 1,
      conversion: 1,
      leverage: 1,
      feeBps: 0,
      slippageBps: 0,
      fundingBps: 0,
      quantityStep: 0.01,
    }),
  );
});
test("breakevens do not inflate loss probability; missing R is excluded", () => {
  const s = performance([
    { net: 100, r: 1 },
    { net: -50, r: -0.5 },
    { net: 0, r: null },
  ]);
  assert.equal(s.expectancy, 50 / 3);
  assert.equal(s.meanR, 0.25);
  assert.equal(s.rCount, 2);
  assert.equal(s.profitFactor, 2);
  assert.equal(s.medianR, 0.25);
});
test("no observations are unavailable, not a false zero edge", () => {
  const s = performance([]);
  assert.equal(s.meanR, null);
  assert.equal(s.profitFactor, null);
  assert.equal(s.winRate, null);
  assert.equal(s.winInterval, null);
});
test("all winners have unbounded PF and uncertain win rate", () => {
  const s = performance([{ net: 1, r: 1 }]);
  assert.equal(s.profitFactor, Infinity);
  assert.ok(s.winInterval![0] < 30);
  assert.ok(s.winInterval![1] <= 100.00001);
});
test("supported hypothesis needs evidence and test protocol", () => {
  assert.throws(() =>
    documentSchema.parse({
      kind: "STRATEGY",
      content: { title: "test", status: "SUPPORTED" },
    }),
  );
});
test("spot cannot silently use crypto derivative leverage or short", () => {
  assert.throws(() =>
    planSchema.parse({ ...plan, instrument: "SPOT", leverage: 2 }),
  );
  assert.throws(() =>
    planSchema.parse({
      ...plan,
      instrument: "SPOT",
      direction: "SHORT",
      stop: 110,
    }),
  );
});
import { parseFills } from "../lib/research/import";
test("import preserves IDs and costs without treating fills as trades", () => {
  const csv =
    "tid,coin,time,px,sz,fee,feeToken,dir,closedPnl\n123,BTC,1700000000000,42000,0.1,0.5,USDC,Open Long,0";
  const a = parseFills(csv, "Main");
  assert.equal(a[0].sourceKey, "hyperliquid:main:123");
  assert.equal(a[0].data.fee, "0.5");
  assert.throws(() =>
    parseFills(
      csv + "\n123,BTC,1700000000000,42000,0.1,0.5,USDC,Open Long,0",
      "Main",
    ),
  );
});
test("CSV supports quoted values and rejects ambiguous dates", () => {
  const h = "tid,coin,time,px,sz,fee,feeToken,dir,closedPnl\n";
  assert.equal(
    parseFills(
      h + '123,BTC,2024-01-01T00:00:00Z,10,1,0,USD,"Open, Long",0',
      "a",
    )[0].data.dir,
    "Open, Long",
  );
  assert.throws(() =>
    parseFills(h + "123,BTC,2024-01-01T00:00:00,10,1,0,USD,Open Long,0", "a"),
  );
});
