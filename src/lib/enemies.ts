import { GH_ALT, GH_RAW } from "./catalog";
export const ENEMY_URL = GH_RAW + "Enemy.json", ENEMY_ALT = GH_ALT + "Enemy.json", ENEMY_SRC = "WFCD warframe-items (Enemy.json, community)";
export interface Mod { el: string; pct: number }
export interface Layer { kind: string; amount: number | null; takesMore: Mod[]; takesLess: Mod[] }
export interface Enemy { name: string; faction: string; description: string; health: number | null; shield: number | null; armor: number | null; image: string | null; layers: Layer[]; drops: { location: string; type: string; rarity: string; chance: number | null }[] }
type O = Record<string, unknown>;
const isO = (x: unknown): x is O => !!x && typeof x === "object" && !Array.isArray(x);
const s = (x: unknown) => (typeof x === "string" ? x : ""), n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : null);
/** In the source a positive modifier means the enemy takes MORE of that damage, a negative one means it takes less (0 = unchanged). */
export function parseEnemies(d: unknown): Enemy[] | null {
  if (!Array.isArray(d)) return null;
  const out = d.filter(isO).filter(e => s(e.name)).map(e => ({
    name: s(e.name), faction: s(e.type) || "Unknown", description: s(e.description), health: n(e.health), shield: n(e.shield), armor: n(e.armor), image: s(e.imageName) || null,
    layers: (Array.isArray(e.resistances) ? e.resistances.filter(isO) : []).map(r => { const af = (Array.isArray(r.affectors) ? r.affectors.filter(isO) : []).map(a => ({ el: s(a.element), pct: Math.round((n(a.modifier) ?? 0) * 100) })).filter(a => a.el && a.pct !== 0);
      return { kind: s(r.type), amount: n(r.amount), takesMore: af.filter(a => a.pct > 0).sort((a, b) => b.pct - a.pct), takesLess: af.filter(a => a.pct < 0).sort((a, b) => a.pct - b.pct) }; }),
    drops: (Array.isArray(e.drops) ? e.drops.filter(isO) : []).map(x => ({ location: s(x.location), type: s(x.type), rarity: s(x.rarity), chance: n(x.chance) })),
  }));
  return out.length ? out.sort((a, b) => a.name.localeCompare(b.name)) : null;
}
export const FACTIONS = (l: Enemy[]) => [...new Set(l.map(e => e.faction))].sort();
