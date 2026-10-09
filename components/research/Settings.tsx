"use client";
import { useState, useEffect } from "react";
import {
  Heading,
  Field,
  Notice,
  Loading,
  useWorkspace,
  DownloadLinks,
  money,
} from "./Shared";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/catalyst/button";
import { CatalogManager } from "./CatalogManager";
type Fill = {
  id: string;
  sourceKey: string;
  account: string;
  matchedPositionId: string | null;
  data: {
    coin: string;
    time: string;
    px: string;
    sz: string;
    fee: string;
    feeToken: string;
    dir: string;
    closedPnl: string;
  };
};
export function Settings() {
  const { data, error, reload } = useWorkspace(),
    [amount, setAmount] = useState(""),
    [note, setNote] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [csv, setCsv] = useState(""),
    [account, setAccount] = useState(""),
    [preview, setPreview] = useState<{
      total: number;
      newCount: number;
      duplicates: number;
      rows: Fill[];
    } | null>(null),
    [fills, setFills] = useState<Fill[]>([]),
    [matches, setMatches] = useState<Record<string, string>>({});
  const loadFills = async () => {
    try {
      const r = await fetch("/api/import");
      if (r.ok) setFills(await r.json());
    } catch {}
  };
  useEffect(() => {
    void loadFills();
  }, []);
  async function request(url: string, body: unknown) {
    setBusy(true);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      return j;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Requête impossible");
      return null;
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <>
        <Heading
          tag="ESPACE PRIVÉ / DONNÉES"
          title="Compte & sauvegardes"
          description="Garde la maîtrise de ton historique et de sa provenance."
        />
        <Loading error={error} reload={reload} />
      </>
    );
  return (
    <>
      <Heading
        tag="ESPACE PRIVÉ / DONNÉES"
        title="Compte & sauvegardes"
        description="Capital, exports complets et importations contrôlées. Aucune connexion à un portefeuille n’est nécessaire."
      >
        <DownloadLinks />
      </Heading>
      <CatalogManager/>
      {message && <Notice>{message}</Notice>}
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Compte historique sans affectation · USD</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Capital initial : {money(data.settings.initialCapital)}
          </p>
          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const j = await request("/api/account", {
                action:
                  !data.positions.length &&
                  !data.legacy.length &&
                  !data.adjustments.length
                    ? "initialize"
                    : "cashflow",
                amount: Number(amount),
                note,
              });
              if (j) {
                setMessage("Mouvement enregistré.");
                setAmount("");
                await reload();
              }
            }}
          >
            <Field
              label={
                !data.positions.length &&
                !data.legacy.length &&
                !data.adjustments.length
                  ? "Capital de départ"
                  : "Dépôt (+) ou retrait (−)"
              }
            >
              <input
                type="number"
                step="0.01"
                required
                className="work-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            <Field label="Motif">
              <input
                className="work-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
            <Button type="submit" color="emerald" disabled={busy}>
              Enregistrer
            </Button>
          </form>
          <div className="mt-6 space-y-3">
            {data.adjustments.map((a) => (
              <div key={a.id} className="border-t border-white/10 pt-3 text-sm">
                <div className="flex justify-between">
                  <span>
                    {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="font-mono">{money(a.amount)}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{a.note}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">
            Tes données restent exportables
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Le JSON contient les tables historiques, positions, événements et
            toutes les versions des documents. Le CSV présente les résultats
            clôturés pour tes analyses externes. Les captures hébergées ailleurs
            restent des liens ; les fichiers locaux doivent être sauvegardés
            séparément.
          </p>
          <div className="mt-5">
            <DownloadLinks />
          </div>
          <Notice>
            Avant toute migration de ta base existante : sauvegarde JSON et
            copie PostgreSQL. La restauration fournie refuse les bases contenant
            des données. Le mode local conserve les données dans le dossier
            work/local-database.
          </Notice>
          <Button
            outline
            onClick={async () => {
              await fetch("/api/session", { method: "DELETE" });
              window.location.href = "/login";
            }}
          >
            Déconnexion
          </Button>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="text-xl">Importer des exécutions Hyperliquid</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Import de contrôle, distinct du journal de positions. Colonnes
          requises :{" "}
          <code>tid, coin, time, px, sz, fee, feeToken, dir, closedPnl</code>.
          Le temps doit être en millisecondes Unix ou ISO avec fuseau. Ces
          champs correspondent au modèle userFills documenté ; adapte les
          en-têtes de ton CSV si nécessaire.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Aucun appel à Hyperliquid ni récupération de clé. Les fills ne sont
          pas assimilés automatiquement à des trades complets.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Identifiant stable du compte (adresse ou alias)">
            <input
              className="work-input"
              value={account}
              onChange={(e) => {
                setAccount(e.target.value);
                setPreview(null);
              }}
            />
          </Field>
          <Field label="Fichier CSV · 2 Mo maximum">
            <input
              type="file"
              accept=".csv,text/csv"
              className="work-input"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                setPreview(null);
                setCsv("");
                if (file) {
                  if (file.size > 2000000) {
                    setMessage("Fichier trop volumineux");
                    return;
                  }
                  setCsv(await file.text());
                }
              }}
            />
          </Field>
        </div>
        <div className="mt-5 flex gap-3">
          <Button
            outline
            disabled={busy || !csv || !account}
            onClick={async () => {
              const j = await request("/api/import", {
                action: "preview",
                csv,
                account,
              });
              if (j) setPreview(j);
            }}
          >
            Vérifier le fichier
          </Button>
          {preview && (
            <Button
              color="emerald"
              disabled={busy}
              onClick={async () => {
                const j = await request("/api/import", {
                  action: "commit",
                  csv,
                  account,
                });
                if (j) {
                  setMessage(
                    `${j.imported} exécutions archivées ; ${j.duplicates} doublons ignorés.`,
                  );
                  setPreview(null);
                  await loadFills();
                }
              }}
            >
              Importer les lignes vérifiées
            </Button>
          )}
        </div>
        {preview && (
          <Notice>
            {preview.total} lignes · {preview.newCount} nouvelles ·{" "}
            {preview.duplicates} doublons connus. L’identité repose sur le
            compte et le tid ; conserve le même identifiant de compte pour
            chaque import.
            <pre className="mt-3 max-h-52 overflow-auto text-xs">
              {preview.rows
                .map(
                  (r) =>
                    `${r.data.coin} · ${r.data.dir} · ${r.data.sz} × ${r.data.px} · frais ${r.data.fee} ${r.data.feeToken}`,
                )
                .join("\n")}
            </pre>
          </Notice>
        )}
      </Card>
      <Card className="mt-6">
        <h2 className="font-semibold">
          Réconciliation des exécutions ({fills.length})
        </h2>
        <p className="mt-2 text-xs leading-6 text-zinc-500">
          Rapproche chaque fill d’une position réelle existante après
          vérification de la date, du sens, de la taille et des frais. Le
          rapprochement est une annotation : il ne crée aucun événement
          comptable et ne double pas le P&L.
        </p>
        {fills.map((f) => (
          <div
            key={f.id}
            className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"
          >
            <div>
              <p className="text-sm">
                {f.data.coin} · {f.data.dir} · {f.data.sz} × {f.data.px}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {f.data.time} · frais {f.data.fee} {f.data.feeToken} · P&L
                source {f.data.closedPnl}
              </p>
            </div>
            {f.matchedPositionId ? (
              <span className="text-xs text-emerald-300">
                Rapproché : {f.matchedPositionId}
              </span>
            ) : (
              <div className="flex gap-2">
                <select
                  aria-label={`Position pour ${f.sourceKey}`}
                  className="work-input !w-48"
                  value={matches[f.id] ?? ""}
                  onChange={(e) =>
                    setMatches((v) => ({ ...v, [f.id]: e.target.value }))
                  }
                >
                  <option value="">Choisir la position</option>
                  {data.positions
                    .filter(
                      (p) =>
                        p.plan.mode === "REAL" && p.plan.asset === f.data.coin,
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.plan.asset} · {p.plan.direction} ·{" "}
                        {p.plan.datetime.slice(0, 10)}
                      </option>
                    ))}
                </select>
                <Button
                  outline
                  disabled={busy || !matches[f.id]}
                  onClick={async () => {
                    const j = await request("/api/import", {
                      action: "match",
                      id: f.id,
                      positionId: matches[f.id],
                    });
                    if (j) await loadFills();
                  }}
                >
                  Lier
                </Button>
              </div>
            )}
          </div>
        ))}
        {!fills.length && (
          <p className="py-8 text-sm text-zinc-500">
            Aucune exécution importée.
          </p>
        )}
      </Card>
    </>
  );
}
