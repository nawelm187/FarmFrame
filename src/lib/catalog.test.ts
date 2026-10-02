import { expect, it } from "vitest";
import { parseCatalog, slugify } from "./catalog";
it("parses tolerant and unique slugs", () => {
  const r = parseCatalog([{ name: "Styanax Prime", health: 400, shield: "x", components: [{ name: "Chassis", drops: [{ location: "Axi S1", type: "Relic" }] }] }, { name: "Styanax Prime" }, 5, {}], "warframe")!;
  expect(r.map(e => e.slug)).toEqual(["styanax-prime", "styanax-prime-2"]);
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
  expect(okMod(mk("Serration", "Primary Mod"))).toBe(true);
});
