import { z } from "zod";
import { instrumentSpecSchema, accountSpecSchema, researchSchema } from "./catalog-schema";
const positive = z.coerce.number().finite().positive().max(1e12);
const nonnegative = z.coerce.number().finite().nonnegative().max(1e12);
export const sourceSchema = z.object({
  url: z
    .string()
    .url()
    .max(2000)
    .refine((v) => /^https?:\/\//.test(v)),
  observedAt: z.string().datetime(),
  frequency: z.string().min(1).max(100),
  delay: z.string().min(1).max(100),
  note: z.string().max(2000).default(""),
});
export const planSchema = z
  .object({
    schemaVersion: z.literal(1).default(1),
    asset: z.string().trim().min(1).max(40),
    mode: z.enum(["REAL", "PAPER", "BACKTEST"]),
    instrument: z.enum(["SPOT", "PERP", "FOREX", "CFD", "FUTURE"]),
    direction: z.enum(["LONG", "SHORT"]),
    datetime: z.string().datetime(),
    timezone: z.string().min(1).max(80),
    timeframe: z.string().min(1).max(20).default("4H"),
    entry: positive,
    stop: positive.nullable().optional(),
    target: positive.optional(),
    quantity: positive,
    multiplier: positive.default(1),
    quoteToAccount: positive.nullable().optional(),
    quoteCurrency: z.string().min(3).max(10).default("USD"),
    accountCurrency: z.string().regex(/^[A-Z0-9]{3,10}$/).default("USD"),
    accountId: z.string().optional(),
    instrumentRevisionId: z.string().optional(),
    instrumentSpec: instrumentSpecSchema.optional(),
    assetClass: z.string().max(80).default("Non documentée"),
    broker: z.string().max(150).default(""),
    accountToUsd: positive.nullable().optional(),
    fxObservedAt: z.string().datetime().optional(),
    fxSource: z.string().max(2000).default(""),
    initialFee: nonnegative.nullable().default(null),
    protocolDeviation: z.string().max(5000).default(""),
    missingInformation: z.string().max(5000).default(""),
    researchRefs: z.array(z.object({id:z.string(), revisionId:z.string().optional(), stance:z.enum(["SUPPORT","CONTRADICT","CONTEXT","MISSING"]), note:z.string().max(3000).default(""),snapshot:researchSchema.optional()})).max(30).default([]),
    leverage: positive.max(1000).default(1),
    capital: nonnegative.nullable().optional(),
    initialRisk: positive.nullable().optional(),
    setup: z.string().max(150).default(""),
    strategyRevisionId: z.string().max(100).optional(),
    regime: z.enum(["BULL", "BEAR", "RANGE", "UNKNOWN"]).default("UNKNOWN"),
    dailyContext: z.string().max(5000).default(""),
    thesis: z.string().max(10000).default(""),
    counterEvidence: z.string().max(5000).default(""),
    atr: nonnegative.optional(),
    volatility: z.string().max(100).default(""),
    macro: z.string().max(500).default(""),
    fundingContext: z.string().max(500).default(""),
    factors: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
    sources: z.array(sourceSchema).max(30).default([]),
  })
  .superRefine((p, ctx) => {
    if (
      p.instrument === "SPOT" &&
      (p.direction === "SHORT" || p.leverage !== 1)
    )
      ctx.addIssue({
        code: "custom",
        message: "Spot : long sans levier uniquement",
      });
  }).transform(p=>({...p,quoteToAccount:p.quoteToAccount===undefined?(p.quoteCurrency===p.accountCurrency?1:null):p.quoteToAccount,accountToUsd:p.accountToUsd===undefined?(p.accountCurrency==='USD'?1:null):p.accountToUsd}));
export type Plan = z.infer<typeof planSchema>;
export const eventSchema = z
  .object({
    id:z.string().optional(),
    requestId: z.string().uuid(),
    positionId: z.string().min(1),
    occurredAt: z.string().datetime(),
    type: z.enum(["ENTRY", "EXIT", "COST", "STOP", "NOTE", "REVIEW", "MARK", "CORRECTION"]),
    payload: z.object({
      price: positive.optional(),
      quantity: positive.optional(),
      fee: nonnegative.nullable().default(0),
      conversion: positive.optional(),
      fxObservedAt: z.string().datetime().optional(),
      fxSource: z.string().max(2000).optional(),
      amount: z.coerce.number().finite().min(-1e12).max(1e12).optional(),
      text: z.string().max(20000).default(""),
      execution: z.enum(["RESPECTED", "DEVIATION", "UNKNOWN"]).optional(),
      errorType: z
        .enum(["NONE", "STRATEGY", "EXECUTION", "BEHAVIOR", "UNKNOWN"])
        .optional(),
      source: z.string().max(2000).optional(),
      corrects:z.string().optional(),
      replacement:z.record(z.unknown()).optional(),
      settlesUnknownFees:z.boolean().default(false),
      nextTest: z.string().max(5000).optional(),
    }),
  })
  .superRefine((e, c) => {
    if (
      ["ENTRY", "EXIT"].includes(e.type) &&
      (!e.payload.price || !e.payload.quantity)
    )
      c.addIssue({ code: "custom", message: "Prix et quantité requis" });
    if (["STOP", "MARK"].includes(e.type) && !e.payload.price)
      c.addIssue({ code: "custom", message: "Prix requis" });
    if (e.type === "MARK" && !e.payload.source)
      c.addIssue({ code: "custom", message: "Source de valorisation requise" });
    if(e.type==="CORRECTION"&&(!e.payload.corrects||!e.payload.replacement||e.payload.text.trim().length<5))c.addIssue({code:"custom",message:"Correction : événement, remplacement et motif requis"});
    if (e.type === "COST" && e.payload.amount == null)
      c.addIssue({
        code: "custom",
        message: "Montant du coût requis (positif = payé, négatif = reçu)",
      });
  });
export type EventInput = z.infer<typeof eventSchema>;
export const docContentSchema = z
  .object({
    title: z.string().trim().min(1).max(300),
    instrumentSpec: instrumentSpecSchema.optional(),
    accountSpec: accountSpecSchema.optional(),
    research: researchSchema.optional(),
    researchRefs: z.array(z.object({id:z.string(), revisionId:z.string().optional(), stance:z.enum(["SUPPORT","CONTRADICT","CONTEXT","MISSING"]), note:z.string().max(3000).default(""),snapshot:researchSchema.optional()})).max(30).default([]),
    skill: z.string().max(100).default(""),
    criterion: z.string().max(3000).default(""),
    reviewDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    priority: z.boolean().default(false),
    evidenceIds: z.array(z.string().max(100)).max(100).default([]),
    status: z
      .enum([
        "HYPOTHESIS",
        "TESTING",
        "SUPPORTED",
        "ABANDONED",
        "OBSERVATION",
        "WAITING",
        "TRIGGERED",
        "INVALIDATED",
        "EXPIRED",
        "MISSED",
        "PROVISIONAL",
        "INCONCLUSIVE",
        "CONTRADICTORY",
        "REFUTED",
        "COMPLETED",
      ])
      .default("OBSERVATION"),
    body: z.string().max(30000).default(""),
    asset: z.string().max(40).default(""),
    bullish: z.string().max(5000).default(""),
    bearish: z.string().max(5000).default(""),
    invalidation: z.string().max(5000).default(""),
    action: z.string().max(5000).default(""),
    evidence: z.string().max(10000).default(""),
    testProtocol: z.string().max(10000).default(""),
    cadence: z.enum(["FREE", "WEEKLY", "MONTHLY", "QUARTERLY"]).default("FREE"),
    riskPercent: positive.max(100).default(1),
    reducedRisk: positive.max(100).default(0.5),
    minimumRR: positive.default(3),
    atrMultiplier: positive.default(1.5),
    maxCrypto: z.coerce.number().int().min(1).max(100).default(1),
    sources: z.array(sourceSchema).max(30).default([]),
  })
  .superRefine((v, c) => {
    if (
      v.status === "SUPPORTED" &&
      (!v.evidence.trim() || !v.testProtocol.trim())
    )
      c.addIssue({
        code: "custom",
        message:
          "Une règle étayée nécessite des résultats et un protocole de test documentés.",
      });
  });
export type DocumentContent = z.infer<typeof docContentSchema>;
export const documentSchema = z.object({
  id: z.string().optional(),
  expectedVersion: z.number().int().nonnegative().default(0),
  kind: z.enum(["STRATEGY", "MARKET", "REVIEW", "WATCH", "LEARNING", "INSTRUMENT", "ACCOUNT", "RESEARCH"]),
  content: docContentSchema,
});
