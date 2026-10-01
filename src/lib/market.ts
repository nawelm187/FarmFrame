export interface Stat { median: number; min: number; max: number; volume: number }
export const slugOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase";
/** Goes through our own Supabase Edge Function (supabase/functions/market), because warframe.market blocks direct browser calls. */
export const MARKET_URL = (slug: string) => `${SUPABASE_URL}/functions/v1/market?slug=${slug}`;
/** Latest closed 48h bucket, only if every figure is a real number. Anything else is "no data", never a guess. */
export function parseStats(d: unknown, rank?: number): Stat | null {
  const p = (d as { payload?: { statistics_closed?: Record<string, unknown> } } | null)?.payload?.statistics_closed?.["48hours"];
  if (!Array.isArray(p) || !p.length) return null;
  let rows = p as Record<string, unknown>[];
  if (rank !== undefined && rows.some(r => r && typeof r === "object" && "mod_rank" in r)) { rows = rows.filter(r => r?.mod_rank === rank); if (!rows.length) return null; }
  const x = rows[rows.length - 1], n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const median = n(x?.median ?? x?.avg_price), min = n(x?.min_price), max = n(x?.max_price), volume = n(x?.volume);
  return median != null && min != null && max != null && volume != null ? { median, min, max, volume } : null;
}
// Needs the Edge Function deployed; if it is not, the button reports the market as unavailable.
export const MARKET_ENABLED = true;
/** Market slugs differ for parts: "Ash Prime Chassis Blueprint" is listed as "ash_prime_chassis", while "Ash Prime Blueprint" keeps its suffix. Try both. */
export const candidates = (name: string) => [...new Set([slugOf(name), slugOf(name.replace(/\s+Blueprint$/i, ""))])];
/** Stats for the first slug the market knows. Returns null if none is listed; throws only on network or server errors. */
export async function fetchStat(name: string, signal?: AbortSignal, rank?: number): Promise<Stat | null> {
  for (const slug of candidates(name)) {
    const r = await fetch(MARKET_URL(slug), { signal, headers: { apikey: SUPABASE_KEY } });
    if (r.status === 404) continue;
    if (!r.ok) throw new Error(String(r.status));
    const st = parseStats(await r.json(), rank); if (st) return st;
  }
  return null;
}
/** Total of the part medians times their quantities, plus the parts that had no price (not counted). */
export function sumParts(cs: { name: string; count: number }[], med: Record<string, number | null>) {
  let total = 0; const missing: string[] = [];
  for (const c of cs) { const m = med[c.name]; if (m == null) missing.push(c.name); else total += m * c.count; }
  return { total: +total.toFixed(1), missing };
}
/** First name the market knows (e.g. the part with and without the item prefix). */
export async function fetchAny(names: string[], signal?: AbortSignal, rank?: number): Promise<Stat | null> {
  for (const n of names) { const st = await fetchStat(n, signal, rank); if (st) return st; }
  return null;
}
