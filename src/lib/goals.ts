import type { Cat, Component } from "./catalog";
export interface Goal { id: string; cat: Cat; slug: string; name: string }
export type Owned = Record<string, Record<string, number>>;
const G = "ff.goals", P = "ff.goalprog";
const rd = (k: string): unknown => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const wr = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
export const readGoals = (): Goal[] => { const v = rd(G); return Array.isArray(v) ? (v as Goal[]) : []; };
export const writeGoals = (a: Goal[]) => wr(G, a);
export const readOwned = (): Owned => { const v = rd(P); return v && typeof v === "object" && !Array.isArray(v) ? (v as Owned) : {}; };
export const writeOwned = (o: Owned) => wr(P, o);
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
