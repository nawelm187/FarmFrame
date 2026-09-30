export interface Tracked { n: string; o: number; t: number }
const K = "ff.track";
export const readTracked = (): Tracked[] => { try { const v: unknown = JSON.parse(localStorage.getItem(K) || "[]"); return Array.isArray(v) ? (v as Tracked[]) : []; } catch { return []; } };
export const writeTracked = (a: Tracked[]) => { try { localStorage.setItem(K, JSON.stringify(a)); } catch { /* storage unavailable */ } };
