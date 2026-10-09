"use client";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Heading, Loading, useWorkspace, money, num, Notice } from "./Shared";
import { Card } from "@/components/ui/Card";
import { NextImprovement, coachData } from "./Learning";
import { account, observations, performance } from "@/lib/research/metrics";
import { portfolioRisk,accounts } from "@/lib/research/accounts";
export function Home() {
  const { data, error, reload } = useWorkspace();
  if (!data)
    return (
      <>
        <Heading
          tag="MON ENVIRONNEMENT DE PROGRESSION"
          title="Mieux décider, pas plus trader"
          description="Observer, identifier une faiblesse, tester une correction et revenir aux preuves."
        />
        <Loading error={error} reload={reload} />
      </>
    );
  const c = coachData(data),
    a = account(data), risk=portfolioRisk(data),
    s = performance(observations(data).filter((t) => t.mode === "REAL"));
  return (
    <>
      <Heading
        tag="MON ENVIRONNEMENT DE PROGRESSION"
        title="La prochaine décision se prépare"
        description="Observer → Identifier → Formuler une hypothèse → S’entraîner → Mesurer → Corriger."
      />
      <NextImprovement data={data} />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Revenir à une décision</h2>
            <Link
              href="/progress?tab=evaluate"
              className="text-xs text-emerald-300"
            >
              Évaluer →
            </Link>
          </div>
          <p className="mt-3 text-xs leading-6 text-zinc-500">
            Le résultat peut attendre. Commence par vérifier les informations et
            les critères disponibles à la décision.
          </p>
          {c.pendingPositions.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              href={`/trades?position=${p.id}`}
              className="mt-4 flex justify-between border-t border-white/5 pt-4 text-sm"
            >
              <span>
                {p.plan.asset} · {p.plan.direction}
                <span className="ml-2 text-xs text-zinc-500">
                  {p.plan.mode}
                </span>
              </span>
              <span className="text-zinc-500">Sans évaluation ↗</span>
            </Link>
          ))}
          {c.pendingDocs.slice(0, 3).map((d) => (
            <Link
              key={d.id}
              href={`${d.kind === "WATCH" ? "/watchlist" : "/journal"}?document=${d.id}`}
              className="mt-4 block border-t border-white/5 pt-4 text-sm text-zinc-300"
            >
              {d.revisions[0].content.title}{" "}
              <span className="text-zinc-500">· analyse à revoir ↗</span>
            </Link>
          ))}
          {!c.pendingDocs.length && !c.pendingPositions.length && (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 p-5">
              <p className="text-sm text-zinc-400">
                Aucune décision en attente d’évaluation.
              </p>
              <Link
                href="/journal"
                className="mt-3 inline-block text-sm text-emerald-300"
              >
                Consigner une observation sans trader →
              </Link>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">
            Ce que tes observations permettent de dire
          </h2>
          {c.groups[0] ? (
            <>
              <p className="mt-4 text-sm leading-7 text-zinc-300">
                Tu as documenté « {c.groups[0].name} » sur {c.groups[0].n}{" "}
                décision(s) distincte(s).
              </p>
              <p className="mt-3 text-xs leading-6 text-zinc-500">
                {c.groups[0].n < 2
                  ? "Il s’agit d’une observation isolée."
                  : "L’étiquette se répète dans les décisions évaluées."}{" "}
                Cela ne prouve ni une cause des pertes ni un trait
                psychologique.
              </p>
              <Link
                href="/progress?tab=mistakes"
                className="mt-5 inline-flex items-center gap-2 text-sm text-emerald-300"
              >
                Examiner les preuves <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Pas encore d’erreur suffisamment documentée pour proposer une
              piste ciblée. Une évaluation sourcée est plus utile qu’une
              conclusion automatique.
            </p>
          )}
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs text-zinc-500">
              {c.assessments.length} évaluations actuelles · aucune note globale
              de maîtrise
            </p>
            <Link
              href="/progress?tab=reviews"
              className="mt-3 inline-block text-sm text-emerald-300"
            >
              Préparer ma revue hebdomadaire →
            </Link>
          </div>
        </Card>
      </div>
      <Card className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">
            Risque & performance · repères compacts
          </h2>
          <Link href="/performance" className="text-xs text-emerald-300">
            Détail du compte et des résultats ↗
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {[
            ["Risque de prix engagé", money(risk.knownUsd)],
            ["Comptes configurés", String(accounts(data).length)],
            ["Espérance · réel clôturé", `${num(s.meanR)} R`],
            ["Échantillon réel", `${s.n} trades`],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-xs text-zinc-500">{l}</p>
              <p className="mt-2 font-mono text-xl">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-zinc-500">
          Risque connu converti en USD : {risk.unknown} position(s) avec risque ou conversion manquants. Capital du journal, non synchronisé au courtier. Risque aux stops hors
          gaps et coûts futurs. Les performances ne notent pas la qualité de tes
          décisions.
        </p>
      </Card>
      <Notice>
        Les pistes de travail reposent sur tes saisies et des règles explicites.
        Elles sont des hypothèses de conception à réexaminer, pas une méthode
        scientifiquement validée pour rendre un trader rentable.
      </Notice>
    </>
  );
}
