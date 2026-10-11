// Coverage checks for catalog fields (source audit, 2026-10-11). A source answering is not proof that it carries a field,
// so each check says FOUND / MISSING per item and never turns an absent value into 0.
export type CoverageStatus = "FOUND" | "MISSING" | "STALE" | "UNSUPPORTED" | "SOURCE_UNAVAILABLE";
const isO = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const name = (x: Record<string, unknown>) => (typeof x.name === "string" ? x.name : null);

/** Riven disposition as the catalog states it: a finite number, or null. Never 0 for "unknown". */
export function dispositionOf(raw: unknown): number | null {
  if (!isO(raw)) return null; const d = raw.disposition;
  return typeof d === "number" && Number.isFinite(d) && d >= 1 ? d : null;
}
/** The visible catalog files do not tag Incarnon weapons: Angstrum, Atomos, Ballistica and Bronco carry an "Incarnon Form" attack and no Incarnon tag. */
export function hasIncarnonForm(raw: unknown): boolean {
  if (!isO(raw)) return false;
  if (Array.isArray(raw.attacks) && raw.attacks.some(a => isO(a) && typeof a.name === "string" && /incarnon/i.test(a.name))) return true;
  return Array.isArray(raw.tags) && raw.tags.some(t => typeof t === "string" && /incarnon/i.test(t));
}
export interface CoverageReport { status: CoverageStatus; received: number; found: number; missing: string[]; duplicates: string[] }
/** Counts how many weapons carry a disposition. An empty or non-array input is SOURCE_UNAVAILABLE, not "zero missing". */
export function dispositionCoverage(items: unknown): CoverageReport {
  if (!Array.isArray(items) || !items.length) return { status: "SOURCE_UNAVAILABLE", received: 0, found: 0, missing: [], duplicates: [] };
  const seen = new Set<string>(), dup = new Set<string>(), missing: string[] = []; let found = 0, received = 0;
  for (const it of items) {
    if (!isO(it)) continue; const n = name(it); if (!n) continue; received++;
    const key = n.toLowerCase(); if (seen.has(key)) dup.add(n); seen.add(key);
    if (dispositionOf(it) != null) found++; else missing.push(n);
  }
  return { status: received === 0 ? "SOURCE_UNAVAILABLE" : missing.length ? "MISSING" : "FOUND", received, found, missing, duplicates: [...dup] };
}
/** Weapons whose entry shows an Incarnon form. This is the catalog's compatible list, not the weekly Circuit rotation. */
export function incarnonWeapons(items: unknown): string[] {
  return (Array.isArray(items) ? items : []).filter(hasIncarnonForm).map(x => name(x as Record<string, unknown>)).filter((x): x is string => !!x);
}
