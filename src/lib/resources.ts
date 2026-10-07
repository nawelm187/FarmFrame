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

/** Sources written by hand for items whose data has no drops and no usable description. Marked as manual in the page. */
export const MANUAL: Record<string, string> = {
  "Bonewidow Capsule": "Crafted in the Foundry. Necramech blueprints are sold by the Necraloid in the Necralisk (Cambion Drift, Deimos).",
  "Bonewidow Casing": "Crafted in the Foundry. Necramech blueprints are sold by the Necraloid in the Necralisk (Cambion Drift, Deimos).",
  "Bonewidow Engine": "Crafted in the Foundry. Necramech blueprints are sold by the Necraloid in the Necralisk (Cambion Drift, Deimos).",
  "Bonewidow Weapon Pod": "Crafted in the Foundry. Necramech blueprints are sold by the Necraloid in the Necralisk (Cambion Drift, Deimos).",
  "Voidrig Capsule": "Crafted in the Foundry. Necramech blueprints are sold by the Necraloid in the Necralisk (Cambion Drift, Deimos).",
  "Voidrig Casing": "Crafted in the Foundry. Necramech blueprints are sold by the Necraloid in the Necralisk (Cambion Drift, Deimos).",
  "Voidrig Engine": "Crafted in the Foundry. Necramech blueprints are sold by the Necraloid in the Necralisk (Cambion Drift, Deimos).",
  "Voidrig Weapon Pod": "Crafted in the Foundry. Necramech blueprints are sold by the Necraloid in the Necralisk (Cambion Drift, Deimos).",
  "Bioplasma": "Internal item: the game data has no description or source for it.", "Entratifragmentbase": "Internal item: the game data has no description or source for it.",
  "Entratilabdogtag": "Internal item: the game data has no description or source for it.", "Genericdojocolorpigment": "Internal item: the game data has no description or source for it.",
  "Hexsyndicatedogtag": "Internal item: the game data has no description or source for it.", "Plantitem": "Internal item: the game data has no description or source for it.", "Zarimandogtag": "Internal item: the game data has no description or source for it.",
};
const HINT = /^(location|source|obtained|obtain|earn|acquired|blueprint sold|awarded|retrieved|dropped|this resource is dropped|found|can be (?:found|obtained|gathered))\b/i;
/** The sentences of a description that say where an item comes from ("Location: Cambion Drift...", "Obtained from Zariman missions."). */
export function whereFrom(description: string): string[] {
  return description.replace(/\r/g, "").split(/\n+|(?<=[.!?])\s+(?=[A-Z])/).map(x => x.trim()).filter(x => x && HINT.test(x));
}
/** The description without the sentences already shown as the source. */
export function aboutText(description: string): string {
  const w = new Set(whereFrom(description)); return description.split(/\n+|(?<=[.!?])\s+(?=[A-Z])/).map(x => x.trim()).filter(x => x && !w.has(x)).join(" ");
}
