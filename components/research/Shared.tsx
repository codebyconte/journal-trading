"use client";
import { Children, cloneElement, isValidElement, useCallback, useEffect, useState } from "react";
import type { Workspace } from "@/lib/research/data";
export const money = (n: number | null | undefined, currency = "USD") => {
  if (n == null) return "—";
  try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n); }
  catch { return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${currency}`; }
};
export const num = (n: number | null | undefined, d = 2) =>
  n == null
    ? "—"
    : Number.isFinite(n)
      ? n.toLocaleString("fr-FR", { maximumFractionDigits: d })
      : "∞";
export function useWorkspace() {
  const [data, setData] = useState<Workspace | null>(null),
    [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      const r = await fetch("/api/workspace", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setData(j);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible");
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, reload };
}
export async function save(body: unknown) {
  const r = await fetch("/api/workspace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error);
  return j;
}
export function Heading({
  tag,
  title,
  description,
  children,
}: {
  tag: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{tag}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
          <span className="text-emerald-400">.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          {description}
        </p>
      </div>
      {children}
    </header>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm text-zinc-300">
      <span>{label}</span>
      <div className="mt-2">{Children.map(children, child => isValidElement(child) && ["input", "select", "textarea"].includes(String(child.type)) ? cloneElement(child as React.ReactElement<{ "aria-label"?: string }>, { "aria-label": label }) : child)}</div>
      {hint && <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>}
    </label>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`my-4 rounded-xl border p-4 text-sm leading-6 ${error ? "border-red-400/20 bg-red-400/5 text-red-300" : "border-white/10 bg-white/[.02] text-zinc-400"}`}
    >
      {children}
    </div>
  );
}
export function Loading({
  error,
  reload,
}: {
  error: string;
  reload: () => void;
}) {
  return (
    <Notice error={!!error}>
      {error || "Chargement de ton espace…"}
      {error && (
        <button onClick={reload} className="ml-4 text-emerald-300 underline">
          Réessayer
        </button>
      )}
    </Notice>
  );
}
export function DownloadLinks() {
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <a className="text-emerald-300" href="/api/export?format=json">
        Sauvegarde JSON ↗
      </a>
      <a className="text-zinc-300" href="/api/export?format=csv">
        Export CSV ↗
      </a>
    </div>
  );
}
