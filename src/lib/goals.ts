import type { Cat, Component } from "./catalog";
export interface Goal { id: string; cat: Cat; slug: string; name: string }
export type Owned = Record<string, Record<string, number>>;
const G = "ff.goals", P = "ff.goalprog";
const rd = (k: string): unknown => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const wr = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
/** Storage and cloud rows are untrusted input: keep only well-formed entries so damaged data cannot crash a page. */
export function cleanGoals(v: unknown): Goal[] {
  if (!Array.isArray(v)) return [];
  return v.filter((g): g is Goal => !!g && typeof g === "object" && ["id", "cat", "slug", "name"].every(k => typeof (g as Record<string, unknown>)[k] === "string" && (g as Record<string, string>)[k] !== ""));
}
const isRec = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const num0 = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x) && x >= 0;
export function cleanCounts(v: unknown): Record<string, number> {
  const out: Record<string, number> = {}; if (isRec(v)) for (const [k, n] of Object.entries(v)) if (num0(n)) out[k] = n; return out;
}
export function cleanOwned(v: unknown): Owned {
  const out: Owned = {}; if (isRec(v)) for (const [k, o] of Object.entries(v)) if (isRec(o)) out[k] = cleanCounts(o); return out;
}
export const readGoals = (): Goal[] => cleanGoals(rd(G));
export const writeGoals = (a: Goal[]) => wr(G, a);
export const readOwned = (): Owned => cleanOwned(rd(P));
export const writeOwned = (o: Owned) => wr(P, o);
export const readRes = (): Record<string, number> => cleanCounts(rd("ff.res"));
export const writeRes = (o: Record<string, number>) => wr("ff.res", o);
export const goalId = (cat: Cat, slug: string) => `${cat}:${slug}`;
export function progress(cs: Component[], own: Record<string, number> = {}) {
  const total = cs.reduce((a, c) => a + c.count, 0), have = cs.reduce((a, c) => a + Math.min(c.count, own[c.name] ?? 0), 0);
  return { total, have, pct: total ? Math.round((100 * have) / total) : 0 };
}
export const missing = (cs: Component[], own: Record<string, number> = {}) => cs.filter(c => (own[c.name] ?? 0) < c.count);
/** Relic tiers named in the source's drop locations for a component. */
export function tiersOf(c: Component): string[] {
  const s = new Set<string>();
  for (const d of c.drops) { const m = d.location.match(/\b(Lith|Meso|Neo|Axi|Requiem)\b/i); if (m) s.add(m[1][0].toUpperCase() + m[1].slice(1).toLowerCase()); }
  return [...s];
}
