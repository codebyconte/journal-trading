import Decimal from "decimal.js";
import { eventSchema, type Plan, type EventInput } from "./schema";
Decimal.set({ precision: 32, rounding: Decimal.ROUND_HALF_EVEN });
const d = (v: Decimal.Value) => new Decimal(v);
export function sizePosition(p: {
  capital: number;
  riskPercent: number;
  entry: number;
  stop: number;
  multiplier: number;
  conversion: number;
  leverage: number;
  feeBps: number;
  slippageBps: number;
  fundingBps: number;
  quantityStep: number;
  spread?:number;
  commissionPerUnit?:number;
  fixedFees?:number;
}) {
  if (
    !Object.values(p).filter(v=>v!==undefined).every(Number.isFinite) ||
    p.capital <= 0 ||
    p.riskPercent <= 0 ||
    p.riskPercent > 100 ||
    p.entry <= 0 ||
    p.stop <= 0 ||
    p.entry === p.stop ||
    p.multiplier <= 0 ||
    p.conversion <= 0 ||
    p.leverage < 1 ||
    p.feeBps < 0 ||
    p.slippageBps < 0 ||
    p.fundingBps < 0 ||
    p.quantityStep <= 0 || (p.spread??0)<0 || (p.commissionPerUnit??0)<0 || (p.fixedFees??0)<0
  )
    throw new Error("Paramètres du calculateur invalides");
  const budget = d(p.capital).mul(p.riskPercent).div(100);
  const distance = d(p.entry).minus(p.stop).abs();
  const costs = d(p.entry)
    .plus(p.stop)
    .mul(d(p.feeBps).plus(p.slippageBps))
    .div(10000)
    .plus(d(p.entry).mul(p.fundingBps).div(10000));
  const adjustedCosts=costs.plus(p.spread??0);
  const unitRisk = distance.plus(adjustedCosts).mul(p.multiplier).mul(p.conversion).plus(d(p.commissionPerUnit??0).mul(2));
  const available=Decimal.max(0,budget.minus(p.fixedFees??0));
  const quantity = available
    .div(unitRisk)
    .div(p.quantityStep)
    .floor()
    .mul(p.quantityStep);
  const notional = quantity.mul(p.entry).mul(p.multiplier).mul(p.conversion);
  return {
    quantity: quantity.toNumber(),
    risk: quantity.mul(unitRisk).plus(p.fixedFees??0).toNumber(),
    budget: budget.toNumber(),
    notional: notional.toNumber(),
    margin: notional.div(p.leverage).toNumber(),
    costs: quantity.mul(adjustedCosts).mul(p.multiplier).mul(p.conversion).plus(quantity.mul(p.commissionPerUnit??0).mul(2)).plus(p.fixedFees??0).toNumber(),
    distance: distance.toNumber(),
  };
}
export type LedgerEvent = Pick<
  EventInput,
  "type" | "payload" | "occurredAt"
> & { createdAt?: string; id?:string };
export function effectiveEvents(events:LedgerEvent[]) {
 const map=new Map<string,LedgerEvent>();
 for(const e of events.filter(e=>e.type==='CORRECTION').sort((a,b)=>(a.createdAt??a.occurredAt).localeCompare(b.createdAt??b.occurredAt))){
  const original=events.find(x=>x.id===e.payload.corrects&&x.type!=='CORRECTION');
  if(!original)throw new Error('Événement original de correction introuvable');
  const replacement=eventSchema.parse({requestId:'00000000-0000-4000-8000-000000000001',positionId:'correction',...original,payload:{...original.payload,...e.payload.replacement}});
  map.set(e.payload.corrects!,{...original,payload:replacement.payload});
 }
 return events.filter(e=>e.type!=='CORRECTION').map(e=>map.get(e.id??'')??e);
}
export function ledger(plan: Plan, events: LedgerEvent[]) {
  let quantity=d(0), avg=d(0), grossQuote=d(0), gross=d(0), fees=d(0), funding=d(0), entered=d(0);
  let stop: Decimal | null=plan.stop == null ? null : d(plan.stop);
  let converted=true, costsKnown=true;
  let closedAt: string | null=null;
  let mark: {price:number;at:string;source:string;conversion:number|null}|null=null;
  for (const e of effectiveEvents(events).sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt))) {
    const p=e.payload, conversion=p.conversion ?? plan.quoteToAccount;
    if(e.type==='ENTRY') {
      if(entered.gt(0)&&quantity.eq(0)) throw new Error('Position clôturée : crée une nouvelle fiche');
      const q=d(p.quantity!); avg=avg.mul(quantity).plus(d(p.price!).mul(q)).div(quantity.plus(q)); quantity=quantity.plus(q); entered=entered.plus(q);
      if(p.fee===null)costsKnown=false; else fees=fees.plus(p.fee??0);
    }
    if(e.type==='EXIT') {
      const q=d(p.quantity!); if(q.gt(quantity)||q.lte(0))throw new Error('La sortie dépasse la quantité ouverte');
      const quote=d(p.price!).minus(avg).mul(plan.direction==='LONG'?1:-1).mul(q).mul(plan.multiplier);
      grossQuote=grossQuote.plus(quote); if(conversion==null)converted=false; else gross=gross.plus(quote.mul(conversion));
      quantity=quantity.minus(q); if(p.fee===null)costsKnown=false;else fees=fees.plus(p.fee??0); if(quantity.eq(0))closedAt=e.occurredAt;
    }
    if(e.type==='COST'){funding=funding.plus(p.amount??0);if(p.settlesUnknownFees)costsKnown=true;}
    if(e.type==='STOP')stop=d(p.price!);
    if(e.type==='MARK')mark={price:p.price!,at:e.occurredAt,source:p.source??'',conversion};
  }
  const net=converted&&costsKnown?gross.minus(fees).minus(funding).toNumber():null;
  const risk=stop!=null&&plan.quoteToAccount!=null ? Decimal.max(0,avg.minus(stop).mul(plan.direction==='LONG'?1:-1).mul(quantity).mul(plan.multiplier).mul(plan.quoteToAccount)).toNumber():null;
  const unrealized=mark&&quantity.gt(0)&&mark.conversion!=null ? d(mark.price).minus(avg).mul(plan.direction==='LONG'?1:-1).mul(quantity).mul(plan.multiplier).mul(mark.conversion).toNumber():null;
  return {quantity:quantity.toNumber(),averageEntry:avg.toNumber(),grossQuote:grossQuote.toNumber(),gross:converted?gross.toNumber():null,fees:fees.toNumber(),funding:funding.toNumber(),costsKnown,net,r:net!=null&&plan.initialRisk!=null?d(net).div(plan.initialRisk).toNumber():null,openRisk:quantity.eq(0)?0:risk,closed:entered.gt(0)&&quantity.eq(0),closedAt,unrealized,mark,stop:stop?.toNumber()??null,netUsd:net!=null&&plan.accountToUsd!=null?d(net).mul(plan.accountToUsd).toNumber():null};
}
export function performance(rows: { net: number; r: number | null }[]) {
  const n = rows.length,
    wins = rows.filter((t) => t.net > 0),
    losses = rows.filter((t) => t.net < 0);
  const total = rows.reduce((s, t) => s + t.net, 0),
    profit = wins.reduce((s, t) => s + t.net, 0),
    loss = -losses.reduce((s, t) => s + t.net, 0);
  const rs = rows
      .flatMap((t) => (t.r != null && Number.isFinite(t.r) ? [t.r] : []))
      .sort((a, b) => a - b),
    mean = rs.length ? rs.reduce((s, r) => s + r, 0) / rs.length : null;
  const variance =
    rs.length > 1
      ? rs.reduce((s, r) => s + (r - mean!) ** 2, 0) / (rs.length - 1)
      : null;
  // Wilson interval, descriptive binomial model; dependent trades violate assumptions.
  const p = n ? wins.length / n : 0,
    z = 1.96,
    den = 1 + (z * z) / (n || 1),
    center = (p + (z * z) / (2 * (n || 1))) / den,
    half =
      (z *
        Math.sqrt((p * (1 - p)) / (n || 1) + (z * z) / (4 * (n || 1) ** 2))) /
      den;
  const median = rs.length
    ? (rs[Math.floor((rs.length - 1) / 2)] + rs[Math.floor(rs.length / 2)]) / 2
    : null;
  return {
    n,
    total,
    expectancy: n ? total / n : null,
    meanR: mean,
    rCount: rs.length,
    medianR: median,
    sdR: variance == null ? null : Math.sqrt(variance),
    winRate: n ? p * 100 : null,
    winInterval: n ? [(center - half) * 100, (center + half) * 100] : null,
    profitFactor: loss ? profit / loss : profit ? Infinity : null,
    avgWin: wins.length ? profit / wins.length : null,
    avgLoss: losses.length ? loss / losses.length : null,
  };
}
