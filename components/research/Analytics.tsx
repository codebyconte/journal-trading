"use client";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  Heading,
  Field,
  Notice,
  Loading,
  useWorkspace,
  money,
  num,
} from "./Shared";
import { Card } from "@/components/ui/Card";
import {
  observations,
  performance,
  type Observation,
} from "@/lib/research/metrics";
import { accounts } from "@/lib/research/accounts";
const groups = {
  accountId:"Compte",instrument:"Instrument",assetClass:"Classe d’actif",
  asset: "Actif",
  direction: "Direction",
  setup: "Setup",
  version: "Version de stratégie",
  regime: "Régime",
  timeframe: "Unité de temps",
  volatility: "Volatilité",
  macro: "Contexte macro",
  funding: "Funding / OI",
  execution: "Respect du plan",
  errorType: "Type d’erreur",
};
export function Analytics() {
  const { data, error, reload } = useWorkspace(),
    [accountId,setAccountId]=useState("ALL"),[instrument,setInstrument]=useState("ALL"),[strategy,setStrategy]=useState("ALL"),
    [mode, setMode] = useState("REAL"),
    [asset, setAsset] = useState("ALL"),
    [direction, setDirection] = useState("ALL"),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [group, setGroup] = useState<keyof typeof groups>("setup"),
    [factor, setFactor] = useState(""),
    [a, setA] = useState(""),
    [b, setB] = useState("");
  if (!data)
    return (
      <>
        <Heading
          tag="MESURE / ANALYSES"
          title="Comprendre ses résultats"
          description="Des statistiques descriptives, des cohortes comparables et des limites visibles."
        />
        <Loading error={error} reload={reload} />
      </>
    );
  const all = observations(data),
    rows = all.filter(
      (t) =>
        t.mode === mode && (accountId==="ALL"||t.accountId===accountId) && (instrument==="ALL"||t.instrument===instrument) && (strategy==="ALL"||t.version===strategy) &&
        (asset === "ALL" || t.asset === asset) &&
        (direction === "ALL" || t.direction === direction) &&
        (!start || t.date.slice(0, 10) >= start) &&
        (!end || t.date.slice(0, 10) <= end),
    ),
    s = performance(rows);
  const keys = Array.from(new Set(rows.map((r) => r[group]))),
    summary = keys
      .map((key) => ({
        key,
        ...performance(rows.filter((r) => r[group] === key)),
      }))
      .sort((a, b) => b.n - a.n);
  const factors = Array.from(new Set(rows.flatMap((t) => t.factors))),
    cohortA = factor
      ? rows.filter((t) => t.factors.includes(factor))
      : rows.filter((t) => t[group] === a),
    cohortB = factor
      ? rows.filter((t) => !t.factors.includes(factor))
      : rows.filter((t) => t[group] === b);
  const buckets = [
    { name: "< −2R", test: (r: number) => r < -2 },
    { name: "−2 à −1", test: (r: number) => r >= -2 && r < -1 },
    { name: "−1 à 0", test: (r: number) => r >= -1 && r < 0 },
    { name: "0 à 1", test: (r: number) => r >= 0 && r < 1 },
    { name: "1 à 2", test: (r: number) => r >= 1 && r < 2 },
    { name: "≥ 2R", test: (r: number) => r >= 2 },
  ].map((b) => ({
    name: b.name,
    n: rows.filter((t) => t.r != null && b.test(t.r)).length,
  }));
  const rolling = rows.map((r, i) => ({
    index: i + 1,
    r: performance(rows.slice(Math.max(0, i - 9), i + 1)).meanR,
  }));
  const costs = rows
    .filter((t) => t.costs != null)
    .reduce((v, t) => v + t.costs!, 0);
  return (
    <>
      <Heading
        tag="MESURE / ANALYSES"
        title="Comprendre ses résultats"
        description="Les performances passées décrivent un échantillon. Elles ne valident pas automatiquement une stratégie."
      />
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Field label="Environnement">
            <select
              className="work-input"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              {["REAL", "PAPER", "BACKTEST", "LEGACY"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Compte"><select className="work-input" value={accountId} onChange={e=>setAccountId(e.target.value)}><option value="ALL">Tous · résultats convertis USD</option><option value="LEGACY">Historique sans affectation</option>{accounts(data).map(a=><option key={a.id} value={a.id}>{a.spec.name}</option>)}</select></Field>
          <Field label="Type d’instrument"><select className="work-input" value={instrument} onChange={e=>setInstrument(e.target.value)}><option value="ALL">Tous</option>{Array.from(new Set(all.map(r=>r.instrument))).map(v=><option key={v}>{v}</option>)}</select></Field>
          <Field label="Version de stratégie filtrée"><select className="work-input" value={strategy} onChange={e=>setStrategy(e.target.value)}><option value="ALL">Toutes les versions</option>{Array.from(new Set(all.map(r=>r.version))).map(v=><option key={v} value={v}>{data.documents.flatMap(d=>d.revisions).find(r=>r.id===v)?.content.title??v}</option>)}</select></Field>
          <Field label="Actif">
            <select
              className="work-input"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
            >
              <option value="ALL">Tous les actifs</option>
              {Array.from(new Set(all.map((r) => r.asset))).map((v) => (
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
              <option value="ALL">Toutes</option>
              <option>LONG</option>
              <option>SHORT</option>
            </select>
          </Field>
          <Field label="Clôturé depuis (UTC)">
            <input
              type="date"
              className="work-input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Field>
          <Field label="Jusqu’au (UTC)">
            <input
              type="date"
              className="work-input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </Field>
        </div>
      </Card>
      <Notice>Résultats monétaires en USD avec conversions consignées dans les événements ou le plan, jamais cours live. Les positions dont le net ou la conversion globale est inconnu sont exclues : {data.positions.filter(p=>!p.archivedAt&&p.result.closed&&p.result.netUsd==null).length} au total. Les R absents restent exclus des métriques en R.</Notice>
      <Notice>
        {s.n} trades clôturés · {s.rCount} résultats en R renseignés.{" "}
        {s.n < 30
          ? "Échantillon limité : privilégie la description des observations, sans conclure à un avantage durable."
          : "La quantité seule ne suffit pas : vérifie l’indépendance des observations, les changements de régime et les tests hors échantillon."}{" "}
        {mode === "LEGACY"
          ? "Coûts et environnement des anciennes données non vérifiés."
          : ""}
      </Notice>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Résultat net", money(s.total)],
          ["Moyenne R observée", `${num(s.meanR)} R`],
          ["Médiane R", `${num(s.medianR)} R`],
          ["Profit factor", s.profitFactor == null ? "—" : Number.isFinite(s.profitFactor) ? num(s.profitFactor) : "Sans perte observée"],
          ["Taux de réussite", `${num(s.winRate, 1)} %`],
          ["Gain moyen", money(s.avgWin)],
          ["Perte moyenne", money(s.avgLoss)],
          [
            "Coûts renseignés",
            rows.some((t) => t.costs != null) ? money(costs) : "—",
          ],
        ].map(([l, v]) => (
          <Card key={l}>
            <p className="text-xs text-zinc-400">{l}</p>
            <p className="mt-3 font-mono text-2xl">{v}</p>
          </Card>
        ))}
      </div>
      {s.winInterval && (
        <Notice>
          Taux de réussite : intervalle de Wilson à 95 % [
          {num(s.winInterval[0], 1)} % ; {num(s.winInterval[1], 1)} %]. Modèle
          binomial supposant des trades indépendants et une probabilité stable ;
          des trades corrélés ou un changement de régime limitent son
          interprétation.
        </Notice>
      )}
      <div className="my-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 font-semibold">
            Distribution des résultats en R
          </h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#15191f",
                    border: "1px solid #ffffff20",
                  }}
                />
                <Bar
                  dataKey="n"
                  name="Trades"
                  fill="#6ee7b7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">
            Espérance glissante · 10 derniers trades
          </h2>
          <p className="mb-4 text-xs text-zinc-500">
            Fenêtre partielle au début. Valeurs descriptives, non prédictives.
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rolling}>
                <CartesianGrid stroke="#ffffff08" />
                <XAxis
                  dataKey="index"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#15191f",
                    border: "1px solid #ffffff20",
                  }}
                />
                <Line
                  dataKey="r"
                  name="R moyen"
                  stroke="#6ee7b7"
                  dot={false}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-semibold">Décomposition des performances</h2>
          <select
            aria-label="Dimension d’analyse"
            className="work-input !w-64"
            value={group}
            onChange={(e) => {
              setGroup(e.target.value as keyof typeof groups);
              setA("");
              setB("");
            }}
          >
            {Object.entries(groups).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-zinc-500">
                {[
                  "Groupe",
                  "n",
                  "P&L net",
                  "Espérance R",
                  "Médiane R",
                  "Win rate",
                ].map((h) => (
                  <th key={h} className="p-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map((v) => (
                <tr key={v.key} className="border-t border-white/5">
                  <td className="max-w-72 break-words p-3">{v.key}</td>
                  <td className="p-3">{v.n}</td>
                  <td className="p-3 font-mono">{money(v.total)}</td>
                  <td className="p-3 font-mono">{num(v.meanR)}</td>
                  <td className="p-3 font-mono">{num(v.medianR)}</td>
                  <td className="p-3 font-mono">{num(v.winRate, 1)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="py-10 text-center text-sm text-zinc-500">
              Aucun trade clôturé ne correspond aux filtres.
            </p>
          )}
        </div>
      </Card>
      <Card className="mt-6">
        <h2 className="mb-5 text-lg font-semibold">Comparer deux groupes</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Facteur étudié (présent / absent)">
            <select
              className="work-input"
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
            >
              <option value="">Utiliser la dimension choisie</option>
              {factors.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          {!factor &&
            [a, b].map((v, i) => (
              <Field key={i} label={`Groupe ${i ? "B" : "A"}`}>
                <select
                  className="work-input"
                  value={v}
                  onChange={(e) => (i ? setB : setA)(e.target.value)}
                >
                  <option value="">Choisir un groupe</option>
                  {keys.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
            ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[cohortA, cohortB].map((g, i) => {
            const v = performance(g);
            return (
              <div key={i} className="rounded-xl border border-white/10 p-5">
                <p className="text-sm text-zinc-400">
                  Groupe {i ? "B" : "A"}{" "}
                  {factor ? (i ? "· facteur absent" : "· facteur présent") : ""}
                </p>
                <p className="mt-3 font-mono text-2xl">
                  {num(v.meanR)} R{" "}
                  <span className="text-xs text-zinc-500">· n = {v.n}</span>
                </p>
              </div>
            );
          })}
        </div>
        <Notice>
          {!factor && a && a === b
            ? "Les deux groupes sélectionnés sont identiques. "
            : ""}
          Comparaison exploratoire uniquement. L’absence d’un facteur enregistré
          ne prouve pas son absence sur le marché. Les groupes peuvent différer
          par régime, actif ou période. Aucun test de significativité ni lien
          causal n’est affirmé ; formalise l’hypothèse au laboratoire avant un
          nouveau test.
        </Notice>
      </Card>
    </>
  );
}
