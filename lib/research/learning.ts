import { z } from "zod";
export const SKILLS = [
  {
    id: "structure",
    domain: "Analyse des marchés",
    name: "Structure de marché",
    criterion:
      "Identifier la structure et les niveaux qui invalident cette lecture.",
  },
  {
    id: "regime",
    domain: "Analyse des marchés",
    name: "Tendance et régime",
    criterion:
      "Décrire le régime avec des observations datées, puis considérer un régime alternatif.",
  },
  {
    id: "invalidation",
    domain: "Analyse des marchés",
    name: "Niveaux et invalidation",
    criterion:
      "Définir un niveau ou une condition observable qui invalide le scénario.",
  },
  {
    id: "volatility",
    domain: "Analyse des marchés",
    name: "Volatilité",
    criterion:
      "Distinguer direction et volatilité ; expliciter la mesure et la période utilisées.",
  },
  {
    id: "timeframes",
    domain: "Analyse des marchés",
    name: "Analyse multi-timeframe",
    criterion:
      "Séparer contexte Daily, exécution 4H et informations contradictoires.",
  },
  {
    id: "macro",
    domain: "Macroéconomie",
    name: "Publications et anticipations",
    criterion:
      "Séparer valeur publiée, consensus, révisions et anticipations déjà intégrées.",
  },
  {
    id: "rates",
    domain: "Macroéconomie",
    name: "Taux, politique et liquidité",
    criterion:
      "Documenter un scénario de transmission et ses limites, avec des sources datées.",
  },
  {
    id: "scenarios",
    domain: "Macroéconomie",
    name: "Scénarios sous incertitude",
    criterion:
      "Écrire un scénario alternatif et les faits qui feraient changer d’avis.",
  },
  {
    id: "onchain",
    domain: "On-chain et dérivés",
    name: "Métriques Bitcoin",
    criterion:
      "Préciser population, horizon, fréquence et limite de la métrique utilisée.",
  },
  {
    id: "derivatives",
    domain: "On-chain et dérivés",
    name: "Spot, funding et OI",
    criterion:
      "Séparer positions et flux, spot et dérivés, coût de portage et direction du prix.",
  },
  {
    id: "contradiction",
    domain: "On-chain et dérivés",
    name: "Signaux contradictoires",
    criterion:
      "Consigner au moins un élément contraire et préciser ce qu’il changerait.",
  },
  {
    id: "setup",
    domain: "Trading",
    name: "Qualité du setup",
    criterion:
      "Nommer le déclencheur, le contexte applicable et les conditions d’abstention.",
  },
  {
    id: "entry",
    domain: "Trading",
    name: "Justification de l’entrée",
    criterion:
      "Comparer l’instant d’entrée à la confirmation réellement prévue dans le plan.",
  },
  {
    id: "risk",
    domain: "Trading",
    name: "Gestion du risque",
    criterion:
      "Vérifier quantité, multiplicateur, stop, coûts et risque cumulé avant l’entrée.",
  },
  {
    id: "execution",
    domain: "Trading",
    name: "Exécution et gestion",
    criterion:
      "Justifier chaque modification du plan avec les informations alors disponibles.",
  },
  {
    id: "discipline",
    domain: "Trading",
    name: "Respect des règles applicables",
    criterion:
      "Évaluer uniquement les règles de la version choisie ; documenter les écarts.",
  },
  {
    id: "review",
    domain: "Trading",
    name: "Qualité de la revue",
    criterion:
      "Séparer observation, interprétation, incertitude et prochaine vérification.",
  },
] as const;
export const MISTAKES = [
  {
    id: "EARLY_ENTRY",
    name: "Entrée trop précoce",
    skill: "entry",
    exercise:
      "Reprendre trois plans datés. Cacher le résultat et relever l’heure de confirmation prévue puis l’heure d’entrée. Écrire ce qui autorisait ou non l’entrée.",
  },
  {
    id: "FOMO",
    name: "FOMO déclaré",
    skill: "discipline",
    exercise:
      "Comparer deux occasions prises et une laissée passer. Décrire le déclencheur écrit avant la décision et les informations disponibles.",
  },
  {
    id: "TREND",
    name: "Lecture de tendance à revoir",
    skill: "regime",
    exercise:
      "Annoter structure et régime sur trois captures arrêtées à la date de décision. Écrire une lecture alternative avant de consulter la suite.",
  },
  {
    id: "MACRO",
    name: "Contexte macro méconnu",
    skill: "macro",
    exercise:
      "Choisir une publication passée. Distinguer consensus, publication et révision à partir des sources, puis lister deux explications possibles de la réaction.",
  },
  {
    id: "CONFIRMATION",
    name: "Arguments contraires négligés",
    skill: "contradiction",
    exercise:
      "Reprendre deux thèses initiales et écrire un argument contraire vérifiable pour chacune, sans utiliser la suite du marché.",
  },
  {
    id: "OVERCONFIDENCE",
    name: "Surconfiance déclarée",
    skill: "scenarios",
    exercise:
      "Relire une analyse et remplacer les affirmations certaines par des scénarios et leurs invalidations observables.",
  },
  {
    id: "STOP",
    name: "Stop mal justifié",
    skill: "invalidation",
    exercise:
      "Expliquer l’invalidation de trois plans sans regarder le résultat. Distinguer invalidation structurelle et simple distance de risque.",
  },
  {
    id: "RISK",
    name: "Risque excessif déclaré",
    skill: "risk",
    exercise:
      "Recalculer taille et coûts de trois positions avec le simulateur. Comparer au budget initial documenté, sans chercher un rendement cible.",
  },
  {
    id: "PLAN_CHANGE",
    name: "Modification injustifiée du plan",
    skill: "execution",
    exercise:
      "Reprendre chaque changement d’une position et noter l’information nouvelle qui le justifiait à cet instant.",
  },
  {
    id: "EXIT",
    name: "Sortie émotionnelle déclarée",
    skill: "execution",
    exercise:
      "Comparer le plan de sortie initial à la décision effective, puis formuler une règle observable pour la prochaine revue.",
  },
  {
    id: "INDICATOR",
    name: "Surinterprétation d’un indicateur",
    skill: "onchain",
    exercise:
      "Préciser ce que la métrique mesure, ce qu’elle ne mesure pas, sa fréquence et deux interprétations concurrentes.",
  },
] as const;
export const RUBRIC = [
  {
    id: "analysis",
    name: "Analyse initiale",
    criterion:
      "Contexte disponible et éléments contraires explicités ; distinguer faits et interprétations.",
  },
  {
    id: "plan",
    name: "Qualité du plan",
    criterion:
      "Conditions d’entrée ou d’abstention, invalidation et risque formulés de manière vérifiable.",
  },
  {
    id: "execution",
    name: "Exécution",
    criterion:
      "Décision effective comparée au plan ; tout changement expliqué avec des informations datées.",
  },
  {
    id: "rules",
    name: "Règles applicables",
    criterion:
      "Écart évalué seulement par rapport à la version de stratégie ou aux critères explicitement choisis.",
  },
] as const;
const rating = z
  .object({
    value: z.enum(["MET", "NOT_MET", "UNKNOWN", "NA"]),
    evidence: z.string().max(4000).default(""),
  })
  .superRefine((v, c) => {
    if (v.value !== "UNKNOWN" && v.evidence.trim().length < 5)
      c.addIssue({
        code: "custom",
        message:
          "Chaque critère évalué ou non applicable nécessite une justification concrète.",
      });
  });
export const assessmentSchema = z.object({
  requestId: z.string().uuid(),
  subjectType: z.enum(["POSITION", "DOCUMENT"]),
  subjectId: z.string().min(1),
  revisionId: z.string().optional(),
  supersedesId: z.string().optional(),
  cycleRevisionId: z.string().optional(),
  cycleCriterion: rating.optional(),
  rubricVersion: z.literal("process-v1").default("process-v1"),
  skill: z
    .string()
    .refine((v) => SKILLS.some((s) => s.id === v), "Compétence inconnue"),
  criteria: z.object({
    analysis: rating,
    plan: rating,
    execution: rating,
    rules: rating,
  }),
  decision: z.enum(["ENTER", "WAIT", "NO_TRADE", "MANAGE", "REVIEW"]),
  errors: z.array(z.string().trim().min(1).max(100)).max(15).default([]),
  errorStatus: z
    .enum(["SUSPECTED", "DOCUMENTED", "REFUTED"])
    .default("SUSPECTED"),
  impact: z.enum(["UNKNOWN", "LOW", "MEDIUM", "HIGH"]).default("UNKNOWN"),
  observation: z.string().trim().min(5).max(5000),
  interpretation: z.string().max(5000).default(""),
  uncertainty: z.string().trim().min(5).max(3000),
  action: z.string().max(3000).default(""),
  knownOutcome: z.boolean().default(false),
});
export type AssessmentData = z.infer<typeof assessmentSchema>;
export type Assessment = {
  id: string;
  createdAt: string;
  subjectType: string;
  subjectId: string;
  revisionId: string | null;
  supersedesId: string | null;
  timing: string;
  snapshot: unknown;
  data: AssessmentData;
};
export function processVerdict(criteria: AssessmentData["criteria"]) {
  const rows = Object.values(criteria);
  if (rows.some((r) => r.value === "NOT_MET")) return "REVIEW";
  if (rows.some((r) => r.value === "UNKNOWN")) return "INSUFFICIENT";
  if (rows.filter((r) => r.value === "MET").length >= 2) return "SOUND";
  return "INSUFFICIENT";
}
export function latestAssessments(rows: Assessment[]) {
  const superseded = new Set(
    rows.flatMap((r) => (r.supersedesId ? [r.supersedesId] : [])),
  );
  const latest = new Map<string, Assessment>();
  for (const row of [...rows].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )) {
    if (superseded.has(row.id)) continue;
    const key = `${row.subjectType}:${row.subjectId}:${row.revisionId ?? ""}:${row.data.skill}`;
    latest.set(key, row);
  }
  return [...latest.values()];
}
export function mistakeGroups(rows: Assessment[]) {
  const selected = latestAssessments(rows).filter(
    (r) => r.data.errorStatus !== "REFUTED",
  );
  const keys = Array.from(new Set(selected.flatMap((r) => r.data.errors)));
  return keys
    .map((key) => {
      const examples = selected.filter((r) => r.data.errors.includes(key));
      const uniqueSubjects = new Set(
        examples.map((r) => `${r.subjectType}:${r.subjectId}`),
      );
      const template = MISTAKES.find((m) => m.id === key);
      return {
        key,
        name: template?.name ?? key,
        skill: template?.skill ?? examples[0].data.skill,
        n: uniqueSubjects.size,
        examples,
        exercise:
          template?.exercise ??
          "Reprendre les exemples cités et définir un critère observable avant la prochaine décision.",
        hypotheses: examples.filter((r) => r.data.errorStatus === "SUSPECTED")
          .length,
      };
    })
    .sort((a, b) => b.n - a.n);
}
export function skillEvidence(
  rows: Assessment[],
  skill: string,
  cutoff?: string,
) {
  const selected = latestAssessments(rows).filter(
    (r) => r.data.skill === skill,
  );
  const firstSeen = (r: Assessment) =>
    rows
      .filter(
        (a) =>
          a.subjectType === r.subjectType &&
          a.subjectId === r.subjectId &&
          a.revisionId === r.revisionId &&
          a.data.skill === r.data.skill,
      )
      .map((a) => a.createdAt)
      .sort()[0] ?? r.createdAt;
  const summarize = (r: Assessment[]) => ({
    n: r.length,
    sound: r.filter((v) => processVerdict(v.data.criteria) === "SOUND").length,
    review: r.filter((v) => processVerdict(v.data.criteria) === "REVIEW")
      .length,
    unknown: r.filter((v) => processVerdict(v.data.criteria) === "INSUFFICIENT")
      .length,
    ids: r.map((v) => v.id),
  });
  return {
    all: summarize(selected),
    before: summarize(
      cutoff ? selected.filter((r) => firstSeen(r) < cutoff) : [],
    ),
    after: summarize(
      cutoff ? selected.filter((r) => firstSeen(r) >= cutoff) : [],
    ),
  };
}
