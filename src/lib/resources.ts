import { GH_ALT, GH_RAW } from "./catalog";
import { clean } from "./text";
export const RES_SRC = "WFCD warframe-items (community, unofficial)";
export const FILES = { resources: "Resources.json", items: "Misc.json" } as const;
export const resUrl = (f: string) => GH_RAW + f, resAlt = (f: string) => GH_ALT + f;
export interface Drop { location: string; type: string; rarity: string; chance: number | null }
export interface Thing { name: string; type: string; description: string; image: string | null; tradable: boolean | null; drops: Drop[] }
type O = Record<string, unknown>;
const isO = (x: unknown): x is O => !!x && typeof x === "object" && !Array.isArray(x);
const s = (x: unknown) => (typeof x === "string" ? x : ""), n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : null);
/** Resources and miscellaneous items. Drop chances in the source are fractions (0.125 = 12.5%); they are shown as percentages. */
export function parseThings(d: unknown): Thing[] | null {
  if (!Array.isArray(d)) return null;
  const out = d.filter(isO).filter(x => s(x.name)).map(x => ({ name: s(x.name), type: s(x.type) || "Other", description: clean(s(x.description)), image: s(x.imageName) || null, tradable: typeof x.tradable === "boolean" ? x.tradable : null,
    drops: (Array.isArray(x.drops) ? x.drops.filter(isO) : []).map(o => ({ location: s(o.location), type: s(o.type), rarity: s(o.rarity), chance: n(o.chance) })).filter(o => o.location).sort((a, b) => (b.chance ?? -1) - (a.chance ?? -1)) }));
  return out.length ? out.sort((a, b) => a.name.localeCompare(b.name)) : null;
}
export const pct = (c: number | null) => (c == null ? null : +(c <= 1 ? c * 100 : c).toFixed(2));
