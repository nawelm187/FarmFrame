import { FACTION, MAX_RANK, MIN_RANK, RANKS, RATE, keyOf } from "../data/syndicateInfo";
/** Syndicate offerings from the official drop tables (WFCD/warframe-drop-data, syndicates.json): what each rank sells and for how much standing. Rank order is the order the file lists them; the file has no standing thresholds, so none are invented here. */
export interface Offer { item: string; standing: number; cost: number | null }
export interface RankOffers { rank: string; offers: Offer[] }
export interface Syndicate { name: string; ranks: RankOffers[]; count: number }
type O = Record<string, unknown>;
const isO = (v: unknown): v is O => !!v && typeof v === "object" && !Array.isArray(v);
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
/** Null when the data does not have the expected shape (so the page can say so instead of showing nothing). */
export function parseSyndicates(d: unknown): Syndicate[] | null {
  const root = isO(d) && isO(d.syndicates) ? d.syndicates : d; if (!isO(root)) return null;
  const out: Syndicate[] = [];
  for (const [name, list] of Object.entries(root)) {
    if (!Array.isArray(list)) continue;
    const ranks = new Map<string, Offer[]>(); let count = 0;
    for (const x of list) {
      if (!isO(x) || typeof x.item !== "string" || typeof x.place !== "string") continue;
      const i = x.place.indexOf(","), rank = (i >= 0 ? x.place.slice(i + 1) : x.place).trim() || "Unranked", a = ranks.get(rank) ?? []; a.push({ item: x.item, standing: n(x.standing) ?? 0, cost: n(x.cost) }); ranks.set(rank, a); count++;
    }
    if (count) out.push({ name, count, ranks: [...ranks].map(([rank, offers]) => ({ rank, offers: offers.sort((p, q) => p.standing - q.standing || p.item.localeCompare(q.item)) })) });
  }
  return out.length ? out : null;
}
/** What the user's current standing can buy now, and how much more the rest needs. Standing here is the amount available to spend. */
export const affordable = (offers: Offer[], have: number) => offers.map(o => ({ ...o, canBuy: o.standing <= have, missing: Math.max(0, o.standing - have) }));
/** Progress toward a standing target: remaining points and a 0-100 percentage. */
export function toTarget(have: number, target: number) { const left = Math.max(0, target - have); return { left, pct: target > 0 ? Math.min(100, Math.round((100 * Math.max(0, have)) / target)) : 0 }; }
const K = "ff.standing";
export interface Stand { have: number; target: number; rank?: number; targetRank?: number }
export const readStanding = (): Record<string, Stand> => { try { const v: unknown = JSON.parse(localStorage.getItem(K) || "{}"); return isO(v) ? (v as Record<string, Stand>) : {}; } catch { return {}; } };
export const writeStanding = (s: Record<string, Stand>) => { try { localStorage.setItem(K, JSON.stringify(s)); } catch { /* storage unavailable */ } };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const rankRange = (rank: number) => RANKS.find(r => r.rank === rank) ?? null;
/** Keeps a standing inside what the wiki table allows at that rank. */
export const clampStanding = (rank: number, have: number) => { const r = rankRange(rank); return r ? clamp(have, r.min, r.max) : have; };
/** Standing still needed to move from `rank` (holding `have`) up to `target`: the sum of each rank's maximum in between, minus what you hold. Zero when already there. */
export function toRank(rank: number, have: number, target: number) {
  const t = clamp(target, MIN_RANK, MAX_RANK); if (t <= rank) return 0;
  let need = 0; for (let k = rank; k < t; k++) need += rankRange(k)?.max ?? 0;
  return Math.max(0, need - have);
}
export interface Effect { name: string; delta: number; kind: "ally" | "opposed" | "enemy" }
/** What earning `amount` standing with a faction syndicate does to the three related ones (+50% / -50% / -100%). Empty for syndicates without relations. */
export function effects(name: string, amount: number): Effect[] {
  const r = FACTION[keyOf(name)]; if (!r) return [];
  return (["ally", "opposed", "enemy"] as const).map(kind => ({ name: r[kind], kind, delta: Math.round(amount * RATE[kind]) }));
}
