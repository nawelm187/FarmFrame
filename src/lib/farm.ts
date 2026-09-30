import type { Row } from "./drops";
export interface Ranked { row: Row; rolls: number | null; stacked: string[]; tags: string[] }
/** location -> needed items that also drop there (needed: lowercase names). */
export function stackIndex(rows: Row[], needed: Set<string>): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  for (const r of rows) { if (!needed.has(r.item.toLowerCase())) continue; let s = m.get(r.where); if (!s) { s = new Set(); m.set(r.where, s); } s.add(r.item); }
  return m;
}
/** Ranks by verified drop chance; "rolls" is a calculated estimate (100 / chance). No time or density data exists here, so none is claimed. */
export function rank(matches: Row[], idx: Map<string, Set<string>>, item: string): Ranked[] {
  const me = item.trim().toLowerCase();
  const out: Ranked[] = matches.map(row => ({ row, rolls: row.ch != null && row.ch > 0 ? Math.ceil(100 / row.ch) : null, stacked: [...(idx.get(row.where) ?? [])].filter(x => x.toLowerCase() !== me), tags: [] }));
  out.sort((a, b) => (b.row.ch ?? -1) - (a.row.ch ?? -1) || b.stacked.length - a.stacked.length);
  out.forEach((o, i) => { if (i < 3 && o.row.ch != null) o.tags.push("Strong option for this objective"); if (o.stacked.length) o.tags.push("Currently useful"); });
  return out;
}
