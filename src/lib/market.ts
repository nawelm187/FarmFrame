export interface Stat { median: number; min: number; max: number; volume: number }
export const slugOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
import { SUPABASE_URL } from "./supabase";
/** Goes through our own Supabase Edge Function (supabase/functions/market), because warframe.market blocks direct browser calls. */
export const MARKET_URL = (slug: string) => `${SUPABASE_URL}/functions/v1/market?slug=${slug}`;
/** Latest closed 48h bucket, only if every figure is a real number. Anything else is "no data", never a guess. */
export function parseStats(d: unknown): Stat | null {
  const p = (d as { payload?: { statistics_closed?: Record<string, unknown> } } | null)?.payload?.statistics_closed?.["48hours"];
  if (!Array.isArray(p) || !p.length) return null;
  const x = p[p.length - 1] as Record<string, unknown>, n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const median = n(x?.median ?? x?.avg_price), min = n(x?.min_price), max = n(x?.max_price), volume = n(x?.volume);
  return median != null && min != null && max != null && volume != null ? { median, min, max, volume } : null;
}
// Needs the Edge Function deployed; if it is not, the button reports the market as unavailable.
export const MARKET_ENABLED = true;
