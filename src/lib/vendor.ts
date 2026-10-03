// Sorts a vendor's stock into groups a player can read: mods, weapons, warframes, cosmetics, relics, resources and so on.
// Names are matched against the catalogs first (exact), then by words in the name. An item that matches nothing goes to "Other".
export type VCat = "mod" | "weapon" | "warframe" | "cosmetic" | "pack" | "relic" | "part" | "resource" | "other";
export const VCATS: [VCat, string][] = [["mod", "Mods"], ["weapon", "Weapons"], ["warframe", "Warframes and companions"], ["cosmetic", "Cosmetics and decorations"], ["pack", "Packs"], ["relic", "Relics and Void Projections"], ["part", "Blueprints and parts"], ["resource", "Resources and boosters"], ["other", "Other"]];
export interface Known { mods: Set<string>; weapons: Set<string>; frames: Set<string> }
export interface Stock { name: string; ducats?: number | null; credits?: number | null }
const COSMETIC = /\b(skin|syandana|helmet|ephemera|armou?r|bobble|sigil|glyph|cape|beacon|tail|collar|plates?|guard|scarf|emblem|poster|decoration|decor|ornament|statue|banner|animation|tattoo|hairstyle|lens|plush|kubrow|kavat|cloak|mask|aura mesh|nameplate|display|sticker|color palette|palette)\b/i;
const PART = /\b(blueprint|chassis|neuroptics|systems|barrel|receiver|stock|blade|hilt|handle|string|grip|link|limbs?|pouch|harness|wings|carapace|cerebrum)\b/i;
const RESOURCE = /\b(orokin cell|neurode|alloy plate|ferrite|polymer bundle|nano spores|plastids|rubedo|salvage|control module|gallium|morphics|detonite|fieldron|mutagen mass|cryotic|tellurium|argon crystal|neural sensors|forma|catalyst|reactor|kuva|endo|credits?|ducats?|resource|booster|potato|exilus adapter|aura forma|riven)\b/i;
/** Names an item can be listed under in a catalog: "Prime Okina" is "Okina Prime", "Prime Velox Pistol" is "Velox Prime". */
export function variants(name: string): string[] {
  const n = name.toLowerCase().trim(), out = new Set([n]), strip = (t: string) => t.replace(/\s+(pistol|gun|rifle|bow|blueprint|set|single pack|dual pack)$/i, "").trim();
  out.add(strip(n)); const m = strip(n).match(/^prime\s+(.+)$/); if (m) out.add(`${m[1]} prime`);
  return [...out];
}
export function categorize(name: string, k: Known): VCat {
  const low = name.toLowerCase();
  if (/void projection|\brelic\b/.test(low)) return "relic";
  if (/\bpack\b/.test(low)) return "pack";
  const v = variants(name);
  if (v.some(x => k.mods.has(x))) return "mod";
  if (COSMETIC.test(low) && !v.some(x => k.weapons.has(x) || k.frames.has(x))) return "cosmetic";
  if (v.some(x => k.frames.has(x))) return "warframe";
  if (v.some(x => k.weapons.has(x)) || /^(?:prisma|kuva|tenet|vandal|wraith)\s/.test(low)) return "weapon";
  if (RESOURCE.test(low)) return "resource";
  if (PART.test(low)) return "part";
  return "other";
}
export interface Group { cat: VCat; label: string; items: Stock[] }
/** Non-empty groups in a fixed order; inside a group, the most expensive first when there are prices, otherwise by name. */
export function groupStock(items: Stock[], k: Known): Group[] {
  const by = new Map<VCat, Stock[]>(); for (const i of items) { const c = categorize(i.name, k), a = by.get(c) ?? []; a.push(i); by.set(c, a); }
  return VCATS.filter(([c]) => by.has(c)).map(([cat, label]) => ({ cat, label, items: [...by.get(cat)!].sort((a, b) => (b.ducats ?? -1) - (a.ducats ?? -1) || a.name.localeCompare(b.name)) }));
}
