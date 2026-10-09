"use client";
import Link from "next/link";
import { Plus, ArrowUpRight, FlaskConical } from "lucide-react";
import { Heading, Notice, Loading, useWorkspace, money, num } from "./Shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/catalyst/button";
import { account, observations, performance } from "@/lib/research/metrics";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { AccountOverview } from "./AccountOverview";
export function Overview() {
  const { data, error, reload } = useWorkspace();
  if (!data)
    return (
      <>
        <Heading
          tag="TRADING RESEARCH & PERFORMANCE"
          title="Vue d’ensemble"
          description="Ton poste de travail pour préparer, documenter et mesurer."
        />
        <Loading error={error} reload={reload} />
      </>
    );
  const a = account(data),
    s = performance(observations(data).filter((t) => t.mode === "REAL" && t.accountId === "LEGACY")),
    recent = observations(data)
      .filter((t) => t.mode === "REAL" && t.accountId === "LEGACY")
      .slice(-5)
      .reverse(),
    versions = data.documents.filter((d) => d.kind === "STRATEGY").length;
  return (
    <>
      <Heading
        tag="TRADING RESEARCH & PERFORMANCE"
        title="Vue d’ensemble"
        description="Des décisions documentées. Des résultats mesurés. Une méthode qui évolue."
      >
        <Button href="/trades" color="emerald">
          <Plus data-slot="icon" /> Enregistrer une position
        </Button>
      </Heading>
      <AccountOverview data={data}/>
      <h2 className="my-5 text-lg">Compte historique · positions sans affectation · USD</h2>
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="capital-panel rounded-2xl border border-emerald-300/20 p-7">
          <div className="flex justify-between gap-3">
            <p className="eyebrow">CAPITAL RECONSTITUÉ · USD</p>
            <span className="text-xs text-emerald-300">Journal personnel</span>
          </div>
          <p className="mt-6 break-words font-mono text-4xl tracking-tight sm:text-5xl">
            {money(a.capital)}
          </p>
          <p className="mt-4 text-sm text-zinc-400">
            Capital initial + mouvements + résultats réalisés du compte historique sans affectation
          </p>
          <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-xs text-zinc-500">
                P&L réalisé · réel + historique v0
              </p>
              <p
                className={`mt-2 font-mono text-xl ${a.realized < 0 ? "text-red-300" : "text-emerald-300"}`}
              >
                {money(a.realized)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">P&L non réalisé · manuel</p>
              <p className="mt-2 font-mono text-xl">{money(a.unrealized)}</p>
            </div>
          </div>
        </section>
        <Card className="flex flex-col justify-between !p-7">
          <div>
            <FlaskConical size={22} className="text-emerald-300" />
            <h2 className="mt-4 text-2xl font-medium">
              Ta méthode est
              <br />
              un travail de recherche.
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {versions} fiche(s) de stratégie. Sépare les hypothèses, les tests
              et les observations avant de modifier tes règles.
            </p>
          </div>
          <Link
            href="/protocol"
            className="mt-6 flex justify-between border-t border-white/10 pt-4 text-sm text-emerald-300"
          >
            Ouvrir le laboratoire <ArrowUpRight size={18} />
          </Link>
        </Card>
      </div>
      {(a.unknownPnl>0||a.unknownRisk>0)&&<Notice>Compte historique incomplet : {a.unknownPnl} résultats non évaluables et {a.unknownRisk} risques inconnus.</Notice>}
      {Math.abs(a.reconciliation) > 0.01 && (
        <Notice error>
          Écart de rapprochement historique : {money(a.reconciliation)} entre le
          capital déclaré et le capital reconstitué. Vérifie les apports,
          retraits et anciennes saisies avant d’interpréter le solde.
        </Notice>
      )}
      <div className="my-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          [
            "Espérance réalisée",
            `${num(s.meanR)} R`,
            `${s.rCount} trades réels avec R renseigné`,
          ],
          ["Profit factor", s.profitFactor == null ? "—" : Number.isFinite(s.profitFactor) ? num(s.profitFactor) : "Sans perte observée", "Trades réels clôturés"],
          [
            "Taux de réussite",
            `${num(s.winRate, 1)} %`,
            `${s.n} trades réels clôturés`,
          ],
          [
            "Risque de prix engagé",
            money(a.openRisk),
            "Aux stops · hors coûts futurs et gaps",
          ],
        ].map(([l, v, n]) => (
          <Card key={l}>
            <p className="text-xs text-zinc-400">{l}</p>
            <p className="mt-3 font-mono text-2xl">{v}</p>
            <p className="mt-2 text-xs text-zinc-500">{n}</p>
          </Card>
        ))}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex justify-between gap-4">
            <div>
              <h2 className="font-semibold">Courbe de résultats cumulés</h2>
              <p className="mt-2 text-xs text-zinc-500">
                Capital initial + P&L réalisé · apports/retraits exclus · réel +
                v0
              </p>
            </div>
            <span className="text-xs text-zinc-500">Tout l’historique</span>
          </div>
          <div className="mt-6 h-64">
            {a.curve.length > 1 ? (
              <EquityCurve data={a.curve} initialCapital={a.initial} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-center text-sm text-zinc-500">
                Aucun résultat réalisé enregistré.
                <br />
                Tes données apparaîtront ici.
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-6 border-t border-white/10 pt-4 text-xs text-zinc-400">
            <span>
              Drawdown courant : {a.initial > 0 ? `${num(a.currentDD)} %` : "—"}
            </span>
            <span>
              Maximum : {a.initial > 0 ? `${num(a.maxDDPct)} %` : "—"}
            </span>
            <span>Hors valorisation des positions ouvertes</span>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Ton cycle de travail</h2>
          {[
            ["01", "Préparer", "Scénarios et contexte de marché", "/journal"],
            ["02", "Exécuter", "Position et gestion du risque", "/trades"],
            ["03", "Mesurer", "Résultats et groupes de trades", "/analytics"],
            ["04", "Apprendre", "Revues et actions correctives", "/progress"],
          ].map(([n, t, d, url]) => (
            <Link
              key={n}
              href={url}
              className="mt-5 flex items-start gap-4 border-t border-white/5 pt-4"
            >
              <span className="font-mono text-xs text-emerald-300">{n}</span>
              <div>
                <p className="text-sm font-medium">{t}</p>
                <p className="mt-1 text-xs text-zinc-500">{d}</p>
              </div>
            </Link>
          ))}
        </Card>
      </div>
      <Card className="mt-6">
        <div className="mb-5 flex justify-between">
          <h2 className="font-semibold">Derniers résultats réels</h2>
          <Link href="/trades" className="text-sm text-emerald-300">
            Toutes les positions →
          </Link>
        </div>
        {recent.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 py-4"
          >
            <div>
              <p className="text-sm">
                {r.asset}{" "}
                <span className="text-xs text-zinc-500">· {r.direction}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {r.setup} · {new Date(r.date).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <p
              className={`font-mono text-sm ${r.net < 0 ? "text-red-300" : "text-emerald-300"}`}
            >
              {money(r.net)}{" "}
              <span className="text-zinc-500">/ {num(r.r)} R</span>
            </p>
          </div>
        ))}
        {!recent.length && (
          <p className="py-6 text-sm text-zinc-500">
            Pas encore de position réelle clôturée. Les trades paper et
            backtests restent dans leurs propres analyses.
          </p>
        )}
      </Card>
      <Notice>
        {s.n} observations réelles clôturées. Aucun avantage durable n’est
        déduit automatiquement. Le capital est un solde de journal, non un solde
        synchronisé au courtier. Les valorisations manuelles conservent leur
        source et leur date dans chaque fiche.
      </Notice>
    </>
  );
}
