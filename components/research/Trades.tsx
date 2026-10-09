"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Heading,
  Field,
  Notice,
  Loading,
  useWorkspace,
  save,
  money,
  num,
  DownloadLinks,
} from "./Shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/catalyst/button";
import type { Plan, EventInput } from "@/lib/research/schema";
import { accounts, instruments, accountSummary } from "@/lib/research/accounts";
import { ResearchLinks } from "./ResearchLinks";
import { ResearchPicker } from "./ResearchPicker";
const DRAFT = "tradinglog-professional-draft-v1";
const base = {
  asset: "",
  accountId:"",instrumentId:"",accountCurrency:"USD",accountToUsd:"1",fxObservedAt:"",fxSource:"",initialFee:"",broker:"",assetClass:"Non documentée",researchRefs:"[]",protocolDeviation:"",missingInformation:"",
  mode: "PAPER",
  instrument: "PERP",
  direction: "LONG",
  entry: "",
  stop: "",
  target: "",
  quantity: "",
  capital: "",
  initialRisk: "",
  multiplier: "1",
  quoteToAccount: "1",
  quoteCurrency: "USD",
  leverage: "2",
  setup: "",
  strategyRevisionId: "",
  regime: "UNKNOWN",
  timeframe: "4H",
  dailyContext: "",
  thesis: "",
  counterEvidence: "",
  atr: "",
  volatility: "",
  macro: "",
  fundingContext: "",
  factors: "",
  datetime: "",
  sourceUrl: "",
  sourceAt: "",
  sourceFrequency: "",
  sourceDelay: "",
};
function nowLocal() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export function Trades() {
  const { data, error, reload } = useWorkspace(),
    [show, setShow] = useState(false),
    [form, setForm] = useState(base),
    [draftReady, setDraftReady] = useState(false),
    [selected, setSelected] = useState<string | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [filter, setFilter] = useState("ALL"),
    [query, setQuery] = useState(""),
    [requestId, setRequestId] = useState(""),
    [eventId, setEventId] = useState("");
  const [event, setEvent] = useState({
    type: "NOTE",
    price: "",
    quantity: "",
    fee: "0",
    amount: "",
    text: "",
    execution: "UNKNOWN",
    errorType: "UNKNOWN",
    source: "",
    nextTest: "",
    conversion:"",fxSource:"",settlesUnknownFees:false,corrects:"",replacement:"",
    occurredAt: "",
  });
  useEffect(() => {
    setSelected(new URLSearchParams(window.location.search).get("position"));
    setRequestId(crypto.randomUUID());
    setEventId(crypto.randomUUID());
    setForm((f) => ({ ...f, datetime: nowLocal() }));
    setEvent((e) => ({ ...e, occurredAt: nowLocal() }));
    try {
      const raw = localStorage.getItem(DRAFT);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p.asset === "string")
          setForm({...base,...Object.fromEntries(Object.entries(p).filter(([k,v])=>k in base&&typeof v==="string"))});
      }
      setDraftReady(true);
    } catch {
      setMessage(
        "Brouillon local indisponible. Les fiches enregistrées restent en base.",
      );
    }
  }, []);
  useEffect(() => {
    if (draftReady) {
      try {
        localStorage.setItem(DRAFT, JSON.stringify(form));
      } catch {
        setMessage("Brouillon non sauvegardé : espace local indisponible.");
      }
    }
  }, [form, draftReady]);
  if (!data)
    return (
      <>
        <Heading
          tag="EXÉCUTION / JOURNAL"
          title="Mes positions"
          description="Préparer, suivre, puis comprendre. Réel, paper et backtest restent séparés."
        />
        <Loading error={error} reload={reload} />
      </>
    );
  const position = data.positions.find((p) => p.id === selected),
    strategies = data.documents.filter((d) => !d.archivedAt && d.kind === "STRATEGY"),
    contractList=instruments(data), accountList=accounts(data);
  const patch = (k: keyof typeof base, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const selectedContract=instruments(data!).find(i=>i.id===form.instrumentId);
      const plan = {
        ...form,
        schemaVersion: 1,
        datetime: new Date(form.datetime).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        accountCurrency: form.accountCurrency,
        accountId:form.accountId||undefined,
        instrumentRevisionId:selectedContract?.revision.id,
        instrumentSpec:selectedContract?.spec,
        stop:form.stop?Number(form.stop):null,
        capital:form.capital?Number(form.capital):null,
        initialRisk:form.initialRisk?Number(form.initialRisk):null,
        initialFee:form.initialFee?Number(form.initialFee):null,
        quoteToAccount:form.quoteToAccount?Number(form.quoteToAccount):null,
        accountToUsd:form.accountToUsd?Number(form.accountToUsd):null,
        fxObservedAt:form.fxObservedAt?new Date(form.fxObservedAt).toISOString():undefined,
        researchRefs:JSON.parse(form.researchRefs),
        target: form.target ? Number(form.target) : undefined,
        atr: form.atr ? Number(form.atr) : undefined,
        strategyRevisionId: form.strategyRevisionId || undefined,
        factors: form.factors
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        sources: form.sourceUrl
          ? [
              {
                url: form.sourceUrl,
                observedAt: new Date(form.sourceAt).toISOString(),
                frequency: form.sourceFrequency,
                delay: form.sourceDelay,
                note: "",
              },
            ]
          : [],
      };
      const res = await save({ action: "position", requestId, plan });
      setSelected(res.id);
      setShow(false);
      setForm({ ...base, datetime: nowLocal() });
      setRequestId(crypto.randomUUID());
      setMessage(
        "Position enregistrée. Complète les frais réellement payés dans le suivi.",
      );
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }
  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({
        action: "event",
        event: {
          requestId: eventId,
          positionId: selected,
          type: event.type,
          occurredAt: new Date(event.occurredAt).toISOString(),
          payload: {
            price: event.price ? Number(event.price) : undefined,
            quantity: event.quantity ? Number(event.quantity) : undefined,
            fee: event.fee===""?null:Number(event.fee),
            conversion:event.conversion?Number(event.conversion):undefined,
            fxSource:event.fxSource||undefined,fxObservedAt:event.conversion?new Date(event.occurredAt).toISOString():undefined,
            corrects:event.corrects||undefined,replacement:event.replacement?JSON.parse(event.replacement):undefined,
            settlesUnknownFees:event.settlesUnknownFees,
            amount: event.amount ? Number(event.amount) : undefined,
            text: event.text,
            execution: event.execution,
            errorType: event.errorType,
            source: event.source,
            nextTest: event.nextTest,
          },
        },
      });
      setEventId(crypto.randomUUID());
      setEvent((v) => ({
        ...v,
        text: "",
        price: "",
        quantity: "",
        amount: "",
        fee: "0",
        occurredAt: nowLocal(),
      }));
      setMessage("Événement enregistré. Le résultat a été recalculé.");
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }
  const input = (
    k: keyof typeof base,
    label: string,
    type = "text",
    required = false,
  ) => (
    <Field key={k} label={label}>
      <input
        className="work-input"
        type={type}
        step={type === "number" ? "any" : undefined}
        required={required}
        value={form[k]}
        disabled={!!form.instrumentId && ["asset","multiplier","quoteCurrency","assetClass","broker"].includes(k)}
        onChange={(e) => patch(k, e.target.value)}
      />
    </Field>
  );
  const select = (k: keyof typeof base, label: string, values: string[]) => (
    <Field key={k} label={label}>
      <select
        className="work-input"
        value={form[k]}
        disabled={k === "instrument" && !!form.instrumentId}
        onChange={(e) => {
          patch(k, e.target.value);
          if (k === "instrument") {
            patch("multiplier", "");
            patch("quantity", "");
            if (e.target.value === "SPOT") {
              patch("leverage", "1");
              patch("direction", "LONG");
            }
          }
        }}
      >
        {values.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </Field>
  );
  return (
    <>
      <Heading
        tag="EXÉCUTION / JOURNAL"
        title="Mes positions"
        description="Une fiche rapide, un plan initial conservé, puis un journal chronologique d’exécution."
      >
        <Button
          color="emerald"
          onClick={() => {
            setShow(!show);
            setSelected(null);
          }}
        >
          <Plus data-slot="icon" />
          {show ? "Fermer le brouillon" : "Nouvelle position"}
        </Button>
      </Heading>
      {message && <Notice>{message}</Notice>}
      {show && (
        <Card className="mb-6">
          <form onSubmit={create} className="space-y-6">
            <h2 className="text-xl">01 / Avant l’entrée</h2>
            {(()=>{const a=accountList.find(a=>a.id===form.accountId);const openCrypto=data.positions.filter(p=>!p.archivedAt&&p.plan.accountId===form.accountId&&!p.result.closed&&/crypto/i.test(p.plan.assetClass)).length;return a&&/crypto/i.test(form.assetClass)&&a.spec.maxCrypto!=null&&openCrypto>=a.spec.maxCrypto?<Notice>Préférence personnelle : {openCrypto} position(s) crypto ouverte(s), objectif {a.spec.maxCrypto}. Cet avertissement ne bloque pas la documentation d’un trade.</Notice>:null;})()}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label="Compte de la position"><select className="work-input" value={form.accountId} onChange={e=>{
                const a=accountList.find(a=>a.id===e.target.value);patch('accountId',e.target.value);patch('accountCurrency',a?.spec.currency??'USD');patch('mode',a?.spec.mode??'PAPER');patch('capital',a?String(accountSummary(data,a.id)?.capital??''):'');patch('accountToUsd',a?.spec.currency==='USD'||!a?'1':String(a.spec.usdRate??''));patch('fxObservedAt',a?.spec.fxObservedAt??'');patch('fxSource',a?.spec.fxSource??'');patch('quoteToAccount',form.quoteCurrency===(a?.spec.currency??'USD')?'1':'');
              }}><option value="">Compte historique · USD</option>{accountList.filter(a=>a.spec.active).map(a=><option key={a.id} value={a.id}>{a.spec.name} · {a.spec.currency}</option>)}</select></Field>
              <Field label="Contrat enregistré"><select className="work-input" value={form.instrumentId} onChange={e=>{
                const i=contractList.find(i=>i.id===e.target.value);patch('instrumentId',e.target.value);if(i){for(const [k,v] of Object.entries({asset:i.spec.symbol,instrument:i.spec.type,multiplier:String(i.spec.multiplier),quoteCurrency:i.spec.quoteCurrency,broker:i.spec.broker,assetClass:i.spec.assetClass,leverage:String(i.spec.leverage)}))patch(k as keyof typeof base,v);patch('quoteToAccount',i.spec.quoteCurrency===form.accountCurrency?'1':'');}
              }}><option value="">Spécifications manuelles</option>{contractList.filter(i=>i.spec.active).map(i=><option key={i.id} value={i.id}>{i.spec.symbol} · {i.spec.broker||i.spec.type} · v{i.revision.version}</option>)}</select></Field>
              {input("asset", "Actif", "text", true)}
              {select("mode", "Environnement", ["PAPER", "REAL", "BACKTEST"])}
              {select("instrument", "Instrument", [
                "PERP",
                "SPOT",
                "FOREX",
                "CFD", "FUTURE",
              ])}
              {select("direction", "Direction", ["LONG", "SHORT"])}
              {input(
                "datetime",
                "Exécution initiale · heure locale",
                "datetime-local",
                true,
              )}
              {input("entry", "Prix exécuté", "number", true)}
              {input("stop", "Stop initial (inconnu si vide)", "number")}
              {input(
                "quantity",
                "Quantité exécutée (contrats / lots)",
                "number",
                true,
              )}
              {input("capital", `Capital de référence (${form.accountCurrency})`, "number")}
              {input(
                "initialRisk",
                `Budget de risque initial (${form.accountCurrency}, facultatif)`,
                "number",
              )}
              {input("initialFee", `Frais d’entrée (${form.accountCurrency}, vide = inconnus)`,"number")}
            </div>
            {(!form.stop||Number(form.stop)>0&&(form.direction==='LONG'?Number(form.stop)>=Number(form.entry):Number(form.stop)<=Number(form.entry)))&&<Notice>Stop absent ou sans distance de protection initiale cohérente : documente cette situation. La saisie du trade reste possible.</Notice>}
            <Notice>
              Un budget non renseigné ne produit aucun R. Un stop manquant signale un risque non défini. Le budget renseigné reste figé pour calculer les R. Le
              risque de prix initial est{" "}
              {Number(form.entry) > 0 &&
              Number(form.stop) > 0 &&
              Number(form.quantity) > 0
                ? money(
                    Math.abs(Number(form.entry) - Number(form.stop)) *
                      Number(form.quantity) *
                      Number(form.multiplier) *
                      Number(form.quoteToAccount),
                  )
                : "—"}
              , hors coûts. Les champs avancés permettent de préciser les
              contrats autres que des unités crypto. Le mode BACKTEST sert à
              consigner des résultats d’un test exécuté ailleurs, pas à lancer
              un moteur de simulation.
            </Notice>
            <details
              open={form.instrument === "FOREX" || form.instrument === "CFD"}
              className="rounded-xl border border-white/10 p-4"
            >
              <summary className="cursor-pointer text-sm">
                Spécifications du contrat et contexte de recherche
              </summary>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {input(
                  "multiplier",
                  "Unités sous-jacentes par contrat / lot",
                  "number",
                  true,
                )}
                {input(
                  "quoteToAccount",
                  `Conversion 1 ${form.quoteCurrency} vers ${form.accountCurrency} (facultatif)`,
                  "number",
                )}
                {input("quoteCurrency", "Devise de cotation", "text", true)}
                {input("accountToUsd", "Conversion devise du compte → USD (facultatif)","number")}
                {input("fxSource","Source de conversion")}
                {input("fxObservedAt","Date de conversion","text")}
                {input("broker","Courtier / plateforme")}
                {input("assetClass","Classe d’actif")}
                {input("leverage", "Levier initial", "number", true)}
                {input("target", "Objectif initial (facultatif)", "number")}
                {input("atr", "ATR observé (facultatif)", "number")}
                {input("setup", "Setup libre")}
                {select("regime", "Régime", [
                  "UNKNOWN",
                  "BULL",
                  "BEAR",
                  "RANGE",
                ])}
                {input("timeframe", "Unité de temps")}
                <Field label="Version de stratégie">
                  <select
                    className="work-input"
                    value={form.strategyRevisionId}
                    onChange={(e) =>
                      patch("strategyRevisionId", e.target.value)
                    }
                  >
                    <option value="">Sans version</option>
                    {strategies.flatMap((d) =>
                      d.revisions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.content.title} · v{r.version}
                        </option>
                      )),
                    )}
                  </select>
                </Field>
                {input("volatility", "Volatilité : étiquette libre")}
                {input("macro", "Contexte macro : étiquette libre")}
                {input("fundingContext", "Funding / OI : observation")}
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                La conversion est fixe pour ce trade. Les variations de
                conversion en cours de position et contrats inverses ne sont pas
                pris en charge.
              </p>
            </details>
            <ResearchPicker asset={form.asset} data={data} value={JSON.parse(form.researchRefs)} onChange={v=>patch('researchRefs',JSON.stringify(v))}/>
            {input('protocolDeviation','Écart aux règles personnelles / trade hors stratégie')}
            {input('missingInformation','Informations absentes')}
            <details className="rounded-xl border border-white/10 p-4">
              <summary className="cursor-pointer text-sm">
                Thèse, informations pertinentes et source
              </summary>
              <div className="mt-5 space-y-4">
                {(["dailyContext", "thesis", "counterEvidence"] as const).map(
                  (k, i) => (
                    <Field
                      key={k}
                      label={
                        [
                          "Contexte Daily / structure 4H",
                          "Thèse et raisons d’entrée",
                          "Éléments contraires à la thèse",
                        ][i]
                      }
                    >
                      <textarea
                        rows={3}
                        className="work-input"
                        value={form[k]}
                        onChange={(e) => patch(k, e.target.value)}
                      />
                    </Field>
                  ),
                )}
                {input(
                  "factors",
                  "Facteurs observés, séparés par des virgules (ex. BBW expansion, retest EMA200)",
                )}
                {input(
                  "sourceUrl",
                  "Lien source ou capture TradingView",
                  "url",
                )}
                {input(
                  "sourceAt",
                  "Date d’observation de la source",
                  "datetime-local",
                )}
                {input("sourceFrequency", "Fréquence de la source")}
                {input("sourceDelay", "Délai de la source (ou inconnu)")}
              </div>
            </details>
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" color="emerald" disabled={busy}>
                {busy ? "Enregistrement…" : "Enregistrer l’entrée"}
              </Button>
              <span className="text-xs text-zinc-500">
                Brouillon local automatique · les fiches enregistrées sont en
                base.
              </span>
            </div>
          </form>
        </Card>
      )}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <input
            aria-label="Rechercher un actif ou setup"
            className="work-input !w-64"
            placeholder="Rechercher un actif ou setup…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            aria-label="Filtrer l’environnement"
            className="work-input !w-40"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["ALL", "REAL", "PAPER", "BACKTEST"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>
        <DownloadLinks />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-zinc-500">
                {[
                  "Instrument",
                  "Environnement",
                  "État",
                  "Quantité restante",
                  "P&L réalisé net",
                  "R",
                ].map((h) => (
                  <th key={h} className="px-3 pb-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.positions
                .filter(
                  (p) =>
                    !p.archivedAt && (filter === "ALL" || p.plan.mode === filter) &&
                    `${p.plan.asset} ${p.plan.setup}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="p-3">
                      <button
                        className="text-emerald-300 hover:underline"
                        onClick={() => {
                          setSelected(p.id);
                          setShow(false);
                          setEvent((e) => ({ ...e, occurredAt: nowLocal() }));
                        }}
                      >
                        {p.plan.asset} ↗
                      </button>
                      <p className="mt-1 text-xs text-zinc-500">
                        {p.plan.direction} · {p.plan.instrument}
                      </p>
                    </td>
                    <td className="p-3 text-xs">{p.plan.mode}</td>
                    <td className="p-3 text-xs">
                      {p.result.closed ? "Clôturé" : "Ouvert"}
                    </td>
                    <td className="p-3 font-mono">
                      {num(p.result.quantity, 8)}
                    </td>
                    <td
                      className={`p-3 font-mono ${p.result.net != null && p.result.net < 0 ? "text-red-300" : "text-emerald-300"}`}
                    >
                      {money(p.result.net,p.plan.accountCurrency)}
                    </td>
                    <td className="p-3 font-mono">{num(p.result.r)} R</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!data.positions.length && (
            <p className="py-12 text-center text-sm text-zinc-500">
              Aucune nouvelle position. Enregistre ta première entrée ou
              commence par une observation dans la watchlist.
            </p>
          )}
        </div>
      </Card>
      {position && (
        <section className="mt-6 grid items-start gap-5 xl:grid-cols-2">
          <Card>
            <p className="eyebrow">
              PLAN INITIAL CONSERVÉ / {position.plan.mode}
            </p>
            <h2 className="my-3 text-2xl">
              {position.plan.asset} · {position.plan.direction}
            </h2>
            <p className="text-xs text-zinc-500">
              {new Date(position.plan.datetime).toLocaleString("fr-FR")} ·{" "}
              {position.plan.timezone}
            </p>
            <div className="my-5 grid grid-cols-2 gap-4">
              {[
                ["Entrée moyenne", num(position.result.averageEntry)],
                ["Stop actuel", num(position.result.stop)],
                ["Budget initial", money(position.plan.initialRisk,position.plan.accountCurrency)],
                [
                  "Frais / funding",
                  position.result.costsKnown?money(position.result.fees + position.result.funding,position.plan.accountCurrency):"Frais incomplets",
                ],
                ["Réalisé net", money(position.result.net,position.plan.accountCurrency)],
                ["Non réalisé indicatif", money(position.result.unrealized,position.plan.accountCurrency)],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-xs text-zinc-500">{l}</p>
                  <p className="mt-1 font-mono text-lg">{v}</p>
                </div>
              ))}
            </div>
            {position.result.mark && (
              <p className="text-xs text-zinc-500">
                Valorisation manuelle : {position.result.mark.source} ·{" "}
                {new Date(position.result.mark.at).toLocaleString("fr-FR")} —
                aucun prix live.
              </p>
            )}
            <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
              {position.plan.thesis || "Thèse non documentée."}
            </p>
            <ResearchLinks refs={position.plan.researchRefs}/>
            <details className="mt-5">
              <summary className="text-sm text-emerald-300">
                Voir le plan complet
              </summary>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs text-zinc-400">
                {JSON.stringify(position.plan, null, 2)}
              </pre>
            </details>
            {(position.plan.stop==null||position.plan.initialRisk==null||!position.result.costsKnown)&&<Notice>Risque ou frais incomplets : {position.plan.stop==null?'stop absent ; ':''}{position.plan.initialRisk==null?'R indisponible ; ':''}{!position.result.costsKnown?'net indisponible tant que les frais inconnus ne sont pas rapprochés.':''}</Notice>}
            <h3 className="mb-4 mt-8 text-sm font-semibold">
              Journal d’exécution horodaté
            </h3>
            {position.events.map((e) => (
              <div key={e.id} className="border-t border-white/10 py-4">
                <p className="text-xs text-zinc-500">
                  {e.type} · {new Date(e.occurredAt).toLocaleString("fr-FR")}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {e.payload.quantity
                    ? `${num(e.payload.quantity, 8)} × ${num(e.payload.price ?? null)} · `
                    : ""}
                  {e.payload.text}
                </p>
                {e.type === "COST" && (
                  <p className="mt-1 text-sm">
                    Coût : {money(e.payload.amount ?? 0)}
                  </p>
                )}
                {e.type === "REVIEW" && (
                  <p className="mt-2 text-xs text-zinc-400">
                    {e.payload.execution} · {e.payload.errorType}
                    <br />
                    Test envisagé : {e.payload.nextTest || "—"}
                  </p>
                )}
              </div>
            ))}
          </Card>
          <Card>
            <form onSubmit={addEvent} className="space-y-4">
              <h2 className="text-xl">
                {position.result.closed
                  ? "03 / Après clôture"
                  : "02 / Pendant la position"}
              </h2>
              <Field label="Événement">
                <select
                  className="work-input"
                  value={event.type}
                  onChange={(e) =>
                    setEvent((v) => ({ ...v, type: e.target.value }))
                  }
                >
                  {(position.result.closed
                    ? ["NOTE", "COST", "REVIEW", "CORRECTION"]
                    : [
                        "NOTE",
                        "ENTRY",
                        "EXIT",
                        "STOP",
                        "COST",
                        "MARK",
                        "REVIEW", "CORRECTION",
                      ]
                  ).map((v) => (
                    <option key={v} value={v}>
                      {
                        {
                          NOTE: "Note de suivi",
                          ENTRY: "Entrée fractionnée",
                          EXIT: "Sortie partielle / totale",
                          STOP: "Modification du stop",
                          COST: "Frais / funding additionnels",
                          MARK: "Valorisation manuelle",
                          REVIEW: "Bilan du trade",
                          CORRECTION:"Correction auditée",
                        }[v]
                      }
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date de l’événement · heure locale">
                <input
                  type="datetime-local"
                  required
                  className="work-input"
                  value={event.occurredAt}
                  onChange={(e) =>
                    setEvent((v) => ({ ...v, occurredAt: e.target.value }))
                  }
                />
              </Field>
              {["ENTRY", "EXIT", "STOP", "MARK"].includes(event.type) && (
                <Field label="Prix">
                  <input
                    type="number"
                    step="any"
                    required
                    className="work-input"
                    value={event.price}
                    onChange={(e) =>
                      setEvent((v) => ({ ...v, price: e.target.value }))
                    }
                  />
                </Field>
              )}
              {["ENTRY", "EXIT"].includes(event.type) && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Quantité">
                    <input
                      type="number"
                      step="any"
                      required
                      className="work-input"
                      value={event.quantity}
                      onChange={(e) =>
                        setEvent((v) => ({ ...v, quantity: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label={`Frais réels en ${position.plan.accountCurrency} (vide = inconnus)`}>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      className="work-input"
                      value={event.fee}
                      onChange={(e) =>
                        setEvent((v) => ({ ...v, fee: e.target.value }))
                      }
                    />
                  </Field>
                </div>
              )}
              {event.type==='CORRECTION'&&<><Field label="Événement à corriger"><select className="work-input" required value={event.corrects} onChange={e=>{const old=position.events.find(x=>x.id===e.target.value);setEvent(v=>({...v,corrects:e.target.value,replacement:old?JSON.stringify(old.payload):''}));}}><option value="">Choisir l’original</option>{position.events.filter(e=>e.type!=='CORRECTION').map(e=><option key={e.id} value={e.id}>{e.type} · {e.occurredAt}</option>)}</select></Field>{(()=>{const old=position.events.find(e=>e.id===event.corrects);if(!old)return null;const values=JSON.parse(event.replacement||'{}');const keys=old.type==='ENTRY'||old.type==='EXIT'?['price','quantity','fee']:old.type==='COST'?['amount']:old.type==='STOP'||old.type==='MARK'?['price']:[];return <div className="grid gap-4 sm:grid-cols-2">{keys.map(key=><Field key={key} label={{price:'Prix corrigé',quantity:'Quantité corrigée',fee:`Frais corrigés (${position.plan.accountCurrency}, vide = inconnus)`,amount:`Coût corrigé (${position.plan.accountCurrency})`}[key]||key}><input className="work-input" type="number" step="any" required={key!=='fee'} value={values[key]??''} onChange={e=>setEvent(v=>({...v,replacement:JSON.stringify({...values,[key]:e.target.value===''?null:Number(e.target.value)})}))}/></Field>)}</div>;})()}<Notice>L’original reste conservé. Renseigne le motif dans le commentaire. La correction recalcule la position ; une quantité de sortie incohérente reste refusée.</Notice></>}
              {event.type === "COST" && (
                <Field label={`Coût ${position.plan.accountCurrency} (positif = payé ; négatif = reçu)`}>
                  <input
                    type="number"
                    step="any"
                    required
                    className="work-input"
                    value={event.amount}
                    onChange={(e) =>
                      setEvent((v) => ({ ...v, amount: e.target.value }))
                    }
                  />
                </Field>
              )}
              {event.type === "MARK" && (
                <Field label="Source du prix observé">
                  <input
                    required
                    className="work-input"
                    value={event.source}
                    onChange={(e) =>
                      setEvent((v) => ({ ...v, source: e.target.value }))
                    }
                  />
                </Field>
              )}
              {['EXIT','MARK'].includes(event.type)&&position.plan.quoteCurrency!==position.plan.accountCurrency&&<Field label={`Conversion ${position.plan.quoteCurrency} → ${position.plan.accountCurrency} à cet événement`}><input type="number" step="any" className="work-input" value={event.conversion} onChange={e=>setEvent(v=>({...v,conversion:e.target.value}))}/></Field>}
              {event.type==='COST'&&!position.result.costsKnown&&<label className="flex gap-3 text-sm"><input type="checkbox" checked={event.settlesUnknownFees} onChange={e=>setEvent(v=>({...v,settlesUnknownFees:e.target.checked}))}/>Ce montant rapproche tous les frais d’exécution restés inconnus jusqu’ici.</label>}
              {['EXIT','MARK'].includes(event.type)&&position.plan.quoteCurrency!==position.plan.accountCurrency&&<Field label="Source de la conversion de cet événement"><input className="work-input" value={event.fxSource} onChange={e=>setEvent(v=>({...v,fxSource:e.target.value}))}/></Field>}
              <Field
                label={
                  event.type === "REVIEW"
                    ? "Qualité de l’analyse, exécution et enseignement"
                    : "Commentaire / lien de capture après"
                }
              >
                <textarea
                  rows={4}
                  className="work-input"
                  value={event.text}
                  onChange={(e) =>
                    setEvent((v) => ({ ...v, text: e.target.value }))
                  }
                />
              </Field>
              {event.type === "REVIEW" && (
                <>
                  <Field label="Respect du plan">
                    <select
                      className="work-input"
                      value={event.execution}
                      onChange={(e) =>
                        setEvent((v) => ({ ...v, execution: e.target.value }))
                      }
                    >
                      {["UNKNOWN", "RESPECTED", "DEVIATION"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Cause envisagée (qualification personnelle)">
                    <select
                      className="work-input"
                      value={event.errorType}
                      onChange={(e) =>
                        setEvent((v) => ({ ...v, errorType: e.target.value }))
                      }
                    >
                      {[
                        "UNKNOWN",
                        "NONE",
                        "STRATEGY",
                        "EXECUTION",
                        "BEHAVIOR",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Modification à tester">
                    <textarea
                      className="work-input"
                      value={event.nextTest}
                      onChange={(e) =>
                        setEvent((v) => ({ ...v, nextTest: e.target.value }))
                      }
                    />
                  </Field>
                </>
              )}
              <Button type="submit" color="emerald" disabled={busy}>
                Enregistrer l’événement
              </Button>
              <p className="text-xs leading-5 text-zinc-500">
                Les événements sont ajoutés chronologiquement. Ils ne remplacent
                jamais le plan initial. Les coûts saisis sont soustraits du
                résultat réalisé.
              </p>
            </form>
          </Card>
        </section>
      )}
      {data.legacy.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-zinc-400">
            Historique v0 conservé · {data.legacy.length} trades · environnement
            non documenté
          </summary>
          <Notice>
            Ces lignes sont conservées sans réinterpréter leurs règles ni leurs
            coûts. Elles sont analysables séparément sous LEGACY et incluses
            dans le rapprochement du compte historique.
          </Notice>
          {data.legacy.map((t) => (
            <Card key={t.id} className="mt-3">
              <div className="flex justify-between text-sm">
                <span>
                  {t.asset} · {t.status} · {t.direction}
                </span>
                <span>{money(t.pnl)}</span>
              </div>
              <details className="mt-2">
                <summary className="text-xs text-zinc-500">
                  Détails d’origine
                </summary>
                <pre className="mt-3 overflow-auto text-xs">
                  {JSON.stringify(t, null, 2)}
                </pre>
              </details>
            </Card>
          ))}
        </details>
      )}
    </>
  );
}
