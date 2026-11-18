export const KEYS = ["ff.track", "ff.goals", "ff.goalprog", "ff.res", "ff.builds", "ff.fav", "ff.relics", "ff.reqs"] as const;
/** Added after the first release. They travel with the account, but they never decide what happens at sign-in (`same`, `isEmpty`) and an older cloud copy that lacks them never erases them locally. */
export const EXTRA_KEYS = ["ff.mastery", "ff.standing"] as const;
const ALL = [...KEYS, ...EXTRA_KEYS];
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
export const fingerprint = (s: Snap) => stable(ALL.map(k => (empty(s[k]) ? null : s[k])));
/** Sign-in comparison: the original keys only, so adding the extras never turns an existing account into a conflict. */
export const same = (a: Snap, b: Snap) => stable(KEYS.map(k => (empty(a[k]) ? null : a[k]))) === stable(KEYS.map(k => (empty(b[k]) ? null : b[k])));
export function snapshot(): Snap {
  const s: Snap = {};
  for (const k of ALL) { try { const raw = localStorage.getItem(k); if (raw != null) s[k] = JSON.parse(raw); } catch { /* skip unreadable key */ } }
  return s;
}
/** Writes only the known keys, so a tampered cloud row cannot create arbitrary local entries. */
export function applySnap(s: Snap, clearExtras = false) {
  for (const k of KEYS) { try { if (empty(s[k])) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(s[k])); } catch { /* storage unavailable */ } }
  // An older cloud copy has no extras: leave the local ones alone, unless this data belongs to another account.
  for (const k of EXTRA_KEYS) { try { if (s[k] === undefined && !clearExtras) continue; if (empty(s[k])) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(s[k])); } catch { /* storage unavailable */ } }
}
/** Keeps only the known keys, and only objects or arrays, so a wrong file cannot write junk into the app's storage. */
export function cleanImport(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, unknown> = {};
  for (const k of ALL) { const x = (v as Record<string, unknown>)[k]; if (x && typeof x === "object") out[k] = x; }
  return Object.keys(out).length ? out : null;
}
