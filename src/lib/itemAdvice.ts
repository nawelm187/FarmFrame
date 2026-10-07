import { query, type Row } from "./drops";
import { rank, stackIndex, type Ranked } from "./farm";
/** Best verified places to get one loose item (a mod, resource or part) from the drop rows. `needed` (lowercase names) lets it say when a place also drops something else the user needs. */
export interface ItemAdvice { sources: Ranked[]; exact: boolean }
export function itemAdvice(rows: Row[], name: string, needed: Set<string>): ItemAdvice {
  const q = name.trim().toLowerCase(); if (!q) return { sources: [], exact: false };
  // Same name first; then names that continue it ("Rhino Prime Systems" -> "... Blueprint"); only then anything that contains it.
  const hits = query(rows, q), same = hits.filter(r => r.item.toLowerCase() === q), cont = hits.filter(r => r.item.toLowerCase().startsWith(q + " "));
  const use = same.length ? same : cont.length ? cont : hits;
  return { sources: rank(use, stackIndex(rows, needed), name).slice(0, 3), exact: same.length + cont.length > 0 };
}
/** One line saying why a source is recommended, using only its own numbers. */
export const sourceWhy = (r: Ranked): string => [r.row.ch != null ? `${r.row.ch}% drop chance` : "chance not listed", r.rolls != null ? `about ${r.rolls} run${r.rolls === 1 ? "" : "s"} for one on average` : null, r.stacked.length ? `also drops ${r.stacked.slice(0, 2).join(", ")}, which you need` : null].filter(Boolean).join(" · ");
