import { parse } from "csv-parse/sync";
import { z } from "zod";
const fill = z.object({
  tid: z.string().regex(/^\d+$/),
  coin: z.string().min(1).max(80),
  time: z.string().min(1),
  px: z.string().refine((v) => Number.isFinite(Number(v)) && Number(v) > 0),
  sz: z.string().refine((v) => Number.isFinite(Number(v)) && Number(v) > 0),
  fee: z.string().refine((v) => Number.isFinite(Number(v))),
  feeToken: z.string().min(1).max(30),
  dir: z.string().min(1).max(60),
  closedPnl: z.string().refine((v) => Number.isFinite(Number(v))),
});
export function parseFills(csv: string, account: string) {
  if (!account.trim() || account.length > 100)
    throw new Error("Identifiant de compte requis (100 caractères maximum)");
  if (csv.length > 2000000) throw new Error("CSV limité à 2 Mo");
  const raw = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    max_record_size: 10000,
  });
  if (!raw.length || raw.length > 5000)
    throw new Error("Import limité à 1–5000 lignes");
  const seen = new Set<string>();
  return raw.map((r: unknown, i: number) => {
    const f = fill.parse(r);
    let time = Number(f.time);
    if (!/^\d+$/.test(f.time)) {
      if (!/(Z|[+-]\d{2}:\d{2})$/.test(f.time))
        throw new Error(`Ligne ${i + 2} : fuseau explicite requis`);
      time = new Date(f.time).getTime();
    }
    if (!Number.isFinite(time) || time < 0 || time > Date.now())
      throw new Error(`Ligne ${i + 2} : date invalide`);
    const key = `hyperliquid:${account.trim().toLowerCase()}:${f.tid}`;
    if (seen.has(key))
      throw new Error(
        `Ligne ${i + 2} : identifiant tid dupliqué dans le fichier`,
      );
    seen.add(key);
    return {
      sourceKey: key,
      account: account.trim().toLowerCase(),
      data: { ...f, time: new Date(time).toISOString() },
    };
  });
}
