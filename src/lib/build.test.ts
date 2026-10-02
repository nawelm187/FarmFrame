import { expect, it } from "vitest";
import { drain, endoFor, evaluate, newBuild, requirements } from "./build";
import type { Entity } from "./catalog";
const mod = (name: string, baseDrain: number, polarity: string | null, maxRank = 5, rarity = "Common"): Entity => ({ slug: name.toLowerCase(), name, type: "", description: "", image: null, isPrime: false, vaulted: null, stats: [], facts: [], components: [], polarity, baseDrain, maxRank, compat: "", rarity, slots: null, levelStats: null, category: "", raw: {}, tradable: null });
it("drain rules", () => {
  const m = mod("Vitality", 4, "madurai");
  expect(drain(m, 10, "madurai")).toBe(7);
  expect(drain(m, 10, "naramon")).toBe(18);
  expect(drain(m, 10, null)).toBe(14);
  expect(drain(mod("Aura", -6, "madurai"), 0, null)).toBeNull();
});
it("flags capacity, duplicates, rank", () => {
  const b = newBuild(); b.reactor = false; b.slots[0] = { mod: "vitality", rank: 9 }; b.slots[1] = { mod: "vitality", rank: 5 };
  const r = evaluate(b, undefined, new Map([["vitality", mod("Vitality", 12, null)]]));
  const t = r.issues.map(i => i.text).join("|");
  expect(t).toContain("more than once"); expect(t).toContain("exceeds max rank"); expect(t).toContain("Capacity exceeded");
});
it("endo estimate and requirements", () => {
  expect(endoFor("Common", 10)).toBe(10230); expect(endoFor("Weird", 3)).toBeNull();
  const b = newBuild(); b.frame = "rhino"; b.haveFrame = true; b.slots[0] = { mod: "vitality", rank: 2, owned: true }; b.slots[1] = { mod: "steel", rank: 1 };
  const r = requirements(b, undefined, new Map([["vitality", mod("Vitality", 4, null)], ["steel", mod("Steel", 4, null)]]));
  expect(r.missingMods.map(m => m.name)).toEqual(["Steel"]); expect(r.endoTotal).toBe(30 + 10); expect(r.frame?.have).toBe(true);
});
it("forma from polarity overrides changes drain", () => {
  const f = { ...mod("Frame", 0, null), slots: ["madurai", "naramon", "", "", "", "", "", ""] };
  const b = newBuild(); b.slots[0] = { mod: "vitality", rank: 10, pol: "naramon" }; b.slots[1] = { mod: "steel", rank: 0, pol: "naramon" };
  const m = new Map([["vitality", mod("Vitality", 4, "naramon")], ["steel", mod("Steel", 4, "naramon")]]);
  expect(requirements(b, f, m).forma).toBe(1);
  expect(evaluate(b, f, m).rows[0].d).toBe(7);
});
it("arcanes: missing and duplicate", () => {
  const b = newBuild(); b.arcanes = [{ mod: "energize" }, { mod: "energize", owned: true }];
  const r = requirements(b, undefined, new Map(), new Map([["energize", mod("Energize", 0, null)]]));
  expect(r.missingArcanes.map(a => a.name)).toEqual(["Energize"]); expect(r.arcDup).toBe(true);
});
import { modFits } from "./build";
it("omni forma is counted apart from normal forma and halves drain", () => {
  const f = { ...mod("Frame", 0, null), slots: ["madurai", "naramon", "", "", "", "", "", ""] };
  const b = newBuild(); b.slots[0] = { mod: "vitality", rank: 10, pol: "any" }; b.slots[1] = { mod: null, rank: 0, pol: "zenurik" };
  const m = new Map([["vitality", mod("Vitality", 4, "naramon")]]);
  const r = requirements(b, f, m); expect(r.forma).toBe(1); expect(r.omni).toBe(1);
  expect(drain(mod("V", 4, "naramon"), 10, "any")).toBe(7);
});
it("companion and weapon mods do not fit a Warframe build", () => {
  const w = { ...mod("Vitality", 4, null), type: "Warframe Mod", compat: "Warframe" }, c = { ...mod("Link", 4, null), type: "Companion Mod" }, g = { ...mod("Serration", 4, null), type: "Rifle Mod", compat: "Rifle" };
  expect(modFits("warframe", w)).toBe(true); expect(modFits("warframe", c)).toBe(false); expect(modFits("warframe", g)).toBe(false);
  expect(modFits("primary", g)).toBe(true); expect(modFits("primary", w)).toBe(false); expect(modFits("companion", c)).toBe(true);
  const b = newBuild(); b.slots[0] = { mod: "link", rank: 0 };
  expect(evaluate(b, undefined, new Map([["link", c]])).issues.map(i => i.text).join()).toContain("not a Warframe mod");
});
