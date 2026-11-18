import { describe, expect, it } from "vitest";
import { findFrame, modsForFrame } from "./modAdvice";
import type { Entity } from "./catalog";
const e = (name: string, o: Partial<Entity> = {}) => ({ name, slug: name.toLowerCase().replace(/\W+/g, "-"), type: "Warframe Mod", compat: "WARFRAME", rarity: "Common", levelStats: [["+10% Health"]], description: "", baseDrain: 4, maxRank: 5, ...o }) as Entity;
const frames = ["Rhino", "Rhino Prime", "Ash", "Ash Prime", "Atlas"].map(n => e(n, { type: "Warframe", compat: "" }));
describe("findFrame", () => {
  it("finds a Warframe by name, without Prime, or by the start of the name", () => {
    expect(findFrame("rhino", frames)?.name).toBe("Rhino"); expect(findFrame("Rhino Prime", frames)?.name).toBe("Rhino Prime"); expect(findFrame("atl", frames)).toBeNull(); expect(findFrame("", frames)).toBeNull(); expect(findFrame("zzz", frames)).toBeNull();
  });
  it("a Prime name falls back to the base frame when only that exists", () => { expect(findFrame("atlas prime", frames)).toBeNull(); expect(findFrame("ash", frames)?.name).toBe("Ash"); });
});
describe("modsForFrame", () => {
  const names = new Set(["rhino", "ash", "atlas"]);
  const mods = [e("Vitality", { rarity: "Rare" }), e("Steel Fiber", { levelStats: [["+10% Armor"]] }), e("Intensify", { rarity: "Rare", levelStats: [["+30% Ability Strength"]] }), e("Iron Shrapnel", { compat: "Rhino", rarity: "Rare" }), e("Smoke Shadow", { compat: "Ash" }),
    e("Serration", { type: "Primary Mod", compat: "Rifle" }), e("Steel Charge", { type: "Aura Mod", compat: "AURA" }), e("Flow", { levelStats: [["+50% Energy Max"]], rarity: "Legendary" }), e("Odd", { levelStats: [["nothing useful"]] })];
  it("puts the mods made for that Warframe apart from the general ones, and never mixes in another Warframe's", () => {
    const r = modsForFrame("Rhino Prime", mods, names); expect(r.exclusive.map(m => m.name)).toEqual(["Iron Shrapnel"]);
    const all = r.groups.flatMap(g => g.mods.map(m => m.name)); expect(all).not.toContain("Smoke Shadow"); expect(all).not.toContain("Iron Shrapnel");
  });
  it("leaves out weapon and aura mods and groups the rest by effect, best quality first, with a limit", () => {
    const r = modsForFrame("Rhino", mods, names, 1), g = Object.fromEntries(r.groups.map(x => [x.key, x.mods.map(m => m.name)]));
    expect(g.health).toEqual(["Vitality"]); expect(g.armor).toEqual(["Steel Fiber"]); expect(g.strength).toEqual(["Intensify"]); expect(g.energy).toEqual(["Flow"]);
    expect(Object.values(g).flat()).not.toContain("Serration"); expect(Object.values(g).flat()).not.toContain("Steel Charge"); expect(Object.values(g).flat()).not.toContain("Odd");
  });
  it("gives empty groups when nothing matches", () => { expect(modsForFrame("Rhino", [], names)).toEqual({ exclusive: [], groups: [] }); });
});
