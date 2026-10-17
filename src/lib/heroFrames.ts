import type { Entity } from "./catalog";
/** One Warframe the Home hero can show. `why` says what the label under it may truthfully say. */
export interface HeroFrame { name: string; slug: string; why: "prime" | "new"; date: string | null }
/** The release date as YYYY-MM-DD when the catalog entry has a real one; null otherwise. Nothing is guessed. */
const day = (v: unknown): string | null => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) && Number.isFinite(Date.parse(v)) ? v.slice(0, 10) : null);
/**
 * Warframes for the Home hero, taken only from the loaded catalog:
 *  - "new": a non-Prime Warframe whose release date is within `newDays` days (a Warframe that just came out);
 *  - "prime": a Prime Warframe the catalog says is NOT vaulted (still obtainable), newest release first when dates are known.
 * Entries with no date keep the catalog's order after the dated ones. A date in the future is ignored. Returns [] when nothing qualifies,
 * so the caller can show something else instead of an empty box.
 */
export function heroFrames(frames: Entity[], now = Date.now(), opts: { max?: number; newDays?: number } = {}): HeroFrame[] {
  const max = opts.max ?? 8, newMs = (opts.newDays ?? 90) * 86_400_000, seen = new Set<string>();
  const rows = frames.map((e, i) => ({ e, i, date: day(e.raw?.releaseDate) }));
  const byNewest = (a: { date: string | null; i: number }, b: { date: string | null; i: number }) => (a.date && b.date ? (a.date < b.date ? 1 : a.date > b.date ? -1 : a.i - b.i) : a.date ? -1 : b.date ? 1 : a.i - b.i);
  const out: HeroFrame[] = [], add = (r: { e: Entity; date: string | null }, why: HeroFrame["why"]) => { if (!r.e.name || !r.e.slug || seen.has(r.e.name)) return; seen.add(r.e.name); out.push({ name: r.e.name, slug: r.e.slug, why, date: r.date }); };
  rows.filter(r => !r.e.isPrime && r.date && Date.parse(r.date) <= now + 86_400_000 && now - Date.parse(r.date) <= newMs).sort(byNewest).forEach(r => add(r, "new"));
  rows.filter(r => r.e.isPrime && r.e.vaulted === false && !(r.date && Date.parse(r.date) > now + 86_400_000)).sort(byNewest).forEach(r => add(r, "prime"));
  return out.slice(0, max);
}
