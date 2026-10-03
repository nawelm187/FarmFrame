import { clean } from "./text";
export const GH_RAW = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/";
export const GH_ALT = "https://cdn.jsdelivr.net/gh/WFCD/warframe-items@master/data/json/";
export const GH_SRC = "WFCD warframe-items on GitHub (community, unofficial)";
export type Cat = "warframe" | "weapon" | "mod" | "companion" | "archwing" | "railjack";
export const CAT_SRC = "WFCD warframe-items via WarframeStat API (community, unofficial)";
export const CATS: Record<Cat, { path: string; label: string; url: string }> = {
  warframe: { path: "warframes", label: "Warframes", url: "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Warframes.json" },
  weapon: { path: "weapons", label: "Weapons", url: "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Primary.json" },
  mod: { path: "mods", label: "Mods", url: "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Mods.json" },
  companion: { path: "companions", label: "Companions", url: "https://api.warframestat.us/mods?language=en" },
  archwing: { path: "archwings", label: "Archwings", url: "https://api.warframestat.us/mods?language=en" },
  railjack: { path: "railjack", label: "Railjack", url: "https://api.warframestat.us/mods?language=en" },
};
export interface Component { name: string; count: number; image?: string | null; ducats?: number | null; tradable?: boolean | null; drops: { location: string; type: string }[]; children: Component[] }
export interface Entity {
  slug: string; name: string; type: string; description: string; image: string | null; isPrime: boolean; vaulted: boolean | null;
  stats: [string, number][]; facts: [string, string][]; components: Component[]; tradable: boolean | null;
  polarity: string | null; baseDrain: number | null; maxRank: number | null; compat: string; rarity: string; slots: string[] | null; levelStats: string[][] | null; category: string; raw: Record<string, unknown>;
}
type O = Record<string, unknown>;
const isO = (x: unknown): x is O => !!x && typeof x === "object" && !Array.isArray(x);
const s = (x: unknown) => (typeof x === "string" ? x : "");
const txt = (x: unknown) => clean(s(x));
const n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : null);
export const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const STAT_KEYS: Record<Cat, [string, string][]> = {
  warframe: [["health", "Health"], ["shield", "Shield"], ["armor", "Armor"], ["power", "Energy"]],
  weapon: [["totalDamage", "Damage"], ["criticalChance", "Crit chance"], ["criticalMultiplier", "Crit multiplier"], ["procChance", "Status chance"], ["fireRate", "Fire rate"]],
  mod: [["baseDrain", "Base drain"], ["fusionLimit", "Max rank"]],
  companion: [["health", "Health"], ["shield", "Shield"], ["armor", "Armor"]],
  archwing: [["health", "Health"], ["shield", "Shield"], ["armor", "Armor"], ["power", "Energy"]],
  railjack: [["baseDrain", "Base drain"], ["fusionLimit", "Max rank"]],
};
const FACT_KEYS: [string, string][] = [["rarity", "Rarity"], ["polarity", "Polarity"], ["compatName", "Compatible with"], ["category", "Category"], ["masteryReq", "Mastery rank"]];
function comps(v: unknown, depth = 0): Component[] {
  if (!Array.isArray(v) || depth > 5) return [];
  return v.filter(isO).map(c => ({
    name: s(c.name), count: n(c.itemCount) ?? 1, image: s(c.imageName) || null, ducats: n(c.ducats), tradable: typeof c.tradable === "boolean" ? c.tradable : null,
    drops: Array.isArray(c.drops) ? c.drops.filter(isO).map(t => ({ location: s(t.location), type: s(t.type) })).filter(t => t.location) : [],
    children: comps(c.components, depth + 1) })).filter(c => c.name);
}
/** How complete an entry is; used to choose between duplicate entries. */
const richness = (e: Entity) => (e.image ? 2 : 0) + (e.levelStats?.length ? 2 : 0) + (e.description ? 1 : 0) + (e.tradable !== null ? 1 : 0) + (e.components.length ? 1 : 0) + (Array.isArray(e.raw.drops) && e.raw.drops.length ? 1 : 0);
const cache = new WeakMap<object, Entity[] | null>();
/** Tolerant parser: unknown shapes yield null (shown as a gap); missing fields are simply omitted, never invented. */
export function parseCatalog(d: unknown, cat: Cat): Entity[] | null {
  if (!Array.isArray(d)) return null;
  if (cache.has(d)) return cache.get(d)!;
  const seen = new Map<string, number>(), byKey = new Map<string, number>(), out: Entity[] = [];
  for (const x of d) {
    if (!isO(x) || !s(x.name)) continue;
    const stats: [string, number][] = [];
    for (const [key, label] of STAT_KEYS[cat]) { const v = n(x[key]); if (v !== null) stats.push([label, v]); }
    const facts: [string, string][] = [];
    for (const [key, label] of FACT_KEYS) { const v = x[key]; if (typeof v === "string" && v) facts.push([label, v]); else if (typeof v === "number") facts.push([label, String(v)]); }
    const components = comps(x.components);
    const ent: Entity = { slug: "", name: s(x.name), type: s(x.type), description: txt(x.description), image: s(x.imageName) || null, isPrime: x.isPrime === true || /\bprime$/i.test(s(x.name)),
      vaulted: typeof x.vaulted === "boolean" ? x.vaulted : null, stats, facts, components, tradable: typeof x.tradable === "boolean" ? x.tradable : null,
      polarity: s(x.polarity).toLowerCase() || null, baseDrain: n(x.baseDrain), maxRank: n(x.fusionLimit), compat: s(x.compatName), rarity: s(x.rarity),
      slots: Array.isArray(x.polarities) ? x.polarities.filter((p): p is string => typeof p === "string").map(p => p.toLowerCase()) : null,
      category: s(x.category), raw: x, levelStats: Array.isArray(x.levelStats) ? x.levelStats.map(l => (isO(l) && Array.isArray(l.stats) ? l.stats.filter((z): z is string => typeof z === "string").map(clean) : [])) : null };
    // The source lists some entries twice (same name and type). Keep one: the more complete entry, in the first one's place.
    const key = `${ent.name.toLowerCase()}|${ent.type}|${ent.compat}`, at = byKey.get(key);
    if (at !== undefined) { if (richness(ent) > richness(out[at])) out[at] = ent; continue; }
    byKey.set(key, out.length); out.push(ent);
  }
  for (const e of out) { let slug = slugify(e.name); const k = seen.get(slug) ?? 0; seen.set(slug, k + 1); if (k) slug += "-" + (k + 1); e.slug = slug; }
  const r = out.length ? out.sort((a, b) => a.name.localeCompare(b.name)) : null;
  cache.set(d, r); return r;
}
export const imgUrl = (i: string) => "https://cdn.warframestat.us/img/" + encodeURIComponent(i);
