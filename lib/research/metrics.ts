import type { Workspace } from "./data";
import { ledger, performance } from "./finance";
export type Observation = {
  id: string;
  accountId: string;
  instrument: string;
  assetClass: string;
  currency: string;
  asset: string;
  mode: string;
  direction: string;
  setup: string;
  version: string;
  regime: string;
  timeframe: string;
  volatility: string;
  macro: string;
  funding: string;
  execution: string;
  errorType: string;
  factors: string[];
  date: string;
  net: number;
  r: number | null;
  costs: number | null;
  plannedRR: number | null;
  legacy: boolean;
};
export function observations(w: Workspace): Observation[] {
  return [
    ...w.positions
      .filter((p) => !p.archivedAt && p.result.closed && p.result.netUsd!=null)
      .map((p) => {
        const review = p.events
          .filter((e) => e.type === "REVIEW")
          .at(-1)?.payload;
        return {
          id: p.id,
          accountId:p.plan.accountId??"LEGACY",instrument:p.plan.instrument,assetClass:p.plan.assetClass,currency:"USD",
          asset: p.plan.asset,
          mode: p.plan.mode,
          direction: p.plan.direction,
          setup: p.plan.setup || "Non renseigné",
          version: p.plan.strategyRevisionId || "Sans version",
          regime: p.plan.regime,
          timeframe: p.plan.timeframe,
          volatility: p.plan.volatility || "Non renseignée",
          macro: p.plan.macro || "Non renseigné",
          funding: p.plan.fundingContext || "Non renseigné",
          execution: review?.execution || "UNKNOWN",
          errorType: review?.errorType || "UNKNOWN",
          factors: p.plan.factors,
          date: p.result.closedAt!,
          net: p.result.netUsd!,
          r: p.result.r,
          costs: p.plan.accountToUsd==null?null:(p.result.fees + p.result.funding)*p.plan.accountToUsd,
          plannedRR: p.plan.target && p.plan.stop!=null && p.plan.stop!==p.plan.entry
            ? Math.abs(p.plan.target - p.plan.entry) /
              Math.abs(p.plan.entry - p.plan.stop)
            : null,
          legacy: false,
        };
      }),
    ...w.legacy
      .filter((t) => t.status === "CLOSED" && t.pnl != null)
      .map((t) => ({
        id: t.id,
        accountId:"LEGACY",instrument:"Non documenté",assetClass:"Non documentée",currency:"USD",
        asset: t.asset,
        mode: "LEGACY",
        direction: t.direction,
        setup: t.setup || "Non renseigné",
        version: "Historique v0",
        regime: t.marketCondition || "UNKNOWN",
        timeframe: "Non documenté",
        volatility: "Non renseignée",
        macro: "Non renseigné",
        funding: "Non renseigné",
        execution: "UNKNOWN",
        errorType: "UNKNOWN",
        factors: [],
        date: t.closedAt ?? t.datetime,
        net: t.pnl!,
        r: t.rMultiple,
        costs: null,
        plannedRR: t.plannedRR,
        legacy: true,
      })),
  ].sort((a, b) => a.date.localeCompare(b.date));
}
export function account(w: Workspace) {
  const real = w.positions.filter((p) => !p.archivedAt && p.plan.mode === "REAL" && !p.plan.accountId),
    legacyNet = w.legacy.reduce(
      (s, t) => s + (t.status === "CLOSED" ? (t.pnl ?? 0) : 0),
      0,
    ),
    newNet = real.reduce((s, p) => s + (p.result.netUsd??0), 0);
  const initial = w.settings.initialCapital,
    flows = w.adjustments.reduce((s, a) => s + a.amount, 0);
  const movements = [
    ...w.legacy
      .filter((t) => t.status === "CLOSED" && t.pnl != null)
      .map((t) => ({ date: t.closedAt ?? t.datetime, pnl: t.pnl! })),
    ...real.flatMap((p) => {
      let last = 0;
      return p.events.map((e, i) => {
        const total = ledger(p.plan, p.events.slice(0, i + 1)).netUsd??last;
        const delta = total - last;
        last = total;
        return { date: e.occurredAt, pnl: delta };
      });
    }),
  ].sort((a, b) => a.date.localeCompare(b.date));
  let equity = initial,
    peak = initial,
    maxDD = 0,
    maxDDPct = 0;
  const curve = [
    {
      date: (movements[0]?.date ?? new Date().toISOString()).slice(0, 10),
      equity,
      drawdown: 0,
    },
  ];
  for (const m of movements) {
    equity += m.pnl;
    peak = Math.max(peak, equity);
    const dd = peak - equity,
      ddPct = peak > 0 ? (dd / peak) * 100 : 0;
    maxDD = Math.max(maxDD, dd);
    maxDDPct = Math.max(maxDDPct, ddPct);
    curve.push({ date: m.date.slice(0, 10), equity, drawdown: -ddPct });
  }
  const marks = real.filter((p) => !p.result.closed),
    allMarked = marks.every((p) => p.result.unrealized != null);
  return {
    initial,
    flows,
    realized: legacyNet + newNet,
    capital: initial + flows + legacyNet + newNet,
    declared: w.settings.currentCapital + newNet,
    reconciliation: w.settings.currentCapital - (initial + flows + legacyNet),
    curve,
    maxDD,
    maxDDPct,
    currentDD: peak > 0 ? ((peak - equity) / peak) * 100 : 0,
    unrealized:
      marks.length === 0
        ? 0
        : allMarked
          ? marks.reduce((s, p) => s + p.result.unrealized!, 0)
          : null,
    openRisk:
      real.reduce((s, p) => s + (p.result.openRisk??0), 0) +
      w.legacy
        .filter((t) => ["OPEN", "PENDING"].includes(t.status))
        .reduce((s, t) => s + t.riskAmount, 0),
    unknownRisk: marks.filter(p=>p.result.openRisk==null).length,
    unknownPnl: real.filter(p=>p.result.netUsd==null).length,
    open: marks.length,
  };
}
export { performance };
