import { describe, expect, it } from "vitest";
import { parseCatalog, partName, slugify } from "./catalog";
it("parses tolerant, drops exact duplicates and keeps slugs unique", () => {
  const r = parseCatalog([{ name: "Styanax Prime", health: 400, shield: "x", components: [{ name: "Chassis", drops: [{ location: "Axi S1", type: "Relic" }] }] }, { name: "Styanax Prime" }, 5, {}], "warframe")!;
  expect(r.map(e => e.slug)).toEqual(["styanax-prime"]);
  expect(r[0].stats).toEqual([["Health", 400]]);
  expect(r[0].isPrime).toBe(true);
  expect(r[0].components[0].drops[0].location).toBe("Axi S1");
  expect(parseCatalog("bad", "mod")).toBeNull();
  expect(slugify("Rhino  Prime!")).toBe("rhino-prime");
});
import { okMod } from "./useCatalog";
it("hides set markers and placeholder mods but keeps real ones", () => {
  const mk = (name: string, type: string, imageName = "a.png") => parseCatalog([{ name, type, imageName, description: "x" }], "mod")![0];
  expect(okMod(mk("Hawksetmod", "Mod Set Mod", "HawkHeader.png"))).toBe(false);
  expect(okMod(mk("Unfused Artifact", "Peculiar Mod", "OmegaMod.png"))).toBe(false);
  expect(okMod(mk("Rifle Riven Mod", "Rifle Riven Mod", "OmegaMod.png"))).toBe(false);
  expect(okMod(mk("Affinity Spike", "Focus Way", "FocusIcon60.jpg"))).toBe(false);
  expect(okMod(mk("Serration", "Primary Mod"))).toBe(true);
});
it("cleans game markup in descriptions and level stats", () => {
  const e = parseCatalog([{ name: "X", description: "Hits <DT_FIRE_COLOR>Heat enemies", levelStats: [{ stats: ["+15% <DT_PUNCTURE_COLOR>Puncture"] }] }], "mod")![0];
  expect(e.description).toBe("Hits Heat enemies"); expect(e.levelStats).toEqual([["+15% Puncture"]]);
});
it("duplicate entries keep the more complete one; same name with a different type stays separate", () => {
  const r = parseCatalog([{ name: "Adaptation", type: "Warframe Mod", rarity: "Rare" }, { name: "Adaptation", type: "Warframe Mod", rarity: "Rare", imageName: "a.png", levelStats: [{ stats: ["x"] }] }, { name: "Adaptation", type: "Stance Mod" }], "mod")!;
  expect(r.length).toBe(2); expect(r.find(e => e.type === "Warframe Mod")!.image).toBe("a.png"); expect(r.map(e => e.slug).sort()).toEqual(["adaptation", "adaptation-2"]);
});

describe("partName (schema without component names)", () => {
  it("reads the part from the uniqueName", () => {
    expect(partName("/Lotus/Types/Recipes/WarframeRecipes/AshPrimeSystemsComponent")).toBe("Systems");
    expect(partName("/Lotus/Types/Recipes/WarframeRecipes/AshPrimeHelmetComponent")).toBe("Neuroptics");
    expect(partName("/Lotus/Types/Recipes/WarframeRecipes/AshPrimeBlueprint")).toBe("Blueprint");
    expect(partName("/Lotus/Types/Recipes/Weapons/WeaponParts/AkstilettoPrimeBarrel")).toBe("Barrel");
    expect(partName("/Lotus/Weapons/WeaponParts/DaxDuviriAsymmetricalLongBowLowerLimb")).toBe("Lower Limb");
  });
  it("does not guess: resources are not parts", () => { expect(partName("/Lotus/Types/Items/MiscItems/OrokinCell")).toBeNull(); expect(partName("/Lotus/Types/Items/MiscItems/Neurode")).toBeNull(); });
  it("keeps parts of an entry that has only uniqueName and itemCount", () => {
    const r = parseCatalog([{ name: "Ash Prime", components: [{ uniqueName: "/x/AshPrimeBlueprint", itemCount: 1 }, { uniqueName: "/x/AshPrimeSystemsComponent", itemCount: 1 }, { uniqueName: "/Lotus/Types/Items/MiscItems/OrokinCell", itemCount: 1 }] }], "warframe")!;
    expect(r[0].components.map(c => c.name)).toEqual(["Blueprint", "Systems"]);
  });
});
