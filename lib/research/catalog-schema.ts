import { z } from 'zod';
const positive=z.coerce.number().finite().positive().max(1e12);
const currency=z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,10}$/);
export const instrumentSpecSchema=z.object({
 symbol:z.string().trim().min(1).max(40),name:z.string().trim().min(1).max(120),assetClass:z.string().trim().min(1).max(80),broker:z.string().max(150).default(''),
 type:z.enum(['SPOT','PERP','FOREX','CFD','FUTURE']),pricingModel:z.literal('LINEAR').default('LINEAR'),
 baseCurrency:z.string().max(10).default(''),quoteCurrency:currency,pnlCurrency:currency,
 quantityUnit:z.string().min(1).max(80),multiplier:positive,quantityStep:positive,minQuantity:positive,
 tickSize:positive.optional(),pipSize:positive.optional(),leverage:positive.min(1).max(1000).default(1),
 timezone:z.string().min(1).max(80).default('UTC'),hours:z.string().max(1000).default('Non renseignés'),
 feeBps:z.coerce.number().finite().nonnegative().optional(),spread:z.coerce.number().finite().nonnegative().optional(),slippageBps:z.coerce.number().finite().nonnegative().optional(),financing:z.string().max(1000).default('Non renseigné'),
 specSource:z.string().max(2000).default(''),specDate:z.string().max(40).default(''),active:z.boolean().default(true),watchlisted:z.boolean().default(true),
}).superRefine((v,c)=>{if(v.pnlCurrency!==v.quoteCurrency)c.addIssue({code:'custom',message:'Le modèle linéaire actuel exige P&L et prix dans la même devise. Configure un contrat compatible.'});});
export const accountSpecSchema=z.object({name:z.string().trim().min(1).max(120),broker:z.string().max(150).default(''),currency,initialCapital:z.coerce.number().finite().nonnegative().max(1e12),mode:z.enum(['REAL','PAPER','BACKTEST']),riskPercent:positive.max(100).default(1),maxCrypto:z.coerce.number().int().positive().default(1),usdRate:positive.optional(),fxObservedAt:z.string().datetime().optional(),fxSource:z.string().max(2000).default(''),active:z.boolean().default(true)}).superRefine((v,c)=>{if(v.currency!=='USD'&&v.usdRate!=null&&(!v.fxObservedAt||!v.fxSource.trim()))c.addIssue({code:'custom',message:'Conversion globale : date et source requises.'});});
export const researchSchema=z.object({
 title:z.string().trim().min(1).max(300),authors:z.string().max(1000).default('Non précisés'),institution:z.string().max(300).default('Non précisée'),publicationDate:z.string().max(100).default('Non précisée'),url:z.string().url().refine(v=>/^https?:\/\//.test(v)),
 type:z.string().min(1).max(120),assets:z.array(z.string().max(40)).min(1).max(50),themes:z.array(z.string().max(100)).max(30),evidenceLevel:z.string().min(1).max(120),
 timeframe:z.string().max(1000).default('Non précisé'),period:z.string().max(1000).default('Non précisée'),sample:z.string().max(1000).default('Non précisé'),methodology:z.string().max(6000).default('À documenter'),costs:z.string().max(2000).default('Non précisés'),results:z.string().max(6000).default('Aucun résultat chiffré vérifié consigné'),limits:z.string().max(6000).default('À documenter'),contradictions:z.string().max(4000).default('Non examinées'),conclusion:z.string().max(4000).default('À examiner'),nonConclusion:z.string().max(4000).default('Ne valide pas automatiquement une stratégie personnelle'),reproduce:z.string().max(4000).default('À définir'),relevance:z.string().max(4000).default('À évaluer'),verifiedAt:z.string().max(40).default(''),verificationScope:z.string().max(2000).default('Référence personnelle non auditée'),
});
export type InstrumentSpec=z.infer<typeof instrumentSpecSchema>;
export type AccountSpec=z.infer<typeof accountSpecSchema>;
export type Research=z.infer<typeof researchSchema>;
