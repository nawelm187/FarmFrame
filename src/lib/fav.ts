import type { Cat } from "./catalog";
export interface Fav { id: string; cat: Cat; slug: string; name: string }
const K = "ff.fav";
export const favId = (cat: Cat, slug: string) => `${cat}:${slug}`;
export const readFavs = (): Fav[] => { try { const v: unknown = JSON.parse(localStorage.getItem(K) || "[]"); return Array.isArray(v) ? (v as Fav[]) : []; } catch { return []; } };
export const writeFavs = (a: Fav[]) => { try { localStorage.setItem(K, JSON.stringify(a)); } catch { /* storage unavailable */ } };
/** Adds the favorite when absent, removes it when present. A favorite is only a bookmark: it never means owned, tracked or a goal. */
export const toggleFav = (list: Fav[], f: Fav): Fav[] => (list.some(x => x.id === f.id) ? list.filter(x => x.id !== f.id) : [...list, f]);
