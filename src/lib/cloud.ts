export const KEYS = ["ff.track", "ff.goals", "ff.goalprog", "ff.res", "ff.builds", "ff.fav"] as const;
export type Snap = Record<string, unknown>;
export function stable(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return "[" + v.map(stable).join(",") + "]";
  const o = v as Record<string, unknown>;
  return "{" + Object.keys(o).sort().map(k => JSON.stringify(k) + ":" + stable(o[k])).join(",") + "}";
}
const empty = (v: unknown) => v == null || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v as object).length);
export const isEmpty = (s: Snap) => KEYS.every(k => empty(s[k]));
/** Order-independent fingerprint over the known keys only; empty values count as absent. */
export const fingerprint = (s: Snap) => stable(KEYS.map(k => (empty(s[k]) ? null : s[k])));
export const same = (a: Snap, b: Snap) => fingerprint(a) === fingerprint(b);
export function snapshot(): Snap {
  const s: Snap = {};
  for (const k of KEYS) { try { const raw = localStorage.getItem(k); if (raw != null) s[k] = JSON.parse(raw); } catch { /* skip unreadable key */ } }
  return s;
}
/** Writes only the known keys, so a tampered cloud row cannot create arbitrary local entries. */
export function applySnap(s: Snap) {
  for (const k of KEYS) { try { if (empty(s[k])) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(s[k])); } catch { /* storage unavailable */ } }
}
