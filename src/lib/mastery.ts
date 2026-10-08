import { MASTERY_GROUPS, STARCHART, type MGroup } from "../data/masteryData";
/** Mastery points needed to reach a rank: 2,500 x rank squared up to rank 30, then 147,500 more for each Legendary Rank. */
export const pointsFor = (rank: number) => (rank <= 30 ? 2500 * rank * rank : 2_250_000 + 147_500 * (rank - 30));
export const rankLabel = (r: number) => (r > 30 ? `Legendary ${r - 30} (MR ${r})` : `MR ${r}`);
export interface RankInfo { rank: number; label: string; points: number; next: number; toNext: number; pct: number }
/** Rank for a point total. The progress bar is measured inside the current rank (from its threshold to the next one). */
export function rankFor(points: number): RankInfo {
  const p = Math.max(0, Math.floor(points)); let r = 0; while (pointsFor(r + 1) <= p) r++;
  const lo = pointsFor(r), hi = pointsFor(r + 1);
  return { rank: r, label: rankLabel(r), points: p, next: r + 1, toNext: hi - p, pct: Math.round((100 * (p - lo)) / (hi - lo)) };
}
/** Key of one checkbox. Steel Path nodes use their own prefix so they count separately from the normal Star Chart. */
export const itemKey = (gid: string, name: string) => `${gid}|${name}`;
export const spGroups = (): MGroup[] => STARCHART.map(g => ({ ...g, id: "sp-" + g.id, label: g.label + " (Steel Path)" }));
export const ALL_GROUPS = (): MGroup[] => [...MASTERY_GROUPS, ...STARCHART, ...spGroups()];
export const groupTotal = (g: MGroup) => g.items.reduce((a, [, x]) => a + x, 0);
/** Points from the checked items. Founder items count too: the wiki lists them as Mastery sources, but they can no longer be obtained. */
export function totalPoints(checked: Set<string>, groups = ALL_GROUPS()) {
  let have = 0, max = 0, left = 0; for (const g of groups) for (const [n, x] of g.items) { max += x; if (checked.has(itemKey(g.id, n))) have += x; else left += x; }
  return { have, max, left };
}
export const groupProgress = (g: MGroup, checked: Set<string>) => { let n = 0, have = 0; for (const [name, x] of g.items) if (checked.has(itemKey(g.id, name))) { n++; have += x; } return { n, count: g.items.length, have, total: groupTotal(g) }; };
/** What would reach the next rank: how many Warframes (6,000) or weapons (3,000) that is. */
export const nextRankHelp = (toNext: number) => ({ frames: Math.ceil(toNext / 6000), weapons: Math.ceil(toNext / 3000) });
const K = "ff.mastery";
export const readMastery = (): Set<string> => { try { const v: unknown = JSON.parse(localStorage.getItem(K) || "[]"); return new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []); } catch { return new Set(); } };
export const writeMastery = (s: Set<string>) => { try { localStorage.setItem(K, JSON.stringify([...s])); } catch { /* storage unavailable */ } };
