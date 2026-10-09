"use client";
import { useState } from "react";
import { Heading, Field, Notice, num, money, useWorkspace } from "./Shared";
import { Card } from "@/components/ui/Card";
import { sizePosition } from "@/lib/research/finance";
import { account } from "@/lib/research/metrics";
import { accounts,instruments,accountSummary,portfolioRisk } from "@/lib/research/accounts";
const fields = [
  ["capital", "Capital (USD)"],
  ["riskPercent", "Risque choisi (%)"],
  ["entry", "Prix d’entrée"],
  ["stop", "Stop initial"],
  ["multiplier", "Unités par contrat / lot"],
  ["conversion", "Conversion devise cotée → USD"],
  ["leverage", "Levier"],
  ["feeBps", "Frais par côté (points de base)"],
  ["slippageBps", "Glissement par côté (points de base)"],
  ["fundingBps", "Funding payé estimé sur la durée (pb)"],
  ["spread","Spread total retenu (unité de prix)"],
  ["commissionPerUnit","Commission par contrat et par côté (devise du compte)"],
  ["fixedFees","Coûts fixes aller-retour (devise du compte)"],
  ["quantityStep", "Pas de quantité du courtier"],
] as const;
export function Risk() {
  const { data } = useWorkspace(),
    [contractId,setContractId]=useState(""),[accountId,setAccountId]=useState(""),
    [instrument, setInstrument] = useState("PERP"),
    [direction, setDirection] = useState("LONG"),
    [form, setForm] = useState({
      capital: "",
      riskPercent: "1",
      entry: "",
      stop: "",
      multiplier: "1",
      conversion: "1",
      leverage: "2",
      feeBps: "",
      slippageBps: "",
      fundingBps: "",
      quantityStep: "",spread:"0",commissionPerUnit:"0",fixedFees:"0",
    });
  let result: ReturnType<typeof sizePosition> | null = null,
    warning = "";
  try {
    if (Object.values(form).some((v) => v === ""))
      throw new Error(
        "Complète les hypothèses de coût et les spécifications de ton instrument. Utilise 0 si tu choisis explicitement de les exclure.",
      );
    const p = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, Number(v)]),
    ) as unknown as Parameters<typeof sizePosition>[0];
    if (direction === "LONG" ? p.stop >= p.entry : p.stop <= p.entry)
      throw new Error("Le stop doit être du côté de la perte.");
    if (instrument === "SPOT" && (direction === "SHORT" || p.leverage !== 1))
      throw new Error("Spot : long et levier 1 uniquement.");
    result = sizePosition(p);
  } catch (e) {
    warning = e instanceof Error ? e.message : "";
  }
  const a = data ? portfolioRisk(data) : null;
  const ac=data?accounts(data):[],ins=data?instruments(data):[],currency=ac.find(a=>a.id===accountId)?.spec.currency??"USD";
  return (
    <>
      <Heading
        tag="EXÉCUTION / RISQUE"
        title="Simulateur de position"
        description="Des hypothèses explicites, des tailles adaptées au contrat et des coûts intégrés. Aucun ordre n’est envoyé."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <Field label="Compte de dimensionnement"><select className="work-input" value={accountId} onChange={e=>{setAccountId(e.target.value);const a=ac.find(a=>a.id===e.target.value);if(a)setForm(f=>({...f,capital:String(accountSummary(data!,a.id)?.capital??''),riskPercent:String(a.spec.riskPercent),conversion:''}));}}><option value="">Hypothèses manuelles · USD</option>{ac.filter(a=>a.spec.active).map(a=><option key={a.id} value={a.id}>{a.spec.name} · {a.spec.currency}</option>)}</select></Field>
            <Field label="Contrat de dimensionnement"><select className="work-input" value={contractId} onChange={e=>{setContractId(e.target.value);const i=ins.find(i=>i.id===e.target.value);if(i){setInstrument(i.spec.type);setForm(f=>({...f,multiplier:String(i.spec.multiplier),quantityStep:String(i.spec.quantityStep),leverage:String(i.spec.leverage),feeBps:String(i.spec.feeBps??''),slippageBps:String(i.spec.slippageBps??''),spread:String(i.spec.spread??''),conversion:i.spec.quoteCurrency===currency?'1':'',fundingBps:''}));}}}><option value="">Spécifications manuelles</option>{ins.filter(i=>i.spec.active).map(i=><option key={i.id} value={i.id}>{i.spec.symbol} · {i.spec.broker||i.spec.type}</option>)}</select></Field>
            <Field label="Instrument">
              <select
                className="work-input"
                value={instrument}
                onChange={(e) => {
                  setInstrument(e.target.value);
                  setForm((f) => ({
                    ...f,
                    multiplier: "",
                    quantityStep: "",
                    leverage: e.target.value === "SPOT" ? "1" : f.leverage,
                  }));
                }}
              >
                {["SPOT", "PERP", "FOREX", "CFD", "FUTURE"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Direction">
              <select
                className="work-input"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              >
                <option>LONG</option>
                <option>SHORT</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([key, label]) => (
              <Field key={key} label={key==="capital"?`Capital (${currency})`:key==="conversion"?`Conversion devise du P&L → ${currency}`:label}>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="work-input"
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </Field>
            ))}
          </div>
          <Notice>
            1 point de base = 0,01 %. Le multiplicateur, le pas de quantité et
            la conversion doivent provenir des spécifications du courtier. Les
            contrats inverses et options ne sont pas pris en charge.
          </Notice>
        </Card>
        <div className="space-y-5">
          <Card>
            <p className="eyebrow">POSITION THÉORIQUE · MODÈLE LINÉAIRE</p>
            {result ? (
              <div aria-live="polite" className="mt-6 space-y-5">
                {[
                  [
                    "Quantité arrondie au pas inférieur",
                    num(result.quantity, 8),
                  ],
                  ["Notionnel", money(result.notional,currency)],
                  ["Marge initiale théorique", money(result.margin,currency)],
                  [
                    "Perte au stop avec hypothèses de coûts",
                    money(result.risk,currency),
                  ],
                  ["Dont coûts estimés", money(result.costs,currency)],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-4"
                  >
                    <span className="text-sm text-zinc-400">{l}</span>
                    <span className="font-mono text-lg text-emerald-300">
                      {v}
                    </span>
                  </div>
                ))}
                {result.margin > Number(form.capital) && (
                  <Notice error>
                    Marge théorique supérieure au capital saisi.
                  </Notice>
                )}
                {result.quantity === 0 && (
                  <Notice error>
                    Le budget ne permet pas une unité minimale du contrat.
                  </Notice>
                )}
              </div>
            ) : (
              <Notice>{warning}</Notice>
            )}
            <p className="mt-4 text-xs leading-6 text-zinc-500">
              Le levier change la marge, pas le risque de prix d’une quantité
              donnée. La perte réelle peut dépasser la simulation en cas de gap,
              glissement ou défaut de liquidité. La liquidation dépend du
              courtier et de la marge de maintenance : elle n’est pas estimée
              ici.
            </p>
          </Card>
          <Card>
            <h2 className="font-semibold">Exposition du journal</h2>
            <p className="mt-3 text-2xl font-mono">
              {a ? money(a.knownUsd) : "—"}
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              {a?.unknown??0} positions avec risque/conversion inconnus. Part connue en USD du risque de prix aux stops enregistrés. Hors gaps et coûts futurs.
              Les positions crypto peuvent partager le même facteur de risque ;
              aucune corrélation numérique n’est déduite de leur nom.
            </p>
          </Card>
          <Card>
            <h2 className="font-semibold">Scénarios de pertes successives</h2>
            <p className="mt-2 text-xs text-zinc-500">
              Risque recalculé sur le capital restant ; pas une prévision.
            </p>
            {[3, 5, 10].map((n) => (
              <div key={n} className="mt-4 flex justify-between text-sm">
                <span className="text-zinc-400">
                  {n} pertes de {form.riskPercent || "—"} %
                </span>
                <span>
                  {Number(form.capital) > 0 &&
                  Number(form.riskPercent) > 0 &&
                  Number(form.riskPercent) <= 100
                    ? money(
                        Number(form.capital) *
                          (1 - Number(form.riskPercent) / 100) ** n,
                      )
                    : "—"}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
