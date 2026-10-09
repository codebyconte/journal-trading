"use client";
import { useState, useEffect } from "react";
import { Plus, Save, History, ArrowRight } from "lucide-react";
import { Heading, Field, Notice, Loading, useWorkspace, save } from "./Shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/catalyst/button";
import { docContentSchema, type DocumentContent } from "@/lib/research/schema";
import type { Workspace } from "@/lib/research/data";
import { ResearchLinks } from "./ResearchLinks";
import { ResearchPicker } from "./ResearchPicker";
import { instruments } from "@/lib/research/accounts";
type Kind = "STRATEGY" | "MARKET" | "REVIEW" | "WATCH";
const info = {
  STRATEGY: [
    "RECHERCHE / LABORATOIRE",
    "Laboratoire de stratégies",
    "Une hypothèse, un protocole de test et des versions conservées. Aucun statut ne constitue une validation automatique.",
  ],
  MARKET: [
    "RECHERCHE / CONTEXTE",
    "Journal de marché",
    "Documente ton raisonnement avant les événements. Chaque modification crée une version horodatée.",
  ],
  REVIEW: [
    "PROGRESSION / REVUES",
    "Mes revues",
    "Des notes libres, un bilan hebdomadaire court, une revue mensuelle et un audit trimestriel.",
  ],
  WATCH: [
    "EXÉCUTION / OBSERVATION",
    "Watchlist",
    "Observe les opportunités, y compris celles que tu ne prends pas. Aucun gain hypothétique n’est ajouté aux résultats.",
  ],
};
const statuses: Record<string, string> = {
  HYPOTHESIS: "Hypothèse",
  TESTING: "En test",
  SUPPORTED: "Validation limitée · déclaration personnelle",
  PROVISIONAL: "Résultat provisoire",
  INCONCLUSIVE: "Non concluant",
  CONTRADICTORY: "Résultat contradictoire",
  REFUTED: "Hypothèse infirmée",
  COMPLETED: "Action réalisée",
  ABANDONED: "Abandonnée",
  OBSERVATION: "Observation",
  WAITING: "En attente",
  TRIGGERED: "Déclenché",
  INVALIDATED: "Invalidé",
  EXPIRED: "Expiré",
  MISSED: "Manqué",
};
export function Documents({ kind }: { kind: Kind }) {
  const { data, error, reload } = useWorkspace(),
    [selected, setSelected] = useState<string | null>(null),
    [editing, setEditing] = useState(false),
    [version, setVersion] = useState<number | null>(null),
    [revisionId, setRevisionId] = useState<string | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [form, setForm] = useState<DocumentContent>(() => ({
    ...docContentSchema.parse({
      title: "Nouvelle fiche",
      status: kind === "STRATEGY" ? "HYPOTHESIS" : "OBSERVATION",
    }),
    title: "",
  }));
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setSelected(q.get("document"));
    setRevisionId(q.get("revision"));
  }, []);
  useEffect(()=>{
    if(editing)try{localStorage.setItem('tradinglog-document-draft-'+kind,JSON.stringify({selected,form}));}catch{}
  },[editing,form,kind,selected]);
  const [sourceUrl, setSourceUrl] = useState(""),
    [sourceAt, setSourceAt] = useState(""),
    [frequency, setFrequency] = useState(""),
    [delay, setDelay] = useState("");
  if (!data)
    return (
      <>
        <Heading
          tag={info[kind][0]}
          title={info[kind][1]}
          description={info[kind][2]}
        />
        <Loading error={error} reload={reload} />
      </>
    );
  const docs = data.documents.filter((d) => !d.archivedAt&&d.kind === kind),
    doc = docs.find((d) => d.id === selected),
    rev = doc?.revisions.find((r) =>
      revisionId
        ? r.id === revisionId
        : r.version === (version ?? doc.revisions[0].version),
    );
  function patch(p: Partial<DocumentContent>) {
    setForm((f) => ({ ...f, ...p }));
  }
  function newDoc() {
    try { const draft=JSON.parse(localStorage.getItem('tradinglog-document-draft-'+kind)||'null'); if(draft){setSelected(draft.selected);setForm(docContentSchema.parse(draft.form));setEditing(true);return;} } catch {}
    setSelected(null);
    setVersion(null);
    setForm({
      ...docContentSchema.parse({
        title: "Nouvelle fiche",
        status: kind === "STRATEGY" ? "HYPOTHESIS" : "OBSERVATION",
      }),
      title: "",
    });
    setEditing(true);
    setMessage("");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({
        action: "document",
        document: {
          id: doc?.id,
          expectedVersion: doc?.revisions[0].version ?? 0,
          kind,
          content: form,
        },
      });
      setMessage("Version enregistrée. L’historique précédent est conservé.");
      setEditing(false);
      localStorage.removeItem("tradinglog-document-draft-"+kind);
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <Heading
        tag={info[kind][0]}
        title={info[kind][1]}
        description={info[kind][2]}
      >
        <Button color="emerald" onClick={newDoc}>
          <Plus data-slot="icon" /> Nouvelle fiche
        </Button>
      </Heading>
      {message && <Notice>{message}</Notice>}
      {kind==='WATCH'&&<Card className="mb-5"><h2 className="font-semibold">Mon univers actif</h2><div className="mt-3 flex flex-wrap gap-3">{instruments(data).filter(i=>i.spec.active&&i.spec.watchlisted).map(i=><a className="rounded-lg bg-emerald-400/5 px-3 py-2 text-sm text-emerald-200" key={i.id} href={`/sources?asset=${encodeURIComponent(i.spec.symbol)}`}>{i.spec.symbol} · recherches ↗</a>)}</div><a href="/settings" className="mt-4 inline-block text-xs text-zinc-400">Activer, désactiver ou ajouter un instrument dans Paramètres ↗</a></Card>}
      <div className="grid items-start gap-5 lg:grid-cols-[280px_1fr]">
        <Card>
          <p className="eyebrow">{docs.length} FICHES</p>
          <div className="mt-4 space-y-2">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelected(d.id);
                  setVersion(null);
                  setRevisionId(null);
                  setEditing(false);
                }}
                className={`w-full rounded-lg border p-3 text-left ${d.id === selected ? "border-emerald-300/30 bg-emerald-400/5" : "border-white/5 hover:bg-white/5"}`}
              >
                <p className="text-sm font-medium">
                  {d.revisions[0].content.title}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  v{d.revisions[0].version} ·{" "}
                  {statuses[d.revisions[0].content.status]}
                </p>
              </button>
            ))}
            {!docs.length && (
              <p className="py-5 text-sm leading-6 text-zinc-500">
                Tes recherches commencent par une première observation.
              </p>
            )}
          </div>
          {kind === "STRATEGY" && (
            <a
              href="/api/export?format=archive"
              className="mt-6 block text-xs text-zinc-400 underline"
            >
              Télécharger le protocole v0 non vérifié
            </a>
          )}
        </Card>
        {editing ? (
          <Card>
            <form onSubmit={submit} className="space-y-5">
              <ResearchPicker asset={form.asset} data={data} value={form.researchRefs} onChange={v=>patch({researchRefs:v})}/>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Titre">
                  <input
                    required
                    className="work-input"
                    value={form.title}
                    onChange={(e) => patch({ title: e.target.value })}
                  />
                </Field>
                <Field label="Statut">
                  <select
                    className="work-input"
                    value={form.status}
                    onChange={(e) =>
                      patch({
                        status: e.target.value as DocumentContent["status"],
                      })
                    }
                  >
                    {(kind === "STRATEGY"
                      ? [
                          "HYPOTHESIS",
                          "TESTING",
                          "PROVISIONAL",
                          "INCONCLUSIVE",
                          "CONTRADICTORY",
                          "SUPPORTED",
                          "ABANDONED",
                        ]
                      : kind === "WATCH"
                        ? [
                            "OBSERVATION",
                            "WAITING",
                            "TRIGGERED",
                            "INVALIDATED",
                            "EXPIRED",
                            "MISSED",
                          ]
                        : ["OBSERVATION"]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {statuses[s]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {kind === "REVIEW" ? (
                <Field label="Rythme de la revue">
                  <select
                    className="work-input"
                    value={form.cadence}
                    onChange={(e) =>
                      patch({
                        cadence: e.target.value as DocumentContent["cadence"],
                      })
                    }
                  >
                    {[
                      ["FREE", "Note libre"],
                      ["WEEKLY", "Hebdomadaire"],
                      ["MONTHLY", "Mensuelle"],
                      ["QUARTERLY", "Trimestrielle"],
                    ].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field label="Actif ou univers de test">
                  <input
                    className="work-input"
                    value={form.asset}
                    onChange={(e) => patch({ asset: e.target.value })}
                    placeholder="Symbole libre : XAUUSD, EURUSD…"
                  />
                </Field>
              )}
              <Field
                label={
                  kind === "STRATEGY"
                    ? "Hypothèse et conditions d’entrée / sortie"
                    : kind === "WATCH"
                      ? "Direction, zone d’intérêt, déclencheur, R/R estimé"
                      : "Observation et raisonnement"
                }
              >
                <textarea
                  rows={5}
                  className="work-input"
                  value={form.body}
                  onChange={(e) => patch({ body: e.target.value })}
                />
              </Field>
              {kind === "MARKET" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(["bullish", "bearish"] as const).map((k, i) => (
                    <Field
                      key={k}
                      label={i ? "Scénario baissier" : "Scénario haussier"}
                    >
                      <textarea
                        rows={4}
                        className="work-input"
                        value={form[k]}
                        onChange={(e) => patch({ [k]: e.target.value })}
                      />
                    </Field>
                  ))}
                </div>
              )}
              <Field
                label={
                  kind === "REVIEW"
                    ? "Erreur récurrente ou difficulté observée"
                    : "Conditions d’invalidation"
                }
              >
                <textarea
                  rows={3}
                  className="work-input"
                  value={form.invalidation}
                  onChange={(e) => patch({ invalidation: e.target.value })}
                />
              </Field>
              <Field
                label={
                  kind === "REVIEW"
                    ? "Action corrective mesurable"
                    : "Prochaine étape / suivi de la thèse"
                }
              >
                <textarea
                  rows={3}
                  className="work-input"
                  value={form.action}
                  onChange={(e) => patch({ action: e.target.value })}
                />
              </Field>
              {kind === "STRATEGY" && (
                <>
                  <Field label="Protocole de test préalablement défini">
                    <textarea
                      rows={4}
                      className="work-input"
                      value={form.testProtocol}
                      onChange={(e) => patch({ testProtocol: e.target.value })}
                      placeholder="Population, période, critères, coûts, données hors échantillon, critère de décision…"
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {(
                      [
                        ["riskPercent", "Risque référence (%)"],
                        ["reducedRisk", "Risque réduit (%)"],
                        ["minimumRR", "R/R recherché"],
                        ["atrMultiplier", "Multiplicateur ATR étudié"],
                        ["maxCrypto", "Positions crypto souhaitées"],
                      ] as const
                    ).map(([k, l]) => (
                      <Field key={k} label={l}>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          className="work-input"
                          value={form[k]}
                          onChange={(e) =>
                            patch({ [k]: Number(e.target.value) })
                          }
                        />
                      </Field>
                    ))}
                  </div>
                  <Notice>
                    Ces paramètres sont des préférences de cette version, jamais
                    des seuils universels. La fiche de trade conserve la version
                    sélectionnée et reste saisissable en cas d’écart.
                  </Notice>
                </>
              )}
              <Field
                label={
                  kind === "STRATEGY"
                    ? "Résultats, taille d’échantillon, limites et décision"
                    : "Retour ultérieur : faits observés et enseignement"
                }
              >
                <textarea
                  rows={4}
                  className="work-input"
                  value={form.evidence}
                  onChange={(e) => patch({ evidence: e.target.value })}
                />
              </Field>
              <details className="rounded-xl border border-white/10 p-4">
                <summary className="cursor-pointer text-sm">
                  Sources consultées ({form.sources.length})
                </summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="URL">
                    <input
                      type="url"
                      className="work-input"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                    />
                  </Field>
                  <Field label="Date d’observation (heure locale)">
                    <input
                      type="datetime-local"
                      className="work-input"
                      value={sourceAt}
                      onChange={(e) => setSourceAt(e.target.value)}
                    />
                  </Field>
                  <Field label="Fréquence de publication">
                    <input
                      className="work-input"
                      placeholder="Mensuelle, 8h, ponctuelle…"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    />
                  </Field>
                  <Field label="Délai / fraîcheur">
                    <input
                      className="work-input"
                      placeholder="J-1, délai inconnu…"
                      value={delay}
                      onChange={(e) => setDelay(e.target.value)}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  className="mt-4 text-sm text-emerald-300"
                  onClick={() => {
                    try {
                      if (!sourceAt || !frequency || !delay)
                        throw new Error(
                          "Renseigne la date, la fréquence et le délai de la source.",
                        );
                      const sources = [
                        ...form.sources,
                        {
                          url: sourceUrl,
                          observedAt: new Date(sourceAt).toISOString(),
                          frequency,
                          delay,
                          note: "",
                        },
                      ];
                      docContentSchema.parse({
                        ...form,
                        title: form.title || "Brouillon",
                        sources,
                      });
                      patch({ sources });
                      setSourceUrl("");
                      setMessage("");
                    } catch (e) {
                      setMessage(
                        e instanceof Error ? e.message : "Source invalide",
                      );
                    }
                  }}
                >
                  Ajouter cette source
                </button>
                {form.sources.map((s, i) => (
                  <p key={i} className="mt-3 break-all text-xs text-zinc-400">
                    {s.url} · {s.observedAt}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        patch({
                          sources: form.sources.filter((_, j) => i !== j),
                        })
                      }
                      className="text-red-300"
                    >
                      Retirer
                    </button>
                  </p>
                ))}
              </details>
              <div className="flex gap-3">
                <Button type="submit" color="emerald" disabled={busy}>
                  <Save data-slot="icon" />
                  {busy ? "Enregistrement…" : "Enregistrer une version"}
                </Button>
                <Button type="button" outline onClick={() => setEditing(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        ) : rev ? (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  {statuses[rev.content.status]} · VERSION {rev.version}
                </p>
                <h2 className="mt-2 text-2xl">{rev.content.title}</h2>
                <p className="mt-2 text-xs text-zinc-500">
                  Enregistrée le{" "}
                  {new Date(rev.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <Button
                outline
                onClick={() => {
                  setForm(doc!.revisions[0].content);
                  setEditing(true);
                }}
              >
                Faire évoluer
              </Button>
            </div>
            <select
              aria-label="Version à consulter"
              className="work-input my-6"
              value={rev.version}
              onChange={(e) => {
                setRevisionId(null);
                setVersion(Number(e.target.value));
              }}
            >
              {doc!.revisions.map((r) => (
                <option key={r.id} value={r.version}>
                  Version {r.version} —{" "}
                  {new Date(r.createdAt).toLocaleString("fr-FR")}
                </option>
              ))}
            </select>
            {Object.entries({
              body: "Raisonnement",
              bullish: "Scénario haussier",
              bearish: "Scénario baissier",
              invalidation: "Invalidation / difficulté",
              testProtocol: "Protocole de test",
              evidence: "Résultats et limites",
              action: "Prochaine action",
            }).map(
              ([k, label]) =>
                rev.content[k as keyof DocumentContent] && (
                  <section key={k} className="mb-6">
                    <h3 className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                      {label}
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                      {String(rev.content[k as keyof DocumentContent])}
                    </p>
                  </section>
                ),
            )}
            {kind === "STRATEGY" && (
              <Notice>
                Référence : {rev.content.riskPercent} % · réduit :{" "}
                {rev.content.reducedRisk} % · R/R étudié :{" "}
                {rev.content.minimumRR} · ATR × {rev.content.atrMultiplier}.
                Aucun avantage statistique n’est présumé.
              </Notice>
            )}
            {rev.content.sources.map((s, i) => (
              <Notice key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-emerald-300"
                >
                  {s.url}
                </a>
                <br />
                {new Date(s.observedAt).toLocaleString("fr-FR")} · {s.frequency}{" "}
                · délai : {s.delay}
              </Notice>
            ))}
          </Card>
        ) : (
          <Card className="py-16 text-center">
            <History className="mx-auto mb-4 text-emerald-300" />
            <h2 className="text-xl">Construis un historique de décisions</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
              Sélectionne une fiche ou crée ta première note. Le raisonnement
              initial reste accessible à chaque nouvelle version.
            </p>
          </Card>
        )}
      </div>
      {kind === "REVIEW" && data.journal.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm text-zinc-400">
            Ancien journal conservé ({data.journal.length} notes)
          </summary>
          {data.journal.map((j) => (
            <Card key={j.id} className="mt-3">
              <p className="text-xs text-zinc-500">
                {new Date(j.date).toLocaleDateString("fr-FR")}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm">{j.content}</p>
            </Card>
          ))}
        </details>
      )}
    </div>
  );
}
