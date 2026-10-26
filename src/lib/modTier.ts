/** Visual quality of a mod card: the four rarities plus the three special families. Names are game terms. */
export type ModTier = "common" | "uncommon" | "rare" | "legendary" | "riven" | "amalgam" | "archon" | "other";
export function modTier(m: { name: string; type?: string; rarity: string }): ModTier {
  if (/^amalgam\b/i.test(m.name)) return "amalgam";
  if (/^archon\b/i.test(m.name)) return "archon";
  if (/riven/i.test(m.type ?? "") || /\briven\b/i.test(m.name)) return "riven";
  const r = m.rarity.toLowerCase();
  return r === "common" || r === "uncommon" || r === "rare" || r === "legendary" ? r : "other";
}
/** Primed mods keep the gold frame and get an extra glow. */
export const isPrimedMod = (name: string) => /^primed\b/i.test(name);
/** Shown at the bottom of the card. The special families keep their game name in every language. */
export const TIER_NAME: Partial<Record<ModTier, string>> = { amalgam: "Amalgam", archon: "Archon", riven: "Riven" };
export const TIER_KEY = { common: "rarCommon", uncommon: "rarUncommon", rare: "rarRare", legendary: "rarLegendary" } as const;
