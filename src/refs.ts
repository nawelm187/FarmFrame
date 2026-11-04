/** One identity for things that several screens talk about (search, Farm Plan, Roadmap, Tracking, goals).
 *  Before this, the same part had three addresses and was compared by lower-cased text; now a name maps to one key and an address maps back to it. */
export type RefKind = "warframe" | "weapon" | "mod" | "companion" | "archwing" | "railjack" | "thing" | "relic" | "page";
export const nameKey = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** Stable id: `warframe:rhino-prime`, `thing:forma-blueprint`, `relic:lith-a1`. Entities use their catalog slug, so it equals `goalId`. */
export const ref = (kind: RefKind, name: string) => `${kind}:${nameKey(name)}`;
/** True when two names are the same thing despite case, accents, apostrophes or spacing. */
export const sameName = (a: string, b: string) => nameKey(a) === nameKey(b);
const ENT = new Set(["warframe", "weapon", "mod", "companion", "archwing", "railjack"]);
const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
/** The id behind an in-app address, or null when it does not point at one thing. */
export function refOf(to: string): string | null {
  const [path, qs = ""] = to.split("?"), q = new URLSearchParams(qs).get("q"), seg = path.split("/").filter(Boolean);
  if (seg.length === 2 && ENT.has(seg[0])) return `${seg[0]}:${dec(seg[1])}`;
  if (seg.length === 2 && (seg[0] === "item" || seg[0] === "farm")) return ref("thing", dec(seg[1]));
  if (seg[0] === "resources" && q) return ref("thing", q);
  if (seg[0] === "relics" && q) return ref("relic", q);
  return null;
}
/** The one address where a thing's sources are shown. */
export const thingRoute = (name: string) => `/item/${encodeURIComponent(name)}`;
