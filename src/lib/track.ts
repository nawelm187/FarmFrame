/** `from` is where the item was added from (a build name, "Part page", "Item page"); missing means added by hand or by an older version. */
export interface Tracked { n: string; o: number; t: number; from?: string }
export type TrackFilter = "all" | "missing" | "done";
export const isDone = (t: Tracked) => t.o >= t.t;
/** Counts for the summary line and the filter buttons. */
export const trackCounts = (a: Tracked[]) => ({ all: a.length, done: a.filter(isDone).length, missing: a.filter(t => !isDone(t)).length });
export const trackFilter = (a: Tracked[], f: TrackFilter, q = "") => a.map((t, i) => ({ t, i })).filter(({ t }) => (f === "all" || (f === "done") === isDone(t)) && (!q || t.n.toLowerCase().includes(q.toLowerCase())));
const K = "ff.track";
export const readTracked = (): Tracked[] => { try { const v: unknown = JSON.parse(localStorage.getItem(K) || "[]"); return Array.isArray(v) ? (v as Tracked[]) : []; } catch { return []; } };
export const writeTracked = (a: Tracked[]) => { try { localStorage.setItem(K, JSON.stringify(a)); } catch { /* storage unavailable */ } };
