import { describe, expect, it } from "vitest";
import { parseCatalog } from "./catalog";
import { difficulty, resolvePart } from "./part";
const ents = parseCatalog([
  { name: "Ash Prime", components: [{ name: "Blueprint" }, { name: "Neuroptics", ducats: 45 }, { name: "Systems" }] },
  { name: "Ash", components: [{ name: "Blueprint" }, { name: "Systems" }] },
  { name: "Serration" },
], "warframe")!.map(e => ({ e, cat: "warframe" as const }));
describe("resolvePart", () => {
  it("finds the component of the longest matching item", () => {
    const r = resolvePart("Ash Prime Neuroptics Blueprint", ents)!;
    expect(r.entity.name).toBe("Ash Prime"); expect(r.comp.name).toBe("Neuroptics"); expect(r.blueprint).toBe(true); expect(r.title).toBe("Ash Prime Neuroptics Blueprint");
  });
  it("handles the built part, the main blueprint and case", () => {
    expect(resolvePart("ash prime systems", ents)!.blueprint).toBe(false);
    const m = resolvePart("Ash Prime Blueprint", ents)!; expect(m.comp.name).toBe("Blueprint"); expect(m.title).toBe("Ash Prime Blueprint");
    expect(resolvePart("Ash Systems", ents)!.entity.name).toBe("Ash");
  });
  it("returns null instead of guessing", () => {
    expect(resolvePart("Ash Prime Barrel", ents)).toBeNull(); expect(resolvePart("Ash Prime", ents)).toBeNull(); expect(resolvePart("Forma Blueprint", ents)).toBeNull(); expect(resolvePart("Serration Blueprint", ents)).toBeNull();
  });
});
describe("difficulty", () => {
  const o = (rarity: string, vaulted: boolean | null) => ({ name: "Axi A1", tier: "Axi", rarity, chance: {}, vaulted, stack: 1 });
  it("uses rarity and vault status", () => {
    expect(difficulty([o("Common", false)], 0).level).toBe("Easy"); expect(difficulty([o("Rare", false), o("Uncommon", false)], 0).level).toBe("Medium");
    expect(difficulty([o("Rare", false)], 0).level).toBe("Hard"); expect(difficulty([o("Common", true)], 0).level).toBe("Very hard");
    expect(difficulty([], 2).level).toBe("Medium"); expect(difficulty([], 0).level).toBe("Unknown");
  });
});
