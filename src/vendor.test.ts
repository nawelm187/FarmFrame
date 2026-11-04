import { describe, expect, it } from "vitest";
import { categorize, groupStock, variants, type Known } from "./vendor";
const k: Known = { mods: new Set(["primed cryo rounds", "scattering inferno", "voltaic strike", "primed ravage"]), weapons: new Set(["okina prime", "velox prime", "baza prime"]), frames: new Set(["protea prime", "ivara prime"]) };
describe("vendor stock groups", () => {
  it("uses the catalogs first", () => {
    expect(categorize("Primed Cryo Rounds", k)).toBe("mod"); expect(categorize("Scattering Inferno", k)).toBe("mod");
    expect(categorize("Prime Okina", k)).toBe("weapon"); expect(categorize("Prime Velox Pistol", k)).toBe("weapon"); expect(categorize("Protea Prime", k)).toBe("warframe");
  });
  it("falls back to words in the name", () => {
    expect(categorize("Zylok Exilis Skin", k)).toBe("cosmetic"); expect(categorize("Ki'teer Diax Syandana", k)).toBe("cosmetic"); expect(categorize("Ivara Prime Cape", k)).toBe("cosmetic");
    expect(categorize("Left Prisma Daedalus Shoulder Guard", k)).toBe("cosmetic"); expect(categorize("Axi A2 Relic (Intact)", k)).toBe("relic"); expect(categorize("T2 Void Projection Protea Ivara Vault B Bronze", k)).toBe("relic");
    expect(categorize("M P V Protea Prime Single Pack", k)).toBe("pack"); expect(categorize("Orokin Reactor Blueprint", k)).toBe("resource"); expect(categorize("Something Unknown", k)).toBe("other");
  });
  it("groups in a fixed order, priciest first", () => {
    const g = groupStock([{ name: "Zylok Exilis Skin", ducats: 300 }, { name: "Primed Ravage", ducats: 280 }, { name: "Primed Cryo Rounds", ducats: 350 }], k);
    expect(g.map(x => x.cat)).toEqual(["mod", "cosmetic"]); expect(g[0].items.map(i => i.name)).toEqual(["Primed Cryo Rounds", "Primed Ravage"]);
    expect(variants("Prime Okina")).toContain("okina prime");
  });
});
