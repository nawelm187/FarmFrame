import { describe, expect, it } from "vitest";
import { isPrimedMod, modTier } from "./modTier";
describe("mod card quality", () => {
  it("maps the four rarities", () => {
    expect(modTier({ name: "Serration", rarity: "Rare" })).toBe("rare"); expect(modTier({ name: "Vitality", rarity: "Common" })).toBe("common");
    expect(modTier({ name: "Fleeting Expertise", rarity: "Uncommon" })).toBe("uncommon"); expect(modTier({ name: "Dreamer's Wrath", rarity: "Legendary" })).toBe("legendary");
  });
  it("recognises Amalgam, Archon and Riven by name or type, whatever the rarity says", () => {
    expect(modTier({ name: "Amalgam Organ Shatter", rarity: "Rare" })).toBe("amalgam"); expect(modTier({ name: "Archon Vitality", rarity: "Legendary" })).toBe("archon");
    expect(modTier({ name: "Ancient Riven Mod", type: "Riven Mod", rarity: "Rare" })).toBe("riven"); expect(modTier({ name: "Riven", rarity: "" })).toBe("riven");
  });
  it("does not confuse names that merely contain those words", () => {
    expect(modTier({ name: "Primed Amalgamated Thing", rarity: "Rare" })).toBe("rare"); expect(modTier({ name: "Not Archon", rarity: "Common" })).toBe("common");
  });
  it("falls back to a neutral frame for an unknown rarity, and spots Primed mods", () => {
    expect(modTier({ name: "Weird", rarity: "" })).toBe("other"); expect(modTier({ name: "Weird", rarity: "Mythic" })).toBe("other");
    expect(isPrimedMod("Primed Pressure Point")).toBe(true); expect(isPrimedMod("Pressure Point")).toBe(false);
  });
});
