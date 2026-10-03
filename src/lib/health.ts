import type { Rec } from "./data";
// API health model from the roadmap (V5.45). Everything here is measured in this browser session; nothing is assumed.
export type Health = "HEALTHY" | "DEGRADED" | "STALE" | "DOWN" | "SCHEMA_DRIFT" | "RATE_LIMITED" | "BLOCKED" | "UNKNOWN";
export interface LoadStat {
  lastOk: number | null; lastFail: number | null; ms: number | null; http: number | null;
  fails: number; count: number | null; drift: string[];
}
export interface Outcome { ok: boolean; at: number; ms: number; http: number | null; data: unknown; drift: string[] }
export const SLOW_MS = 8000;
export const EMPTY_STAT: LoadStat = { lastOk: null, lastFail: null, ms: null, http: null, fails: 0, count: null, drift: [] };
/** Number of records: array length, or number of keys of an object. Null for anything else. */
export const countOf = (d: unknown): number | null => (Array.isArray(d) ? d.length : d && typeof d === "object" ? Object.keys(d).length : null);
/** Folds one request outcome into the running stat. A success resets the failure streak. */
export function nextStat(prev: LoadStat | undefined, o: Outcome): LoadStat {
  const p = prev ?? EMPTY_STAT;
  return o.ok
    ? { ...p, lastOk: o.at, ms: o.ms, http: o.http, fails: 0, count: countOf(o.data) ?? p.count, drift: o.drift }
    : { ...p, lastFail: o.at, ms: o.ms, http: o.http, fails: p.fails + 1 };
}
/** Health of one dataset. Order matters: a failing request outranks stale data, drift outranks "fresh". */
export function datasetHealth(rec: Rec | undefined, st: LoadStat | undefined, now = Date.now()): Health {
  if (!rec) return "UNKNOWN";
  const hasData = rec.data != null, stale = rec.at !== null && now - rec.at > rec.window;
  if (rec.err) {
    if (!hasData) return st?.http === 429 ? "RATE_LIMITED" : st?.http === 401 || st?.http === 403 || st?.http === 451 ? "BLOCKED" : "DOWN";
    return stale ? "STALE" : "DEGRADED";
  }
  if (!hasData) return "UNKNOWN";
  if (st?.drift.length) return "SCHEMA_DRIFT";
  if (stale) return "STALE";
  return st?.ms != null && st.ms > SLOW_MS ? "DEGRADED" : "HEALTHY";
}
const RANK: Health[] = ["DOWN", "BLOCKED", "RATE_LIMITED", "SCHEMA_DRIFT", "STALE", "DEGRADED", "HEALTHY", "UNKNOWN"];
/** Worst health wins; UNKNOWN only when nothing was measured. */
export const worst = (hs: Health[]): Health => RANK.find(h => hs.includes(h)) ?? "UNKNOWN";
