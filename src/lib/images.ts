import type { Component, Entity } from "./catalog";
/** Name → image file index built from the item catalogs, so reward names (relic drops, vendor stock, parts) can show their own picture. */
export type ImgIndex = Map<string, string>;
const key = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
export function buildImageIndex(lists: (Entity[] | null | undefined)[]): ImgIndex {
  const m: ImgIndex = new Map();
  const put = (n: string, i?: string | null) => { if (i) { const k = key(n); if (!m.has(k)) m.set(k, i); } };
  const walk = (e: Entity, cs: Component[]) => { for (const c of cs) {
    const base = c.name === "Blueprint" ? `${e.name} Blueprint` : `${e.name} ${c.name}`;
    put(base, c.image); put(`${base} Blueprint`, c.image); walk(e, c.children ?? []); } };
  for (const l of lists) for (const e of l ?? []) { put(e.name, e.image); walk(e, e.components); }
  return m;
}
/** Exact match first; otherwise the owning item's picture ("Akbronco Prime Receiver" → Akbronco Prime). */
export function imageFor(idx: ImgIndex, name: string): string | null {
  const n = key(name); if (idx.has(n)) return idx.get(n)!;
  const w = n.replace(/ blueprint$/, ""); if (idx.has(w)) return idx.get(w)!;
  const p = w.indexOf(" prime "); if (p > 0) { const own = idx.get(w.slice(0, p + 6)); if (own) return own; }
  const parts = w.split(" "); for (let i = parts.length - 1; i >= 1; i--) { const own = idx.get(parts.slice(0, i).join(" ")); if (own) return own; }
  return null;
}
