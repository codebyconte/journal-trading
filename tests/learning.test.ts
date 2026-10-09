import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assessmentSchema,
  processVerdict,
  latestAssessments,
  mistakeGroups,
  skillEvidence,
  type Assessment,
} from "../lib/research/learning";
const criteria = {
  analysis: { value: "MET", evidence: "Contexte daté précis" },
  plan: { value: "MET", evidence: "Invalidation écrite" },
  execution: { value: "MET", evidence: "Entrée après confirmation" },
  rules: { value: "NA", evidence: "Pas de stratégie appliquée" },
};
function row(
  id: string,
  patch: Record<string, unknown> = {},
  top: Partial<Assessment> = {},
): Assessment {
  return {
    id,
    createdAt: "2026-01-01T00:00:00.000Z",
    subjectType: "POSITION",
    subjectId: "p1",
    revisionId: null,
    supersedesId: null,
    timing: "RETROSPECTIVE",
    snapshot: {},
    data: assessmentSchema.parse({
      requestId: "00000000-0000-4000-8000-000000000001",
      subjectType: "POSITION",
      subjectId: "p1",
      skill: "entry",
      decision: "ENTER",
      criteria,
      observation: "Observation datée",
      uncertainty: "Régime et liquidité non contrôlés",
      ...patch,
    }),
    ...top,
  };
}
test("process verdict never receives or uses PnL", () => {
  const a = row("a");
  assert.equal(processVerdict(a.data.criteria), "SOUND");
  const b = row("b", {
    criteria: {
      ...criteria,
      plan: { value: "NOT_MET", evidence: "Stop absent avant entrée" },
    },
  });
  assert.equal(processVerdict(b.data.criteria), "REVIEW");
});
test("unknown is not failure and NA alone is insufficient", () => {
  assert.equal(
    processVerdict(
      row("a", {
        criteria: { ...criteria, analysis: { value: "UNKNOWN", evidence: "" } },
      }).data.criteria,
    ),
    "INSUFFICIENT",
  );
  const na = Object.fromEntries(
    Object.keys(criteria).map((k) => [
      k,
      { value: "NA", evidence: "Critère non applicable" },
    ]),
  );
  assert.equal(
    processVerdict(row("b", { criteria: na }).data.criteria),
    "INSUFFICIENT",
  );
});
test("evidence required for every rating, including NA", () => {
  assert.throws(() =>
    row("a", {
      criteria: { ...criteria, plan: { value: "MET", evidence: "" } },
    }),
  );
  assert.throws(() => row("a", { uncertainty: "" }));
});
test("corrections retain history but do not inflate repeated mistakes", () => {
  const a = row("a", { errors: ["EARLY_ENTRY"] }),
    b = row(
      "b",
      { errors: ["EARLY_ENTRY"] },
      { supersedesId: "a", createdAt: "2026-02-01T00:00:00.000Z" },
    );
  assert.equal(latestAssessments([a, b]).length, 1);
  assert.equal(mistakeGroups([a, b])[0].n, 1);
  const corrected = row(
    "c",
    { errors: ["EARLY_ENTRY"], errorStatus: "REFUTED" },
    { supersedesId: "b", createdAt: "2026-03-01T00:00:00.000Z" },
  );
  assert.equal(mistakeGroups([a, b, corrected]).length, 0);
  assert.equal([a, b, corrected].length, 3);
});
test("same decision evaluated in two skills remains one mistake example count", () => {
  const a = row("a", { errors: ["FOMO"] }),
    b = row("b", { skill: "discipline", errors: ["FOMO"] });
  assert.equal(mistakeGroups([a, b])[0].n, 1);
});
test("a retrospective correction does not move a decision into post-training sample", () => {
  const a = row("a"),
    b = row(
      "b",
      {},
      { createdAt: "2026-03-01T00:00:00.000Z", supersedesId: "a" },
    );
  const e = skillEvidence([a, b], "entry", "2026-02-01T00:00:00.000Z");
  assert.equal(e.before.n, 1);
  assert.equal(e.after.n, 0);
});
test("abstention may have a sound process without financial outcome", () => {
  const a = row("a", {
    decision: "NO_TRADE",
    criteria: {
      ...criteria,
      execution: { value: "NA", evidence: "Pas de position exécutée" },
    },
  });
  assert.equal(processVerdict(a.data.criteria), "SOUND");
});
