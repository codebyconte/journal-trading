"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Target,
  BookOpen,
  ClipboardCheck,
  Plus,
  History,
} from "lucide-react";
import {
  Heading,
  Field,
  Notice,
  Loading,
  useWorkspace,
  save,
  money,
} from "./Shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/catalyst/button";
import { Documents } from "./Documents";
import type { Workspace } from "@/lib/research/data";
import { docContentSchema, type DocumentContent } from "@/lib/research/schema";
import {
  SKILLS,
  MISTAKES,
  RUBRIC,
  processVerdict,
  latestAssessments,
  mistakeGroups,
  skillEvidence,
  type AssessmentData,
  type Assessment,
} from "@/lib/research/learning";

const ratingNames = {
  MET: "Critère respecté",
  NOT_MET: "Critère non respecté",
  UNKNOWN: "Information insuffisante",
  NA: "Non applicable — à justifier",
};
const verdictNames = {
  SOUND: "Processus documenté et cohérent",
  REVIEW: "Processus à réexaminer",
  INSUFFICIENT: "Évaluation insuffisante",
};
const skillName = (id: string) => SKILLS.find((s) => s.id === id)?.name ?? id;
const labelOf = (a: Assessment) =>
  typeof a.snapshot === "object" && a.snapshot && "label" in a.snapshot
    ? String(a.snapshot.label)
    : a.subjectId;
const today = () => new Date().toLocaleDateString("en-CA");
const nextWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const emptyCriteria = () =>
  Object.fromEntries(
    RUBRIC.map((r) => [r.id, { value: "UNKNOWN", evidence: "" }]),
  ) as AssessmentData["criteria"];
function sourceLink(a: Assessment) {
  const kind = (a.snapshot as { kind?: string })?.kind;
  return a.subjectType === "POSITION"
    ? `/trades?position=${a.subjectId}`
    : `${kind === "WATCH" ? "/watchlist" : kind === "REVIEW" ? "/progress?tab=reviews&" : "/journal?"}${kind === "WATCH" ? "?" : ""}document=${a.subjectId}&revision=${a.revisionId ?? ""}`;
}
function EvidenceView({value}: {value: unknown}) {
  if (value === null || value === undefined || value === "") return <span className="text-zinc-500">Non renseigné</span>;
  if (Array.isArray(value)) return value.length ? <ul className="space-y-2">{value.map((v,i)=><li key={i}><EvidenceView value={v}/></li>)}</ul> : <span className="text-zinc-500">Aucun élément consigné</span>;
  if (typeof value === "object") return <dl className="space-y-3">{Object.entries(value).map(([k,v])=><div key={k} className="border-b border-white/5 pb-2"><dt className="mb-1 text-xs font-medium capitalize text-zinc-400">{k.replace(/([A-Z])/g," $1")}</dt><dd className="break-words text-sm leading-6 text-zinc-200"><EvidenceView value={v}/></dd></div>)}</dl>;
  return <span className="whitespace-pre-wrap">{String(value)}</span>;
}
export function coachData(w: Workspace) {
  const assessments = latestAssessments(w.assessments),
    plans = w.documents.filter((d) => d.kind === "LEARNING"&&!d.archivedAt),
    active = plans
      .filter((d) => d.revisions[0].content.status === "TESTING")
      .sort(
        (a, b) =>
          Number(b.revisions[0].content.priority) -
            Number(a.revisions[0].content.priority) ||
          b.revisions[0].createdAt.localeCompare(a.revisions[0].createdAt),
      ),
    priority = active[0],
    groups = mistakeGroups(w.assessments);
  const reviewed = new Set(
      assessments.map((a) => `${a.subjectType}:${a.subjectId}`),
    ),
    pendingPositions = w.positions.filter(
      (p) => !p.archivedAt && !reviewed.has(`POSITION:${p.id}`),
    ),
    pendingDocs = w.documents.filter(
      (d) =>
        !d.archivedAt && ["MARKET", "WATCH"].includes(d.kind) &&
        !assessments.some((a) => a.subjectType === "DOCUMENT" && a.subjectId === d.id && a.revisionId === d.revisions[0]?.id),
    );
  return {
    assessments,
    plans,
    active,
    priority,
    groups,
    pendingPositions,
    pendingDocs,
    experiments: w.documents.filter(
      (d) =>
        !d.archivedAt && d.kind === "STRATEGY" && d.revisions[0].content.status === "TESTING",
    ),
  };
}
export function NextImprovement({ data }: { data: Workspace }) {
  const c = coachData(data),
    p = c.priority?.revisions[0].content;
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="capital-panel rounded-2xl border border-emerald-300/20 p-7">
          <p className="eyebrow">MA PROCHAINE AMÉLIORATION</p>
          <h2 className="mt-5 text-3xl font-medium tracking-tight">
            {p ? skillName(p.skill) : "Choisir une compétence à travailler"}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
            {p
              ? p.criterion
              : "Commence par évaluer une décision ou une analyse. Appuie ton prochain objectif sur une difficulté documentée, même sans position exécutée."}
          </p>
          {p && (
            <p className="mt-4 text-xs text-emerald-200">
              Prochaine revue : {p.reviewDate} · critère choisi par toi
            </p>
          )}
          <Link
            href={p ? "/progress?tab=plans" : "/progress?tab=evaluate"}
            className="mt-7 inline-flex items-center gap-3 rounded-lg bg-emerald-300 px-5 py-3 text-sm font-semibold text-zinc-950"
          >
            {p ? "Reprendre mon action corrective" : "Évaluer une décision"}
            <ArrowRight size={16} />
          </Link>
        </section>
        <Card className="!p-7">
          <p className="eyebrow">PISTE D’ENTRAÎNEMENT PERSONNEL</p>
          <h2 className="mt-4 text-xl">
            {p
              ? "Une action observable"
              : (c.groups[0]?.name ?? "Revoir avant de conclure")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            {p?.action ??
              c.groups[0]?.exercise ??
              "Relis une analyse sans consulter son résultat. Vérifie le contexte, l’invalidation et les arguments contraires, puis consigne ce qui manque."}
          </p>
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Proposition de travail manuelle, pas un exercice automatiquement
            corrigé. Aucun objectif de fréquence de trading.
          </p>
          <Link
            href="/progress"
            className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-300"
          >
            Ouvrir Ma Progression <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
      <div className="my-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          [
            c.pendingPositions.length + c.pendingDocs.length,
            "Décisions sans évaluation",
            "/progress?tab=evaluate",
          ],
          [
            c.groups.filter((g) => g.n >= 2).length,
            "Erreurs répétées documentées",
            "/progress?tab=mistakes",
          ],
          [
            c.active.length,
            "Actions correctives en cours",
            "/progress?tab=plans",
          ],
          [c.experiments.length, "Expériences en cours", "/protocol"],
        ].map(([n, l, url]) => (
          <Link href={String(url)} key={String(l)}>
            <Card>
              <p className="font-mono text-2xl">{n}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">{l}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
export function Learning() {
  const { data, error, reload } = useWorkspace(),
    [tab, setTab] = useState("overview"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [source, setSource] = useState(""),
    [selectedAssessment, setSelectedAssessment] = useState<string | null>(null),
    [requestId, setRequestId] = useState(""),
    [correction, setCorrection] = useState<string | undefined>(),
    [showOutcome, setShowOutcome] = useState(false);
  const [form, setForm] = useState({
    skill: "entry",
    criteria: emptyCriteria(),
    decision: "REVIEW" as AssessmentData["decision"],
    errors: [] as string[],
    errorStatus: "SUSPECTED" as AssessmentData["errorStatus"],
    impact: "UNKNOWN" as AssessmentData["impact"],
    observation: "",
    interpretation: "",
    uncertainty: "",
    action: "",
    knownOutcome: false,
    cycleRevisionId: "",
    cycleCriterion: {
      value: "UNKNOWN" as "UNKNOWN" | "MET" | "NOT_MET" | "NA",
      evidence: "",
    },
  });
  const [customError, setCustomError] = useState(""),
    [planId, setPlanId] = useState<string | undefined>(),
    [planVersion, setPlanVersion] = useState<number | null>(null),
    [planForm, setPlanForm] = useState<DocumentContent>(() =>
      docContentSchema.parse({
        title: "Mon objectif",
        skill: "entry",
        status: "TESTING",
        reviewDate: "2026-10-16",
      }),
    ),
    [showPlan, setShowPlan] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setTab(q.get("tab") ?? "overview");
    setSelectedAssessment(q.get("assessment"));
    setRequestId(crypto.randomUUID());
    setPlanForm((f) => ({ ...f, reviewDate: nextWeek() }));
  }, []);
  if (!data)
    return (
      <>
        <Heading
          tag="OBSERVER → MESURER → CORRIGER"
          title="Ma Progression"
          description="Transformer les décisions en observations, puis en actions vérifiables."
        />
        <Loading error={error} reload={reload} />
      </>
    );
  const c = coachData(data),
    selected = data.assessments.find((a) => a.id === selectedAssessment);
  const choices = [
    ...data.positions.map((p) => ({
      value: `POSITION:${p.id}`,
      type: "POSITION" as const,
      id: p.id,
      revisionId: undefined as string | undefined,
      label: `${p.plan.asset} · ${p.plan.direction} · ${p.plan.mode} · ${p.plan.datetime.slice(0, 10)}`,
      body: JSON.stringify(
        {
          contexte: p.plan.dailyContext,
          these: p.plan.thesis,
          argumentsContraires: p.plan.counterEvidence,
          entree: p.plan.entry,
          stop: p.plan.stop,
          objectif: p.plan.target,
          budgetRisque: p.plan.initialRisk,
          setup: p.plan.setup,
          version: p.plan.strategyRevisionId,
          facteurs: p.plan.factors,
          sources: p.plan.sources,
        },
        null,
        2,
      ),
    })),
    ...data.documents
      .filter((d) => ["MARKET", "WATCH", "REVIEW"].includes(d.kind))
      .flatMap((d) =>
        d.revisions.map((r) => ({
          value: `DOCUMENT:${d.id}:${r.id}`,
          type: "DOCUMENT" as const,
          id: d.id,
          revisionId: r.id,
          label: `${r.content.title} · v${r.version} · ${d.kind}`,
          body: JSON.stringify(
            {
              date: r.createdAt,
              raisonnement: r.content.body,
              scenarioHaussier: r.content.bullish,
              scenarioBaissier: r.content.bearish,
              invalidation: r.content.invalidation,
              sources: r.content.sources,
            },
            null,
            2,
          ),
        })),
      ),
  ];
  const chosen = choices.find((s) => s.value === source),
    activePlan = c.plans.find((p) => p.id === planId),
    visiblePlan = activePlan?.revisions.find(
      (r) => r.version === (planVersion ?? activePlan.revisions[0].version),
    );
  const patch = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  async function submitAssessment(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen) return;
    setBusy(true);
    try {
      const r = await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cycleRevisionId: form.cycleRevisionId || undefined,
          cycleCriterion: form.cycleRevisionId
            ? form.cycleCriterion
            : undefined,
          requestId,
          subjectType: chosen.type,
          subjectId: chosen.id,
          revisionId: chosen.revisionId,
          supersedesId: correction,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setSelectedAssessment(j.id);
      setRequestId(crypto.randomUUID());
      setCorrection(undefined);
      setMessage(
        "Évaluation conservée avec sa justification et sa source. Le résultat reste séparé.",
      );
      await reload();
      setTab("overview");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Évaluation impossible");
    } finally {
      setBusy(false);
    }
  }
  function newPlan(skill = "entry", action = "", evidenceIds: string[] = []) {
    setPlanId(undefined);
    setShowPlan(true);
    setPlanForm(
      docContentSchema.parse({
        title: `Travailler : ${skillName(skill)}`,
        skill,
        criterion: SKILLS.find((s) => s.id === skill)?.criterion ?? "",
        action,
        status: "TESTING",
        priority: true,
        reviewDate: nextWeek(),
        evidenceIds,
      }),
    );
    setTab("plans");
  }
  async function submitPlan(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({
        action: "document",
        document: {
          id: planId,
          expectedVersion: activePlan?.revisions[0].version ?? 0,
          kind: "LEARNING",
          content: planForm,
        },
      });
      setMessage("Plan de progression versionné et enregistré.");
      setShowPlan(false);
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Plan non enregistré");
    } finally {
      setBusy(false);
    }
  }
  function correct(a: Assessment) {
    setSource(
      a.subjectType === "POSITION"
        ? `POSITION:${a.subjectId}`
        : `DOCUMENT:${a.subjectId}:${a.revisionId}`,
    );
    setForm({
      ...a.data,
      cycleRevisionId: a.data.cycleRevisionId ?? "",
      cycleCriterion: a.data.cycleCriterion ?? {
        value: "UNKNOWN",
        evidence: "",
      },
    });
    setCorrection(a.id);
    setRequestId(crypto.randomUUID());
    setTab("evaluate");
    setShowOutcome(false);
  }
  return (
    <>
      <Heading
        tag="OBSERVER → IDENTIFIER → TESTER → CORRIGER"
        title="Ma Progression"
        description="Des critères concrets, des exemples consultables et des actions réexaminées. Aucune note de maîtrise inventée."
      />
      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10">
        {[
          ["overview", "Vue de progression"],
          ["evaluate", "Évaluer une décision"],
          ["mistakes", "Erreurs & leçons"],
          ["plans", "Actions correctives"],
          ["reviews", "Mes bilans"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`border-b-2 px-3 py-3 text-sm ${tab === id ? "border-emerald-300 text-emerald-300" : "border-transparent text-zinc-400 hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {message && <Notice>{message}</Notice>}
      {tab === "overview" && (
        <>
          <NextImprovement data={data} />
          <Card>
            <h2 className="text-xl">Compétences et preuves disponibles</h2>
            <p className="mt-2 text-xs leading-6 text-zinc-500">
              Évaluations personnelles de processus, pas certification de
              compétence. Une même situation réévaluée n’est pas une nouvelle
              observation indépendante.
            </p>
            {Array.from(new Set(SKILLS.map((s) => s.domain))).map((domain) => (
              <details
                key={domain}
                className="mt-5 border-t border-white/10 pt-4"
                open={domain === "Trading"}
              >
                <summary className="cursor-pointer text-sm font-semibold">
                  {domain}
                </summary>
                <div className="mt-4 space-y-4">
                  {SKILLS.filter((s) => s.domain === domain).map((s) => {
                    const e = skillEvidence(data.assessments, s.id).all;
                    return (
                      <div
                        key={s.id}
                        className="rounded-lg border border-white/5 p-4"
                      >
                        <div className="flex flex-wrap justify-between gap-3">
                          <h3 className="text-sm">{s.name}</h3>
                          <button
                            onClick={() => newPlan(s.id)}
                            className="text-xs text-emerald-300"
                          >
                            Travailler cette compétence →
                          </button>
                        </div>
                        <p className="mt-2 text-xs leading-6 text-zinc-400">
                          {s.criterion}
                        </p>
                        <p className="mt-3 text-xs text-zinc-500">
                          {e.n
                            ? `${e.n} évaluations · ${e.sound} cohérentes · ${e.review} à réexaminer · ${e.unknown} insuffisantes`
                            : "Pas encore de preuve consignée — niveau non évalué."}
                        </p>
                        {e.ids.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {e.ids.map((id) => (
                              <button
                                key={id}
                                onClick={() => {
                                  setSelectedAssessment(id);
                                  setShowOutcome(false);
                                }}
                                className="text-xs text-emerald-300 underline"
                              >
                                {labelOf(
                                  data.assessments.find((a) => a.id === id)!,
                                )}{" "}
                                ↗
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
            ))}
          </Card>
          <Card className="mt-5">
            <h2 className="font-semibold">Décisions à examiner</h2>
            <div className="mt-4 space-y-3">
              {choices
                .filter(
                  (s) =>
                    !c.assessments.some(
                      (a) =>
                        a.subjectId === s.id &&
                        (s.type === "POSITION" ||
                          a.revisionId === s.revisionId),
                    ),
                )
                .slice(0, 12)
                .map((s) => (
                  <button
                    key={s.value}
                    onClick={() => {
                      setSource(s.value);
                      setCorrection(undefined);
                      setTab("evaluate");
                    }}
                    className="block text-left text-sm text-zinc-300 hover:text-emerald-300"
                  >
                    {s.label} →
                  </button>
                ))}
              {!choices.length && (
                <p className="text-sm text-zinc-500">
                  Commence par une analyse de marché, une opportunité ou une
                  position. Aucune transaction n’est nécessaire pour apprendre.
                </p>
              )}
            </div>
          </Card>
        </>
      )}
      {tab === "evaluate" && (
        <form
          onSubmit={submitAssessment}
          className="grid items-start gap-5 xl:grid-cols-[1fr_1.2fr]"
        >
          <Card>
            <h2 className="mb-5 text-xl">1. Choisir les preuves</h2>
            <Field label="Décision ou version d’analyse">
              <select
                required
                className="work-input"
                value={source}
                disabled={!!correction}
                onChange={(e) => {
                  setSource(e.target.value);
                  setShowOutcome(false);
                }}
              >
                <option value="">Choisir une source</option>
                {choices.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            {chosen && (
              <>
                <p className="mt-4 text-xs text-zinc-500">
                  Le résultat financier n’est pas affiché dans ce formulaire. Tu
                  peux déjà le connaître : indique-le honnêtement ci-dessous.
                </p>
                <div className="mt-4 max-h-96 overflow-auto rounded-xl bg-black/20 p-4"><EvidenceView value={JSON.parse(chosen.body)}/></div>
              </>
            )}
            <Field label="Compétence principalement évaluée">
              <select
                className="work-input mt-4"
                value={form.skill}
                disabled={!!correction}
                onChange={(e) =>
                  patch({ skill: e.target.value, cycleRevisionId: "" })
                }
              >
                {SKILLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.domain} / {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Décision effectivement prise">
              <select
                className="work-input mt-4"
                value={form.decision}
                onChange={(e) =>
                  patch({
                    decision: e.target.value as AssessmentData["decision"],
                  })
                }
              >
                {[
                  ["ENTER", "Entrer"],
                  ["WAIT", "Attendre"],
                  ["NO_TRADE", "Ne pas trader"],
                  ["MANAGE", "Gérer une position"],
                  ["REVIEW", "Analyser / réexaminer"],
                ].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <label className="mt-5 flex items-start gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="mt-1 accent-emerald-300"
                checked={form.knownOutcome}
                onChange={(e) => patch({ knownOutcome: e.target.checked })}
              />
              Je connais déjà l’issue de cette décision.
            </label>
            <Notice>
              La date réelle d’enregistrement est conservée. S’il existe déjà
              une sortie, une valorisation ou un résultat consigné, l’évaluation
              sera classée rétrospective. Masquer le P&L ne supprime pas un
              biais de connaissance déjà présent.
            </Notice>
          </Card>
          <Card>
            <h2 className="mb-5 text-xl">2. Évaluer le processus</h2>
            {RUBRIC.map((r) => (
              <section
                key={r.id}
                className="mb-5 border-b border-white/10 pb-5"
              >
                <Field label={r.name} hint={r.criterion}>
                  <select
                    className="work-input"
                    value={form.criteria[r.id].value}
                    onChange={(e) =>
                      patch({
                        criteria: {
                          ...form.criteria,
                          [r.id]: {
                            ...form.criteria[r.id],
                            value: e.target.value,
                          },
                        },
                      })
                    }
                  >
                    {Object.entries(ratingNames).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <textarea
                  aria-label={`Preuve : ${r.name}`}
                  className="work-input mt-3"
                  rows={2}
                  placeholder="Fait précis, heure, niveau, règle ou information manquante…"
                  value={form.criteria[r.id].evidence}
                  onChange={(e) =>
                    patch({
                      criteria: {
                        ...form.criteria,
                        [r.id]: {
                          ...form.criteria[r.id],
                          evidence: e.target.value,
                        },
                      },
                    })
                  }
                />
              </section>
            ))}
            <Field label="Critère d’un plan de progression (facultatif)">
              <select
                className="work-input"
                value={form.cycleRevisionId}
                onChange={(e) => patch({ cycleRevisionId: e.target.value })}
              >
                <option value="">Aucun plan associé</option>
                {c.plans.flatMap((p) =>
                  p.revisions
                    .filter((r) => r.content.skill === form.skill)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.content.title} · v{r.version} · {r.content.criterion}
                      </option>
                    )),
                )}
              </select>
            </Field>
            {form.cycleRevisionId && (
              <div className="mt-3">
                <select
                  aria-label="Respect du critère personnalisé"
                  className="work-input"
                  value={form.cycleCriterion.value}
                  onChange={(e) =>
                    patch({
                      cycleCriterion: {
                        ...form.cycleCriterion,
                        value: e.target
                          .value as typeof form.cycleCriterion.value,
                      },
                    })
                  }
                >
                  {Object.entries(ratingNames).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <textarea
                  aria-label="Preuve du critère personnalisé"
                  className="work-input mt-3"
                  value={form.cycleCriterion.evidence}
                  onChange={(e) =>
                    patch({
                      cycleCriterion: {
                        ...form.cycleCriterion,
                        evidence: e.target.value,
                      },
                    })
                  }
                />
              </div>
            )}
            <div className="mt-5 space-y-4">
              {(
                [
                  ["observation", "Observation factuelle"],
                  ["interpretation", "Interprétation personnelle"],
                  ["uncertainty", "Incertitude et explications alternatives"],
                  ["action", "Action proposée et vérification ultérieure"],
                ] as const
              ).map(([k, l]) => (
                <Field key={k} label={l}>
                  <textarea
                    required={k === "observation" || k === "uncertainty"}
                    className="work-input"
                    rows={2}
                    value={form[k]}
                    onChange={(e) => patch({ [k]: e.target.value })}
                  />
                </Field>
              ))}
            </div>
            <details className="my-5 rounded-xl border border-white/10 p-4">
              <summary className="cursor-pointer text-sm">
                Erreurs ou hypothèses à documenter
              </summary>
              <div className="mt-4 space-y-3">
                {MISTAKES.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 text-sm text-zinc-400"
                  >
                    <input
                      type="checkbox"
                      className="accent-emerald-300"
                      checked={form.errors.includes(m.id)}
                      onChange={(e) =>
                        patch({
                          errors: e.target.checked
                            ? [...form.errors, m.id]
                            : form.errors.filter((v) => v !== m.id),
                        })
                      }
                    />
                    {m.name}
                  </label>
                ))}
                <Field label="Erreur personnalisée">
                  <input
                    className="work-input"
                    value={customError}
                    onChange={(e) => setCustomError(e.target.value)}
                  />
                </Field>
                <button
                  type="button"
                  className="text-xs text-emerald-300"
                  onClick={() => {
                    if (customError.trim()) {
                      patch({
                        errors: Array.from(
                          new Set([...form.errors, customError.trim()]),
                        ),
                      });
                      setCustomError("");
                    }
                  }}
                >
                  Ajouter cette étiquette
                </button>
                {form.errors
                  .filter((e) => !MISTAKES.some((m) => m.id === e))
                  .map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() =>
                        patch({ errors: form.errors.filter((v) => v !== e) })
                      }
                      className="mr-2 text-xs text-zinc-300"
                    >
                      {e} ×
                    </button>
                  ))}
                <Field label="Statut de ces erreurs">
                  <select
                    className="work-input"
                    value={form.errorStatus}
                    onChange={(e) =>
                      patch({
                        errorStatus: e.target
                          .value as AssessmentData["errorStatus"],
                      })
                    }
                  >
                    <option value="SUSPECTED">Hypothèse à vérifier</option>
                    <option value="DOCUMENTED">Écart documenté</option>
                    <option value="REFUTED">Hypothèse infirmée</option>
                  </select>
                </Field>
                <Field label="Impact de processus estimé par toi">
                  <select
                    className="work-input"
                    value={form.impact}
                    onChange={(e) =>
                      patch({
                        impact: e.target.value as AssessmentData["impact"],
                      })
                    }
                  >
                    {[
                      ["UNKNOWN", "Inconnu"],
                      ["LOW", "Faible"],
                      ["MEDIUM", "Modéré"],
                      ["HIGH", "Fort"],
                    ].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </details>
            <Button type="submit" color="emerald" disabled={busy || !chosen}>
              {busy
                ? "Enregistrement…"
                : correction
                  ? "Conserver cette correction"
                  : "Enregistrer l’évaluation"}
            </Button>
            {correction && (
              <p className="mt-3 text-xs text-zinc-500">
                L’évaluation précédente reste dans l’historique ; seule sa
                correction alimentera les observations actuelles.
              </p>
            )}
          </Card>
        </form>
      )}
      {tab === "mistakes" && (
        <>
          <Notice>
            Les étiquettes viennent de tes évaluations. « FOMO » ou «
            surconfiance » sont tes hypothèses déclarées, jamais un diagnostic
            psychologique du logiciel.
          </Notice>
          <div className="grid items-start gap-5 lg:grid-cols-2">
            {c.groups.map((g) => {
              const positions = Array.from(
                new Set(
                  g.examples
                    .filter((e) => e.subjectType === "POSITION")
                    .map((e) => e.subjectId),
                ),
              )
                .map((id) => data.positions.find((p) => p.id === id))
                .filter((p) => p?.plan.mode === "REAL" && p.result.closed);
              return (
                <Card key={g.key}>
                  <p className="eyebrow">
                    {g.n >= 2 ? "RÉPÉTITION OBSERVÉE" : "OBSERVATION ISOLÉE"}
                  </p>
                  <h2 className="mt-3 text-xl">{g.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    Tu as associé cette étiquette à {g.n} décision(s)
                    distincte(s), dont {g.hypotheses} évaluation(s) formulée(s)
                    comme hypothèse. Cela mérite une revue des exemples, sans
                    établir la cause d’un résultat.
                  </p>
                  <div className="mt-4 space-y-2">
                    {g.examples.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setSelectedAssessment(a.id);
                          setShowOutcome(false);
                        }}
                        className="block text-left text-xs text-emerald-300 underline"
                      >
                        {labelOf(a)} ·{" "}
                        {new Date(a.createdAt).toLocaleDateString("fr-FR")} ↗
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-xs leading-6 text-zinc-500">
                    {positions.length
                      ? `P&L net des ${positions.length} positions réelles clôturées associées : ${money(positions.reduce((s, p) => s + (p!.result.netUsd??0), 0))}. Ce montant n’est pas une estimation du coût causal de l’erreur.`
                      : "Impact financier non établi. Aucun résultat hypothétique n’est calculé."}
                  </p>
                  <div className="mt-5 rounded-lg bg-emerald-400/5 p-4">
                    <p className="text-xs font-medium text-emerald-200">
                      Piste de travail manuelle
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {g.exercise}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      newPlan(
                        g.skill,
                        g.exercise,
                        g.examples.map((e) => e.id),
                      )
                    }
                    className="mt-5 text-sm text-emerald-300"
                  >
                    Créer une action corrective →
                  </button>
                </Card>
              );
            })}
          </div>
          {!c.groups.length && (
            <Card className="py-12 text-center">
              <p className="text-sm text-zinc-400">
                Aucune erreur documentée. Cela ne prouve pas une absence
                d’erreurs : commence par une évaluation fondée sur une source.
              </p>
            </Card>
          )}
          <Card className="mt-5">
            <h2 className="font-semibold">Hypothèses infirmées conservées</h2>
            {c.assessments
              .filter((a) => a.data.errorStatus === "REFUTED")
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAssessment(a.id)}
                  className="mt-3 block text-sm text-zinc-400"
                >
                  {labelOf(a)} · {a.data.errors.join(", ")} ↗
                </button>
              ))}
          </Card>
        </>
      )}
      {tab === "plans" && (
        <>
          <div className="mb-5 flex justify-end">
            <Button color="emerald" onClick={() => newPlan()}>
              <Plus data-slot="icon" /> Définir une action
            </Button>
          </div>
          {showPlan ? (
            <Card>
              <form onSubmit={submitPlan} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Objectif">
                    <input
                      required
                      className="work-input"
                      value={planForm.title}
                      onChange={(e) =>
                        setPlanForm((f) => ({ ...f, title: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Compétence">
                    <select
                      className="work-input"
                      value={planForm.skill}
                      onChange={(e) =>
                        setPlanForm((f) => ({ ...f, skill: e.target.value }))
                      }
                    >
                      {SKILLS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                {(
                  [
                    ["body", "Faiblesse observée et hypothèse"],
                    ["criterion", "Critère observable à vérifier"],
                    ["action", "Exercice ou action corrective"],
                    ["evidence", "Bilan : résultat observé et limites"],
                  ] as const
                ).map(([k, l]) => (
                  <Field key={k} label={l}>
                    <textarea
                      required={k === "criterion" || k === "action"}
                      rows={3}
                      className="work-input"
                      value={planForm[k]}
                      onChange={(e) =>
                        setPlanForm((f) => ({ ...f, [k]: e.target.value }))
                      }
                    />
                  </Field>
                ))}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Date de prochaine revue">
                    <input
                      type="date"
                      required
                      className="work-input"
                      value={planForm.reviewDate ?? ""}
                      onChange={(e) =>
                        setPlanForm((f) => ({
                          ...f,
                          reviewDate: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="État de l’action">
                    <select
                      className="work-input"
                      value={planForm.status}
                      onChange={(e) =>
                        setPlanForm((f) => ({
                          ...f,
                          status: e.target.value as DocumentContent["status"],
                        }))
                      }
                    >
                      {[
                        ["TESTING", "En cours"],
                        ["COMPLETED", "Action réalisée — bilan consigné"],
                        ["INCONCLUSIVE", "Résultat non concluant"],
                        ["REFUTED", "Hypothèse infirmée"],
                        ["ABANDONED", "Abandonnée"],
                      ].map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="accent-emerald-300"
                    checked={planForm.priority}
                    onChange={(e) =>
                      setPlanForm((f) => ({ ...f, priority: e.target.checked }))
                    }
                  />
                  Ma priorité actuelle (la plus récemment mise à jour apparaît à
                  l’accueil)
                </label>
                <Notice>
                  {planForm.evidenceIds.length} évaluation(s) liée(s). Associe
                  ensuite ce critère aux nouvelles évaluations pour suivre ses
                  observations séparément.
                </Notice>
                <div className="flex gap-3">
                  <Button type="submit" color="emerald" disabled={busy}>
                    Conserver cette version
                  </Button>
                  <Button
                    outline
                    type="button"
                    onClick={() => setShowPlan(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-5">
              {c.plans.map((p) => {
                const r = p.revisions[0],
                  f = r.content,
                  e = skillEvidence(data.assessments, f.skill, p.createdAt),
                  specific = c.assessments.filter(
                    (a) => a.data.cycleRevisionId === r.id,
                  );
                return (
                  <Card key={p.id}>
                    <div className="flex flex-wrap justify-between gap-4">
                      <div>
                        <p className="eyebrow">
                          {skillName(f.skill)} · V{r.version} · {f.status}
                        </p>
                        <h2 className="mt-3 text-xl">{f.title}</h2>
                      </div>
                      <Button
                        outline
                        onClick={() => {
                          setPlanId(p.id);
                          setPlanForm(f);
                          setShowPlan(true);
                        }}
                      >
                        Faire le bilan / corriger
                      </Button>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-zinc-300">
                      {f.criterion}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      {f.action}
                    </p>
                    <p className="mt-4 text-xs text-emerald-200">
                      Revue prévue : {f.reviewDate}
                    </p>
                    <Notice>
                      Depuis la création du plan : {e.before.n} évaluations de
                      cette compétence avant / {e.after.n} après. Elles ne
                      démontrent pas l’effet causal de l’action. Critère
                      personnalisé de cette version :{" "}
                      {
                        specific.filter(
                          (a) => a.data.cycleCriterion?.value === "MET",
                        ).length
                      }{" "}
                      respecté(s),{" "}
                      {
                        specific.filter(
                          (a) => a.data.cycleCriterion?.value === "NOT_MET",
                        ).length
                      }{" "}
                      non respecté(s), sur {specific.length} évaluations liées.
                      Les autres versions ne sont pas mélangées.
                    </Notice>
                    {f.evidence && (
                      <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                        Bilan : {f.evidence}
                      </p>
                    )}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-xs text-zinc-500">
                        Historique des versions et preuves
                      </summary>
                      {p.revisions.map((v) => (
                        <section
                          key={v.id}
                          className="mt-4 border-t border-white/5 pt-3"
                        >
                          <p className="text-xs text-emerald-200">
                            v{v.version} ·{" "}
                            {new Date(v.createdAt).toLocaleString("fr-FR")}
                          </p>
                          <p className="mt-2 text-sm text-zinc-400">
                            {v.content.criterion}
                            <br />
                            {v.content.action}
                            <br />
                            {v.content.evidence}
                          </p>
                          {v.content.evidenceIds.map((id) => (
                            <button
                              key={id}
                              onClick={() => setSelectedAssessment(id)}
                              className="mt-2 block text-xs text-emerald-300"
                            >
                              Consulter la preuve {id.slice(-6)} ↗
                            </button>
                          ))}
                        </section>
                      ))}
                    </details>
                  </Card>
                );
              })}
              {!c.plans.length && (
                <Notice>
                  Aucune action définie. Choisis une compétence et un critère
                  que tu pourras effectivement vérifier à la prochaine revue.
                </Notice>
              )}
            </div>
          )}
        </>
      )}
      {tab === "reviews" && (
        <>
          <Card className="mb-6">
            <h2 className="font-semibold">
              Préparer le bilan avec les données disponibles
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              {
                c.assessments.filter(
                  (a) =>
                    Date.now() - new Date(a.createdAt).getTime() < 7 * 86400000,
                ).length
              }{" "}
              évaluations enregistrées sur 7 jours ·{" "}
              {c.groups.filter((g) => g.n >= 2).length} étiquettes répétées dans
              l’ensemble de l’historique · {c.active.length} actions en cours.
              Ces compteurs servent à sélectionner les exemples, pas à conclure
              à un progrès.
            </p>
            <p className="mt-4 text-sm text-emerald-200">
              Trois questions : quelle décision mérite d’être revue ? Qu’est-ce
              que les preuves montrent réellement ? Quelle unique action vais-je
              vérifier ensuite ?
            </p>
          </Card>
          <Documents kind="REVIEW" />
        </>
      )}
      {selected && (
        <Card className="mt-8 !border-emerald-300/30">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="eyebrow">
                PREUVE CONSERVÉE · {selected.data.rubricVersion}
              </p>
              <h2 className="mt-3 text-xl">{labelOf(selected)}</h2>
              <p className="mt-2 text-xs text-zinc-500">
                {new Date(selected.createdAt).toLocaleString("fr-FR")} ·{" "}
                {selected.timing === "RETROSPECTIVE"
                  ? "Évaluation rétrospective"
                  : "Avant résultat consigné · résultat déclaré non consulté"}
              </p>
            </div>
            <Button outline onClick={() => correct(selected)}>
              Corriger sans effacer
            </Button>
          </div>
          <p className="mt-5 text-sm font-medium text-emerald-200">
            {verdictNames[processVerdict(selected.data.criteria)]}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Qualification de la grille choisie, pas de ta compétence globale.
          </p>
          {RUBRIC.map((r) => (
            <div key={r.id} className="mt-4 border-t border-white/5 pt-3">
              <p className="text-xs text-zinc-400">
                {r.name} · {ratingNames[selected.data.criteria[r.id].value]}
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                {selected.data.criteria[r.id].evidence ||
                  "Information non consignée."}
              </p>
            </div>
          ))}
          {(
            [
              ["observation", "Observation"],
              ["interpretation", "Interprétation"],
              ["uncertainty", "Incertitude"],
              ["action", "Prochaine vérification"],
            ] as const
          ).map(([k, l]) => (
            <div key={k} className="mt-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                {l}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                {selected.data[k] || "Non renseigné"}
              </p>
            </div>
          ))}
          <details className="mt-5">
            <summary className="text-xs text-emerald-300">
              Source figée au moment de l’évaluation
            </summary>
            <div className="mt-3 max-h-80 overflow-auto"><EvidenceView value={selected.snapshot}/></div>
          </details>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={sourceLink(selected)}
              className="text-sm text-emerald-300"
            >
              Ouvrir la source ↗
            </Link>
            <button
              onClick={() =>
                newPlan(selected.data.skill, selected.data.action, [
                  selected.id,
                ])
              }
              className="text-sm text-emerald-300"
            >
              Créer une action corrective →
            </button>
            {selected.subjectType === "POSITION" && (
              <button
                onClick={() => setShowOutcome(!showOutcome)}
                className="text-sm text-zinc-300"
              >
                {showOutcome ? "Masquer" : "Comparer avec"} le résultat
              </button>
            )}
            <button
              onClick={() => setSelectedAssessment(null)}
              className="text-sm text-zinc-500"
            >
              Fermer
            </button>
          </div>
          {showOutcome &&
            selected.subjectType === "POSITION" &&
            (() => {
              const p = data.positions.find((p) => p.id === selected.subjectId);
              if (!p) return null;
              const v = processVerdict(selected.data.criteria);
              return (
                <Notice>
                  {!p.result.closed
                    ? "Position encore ouverte : résultat final non disponible."
                    : `${verdictNames[v]} · ${p.result.net==null ? "résultat net indisponible" : p.result.net > 0 ? "résultat gagnant" : p.result.net != null && p.result.net < 0 ? "résultat perdant" : "résultat neutre"} (${money(p.result.net,p.plan.accountCurrency)}, ${p.plan.mode}).`}{" "}
                  Le résultat financier ne change jamais l’évaluation du
                  processus.
                </Notice>
              );
            })()}
        </Card>
      )}
    </>
  );
}
