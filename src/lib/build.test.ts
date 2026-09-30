import { expect, it } from "vitest";
import { drain, endoFor, evaluate, newBuild, requirements } from "./build";
import type { Entity } from "./catalog";
const mod = (name: string, baseDrain: number, polarity: string | null, maxRank = 5, rarity = "Common"): Entity => ({ slug: name.toLowerCase(), name, type: "", description: "", image: null, isPrime: false, vaulted: null, stats: [], facts: [], components: [], polarity, baseDrain, maxRank, compat: "", rarity, slots: null });
it("drain rules", () => {
  const m = mod("Vitality", 4, "madurai");
  expect(drain(m, 10, "madurai")).toBe(7);
  expect(drain(m, 10, "naramon")).toBe(18);
  expect(drain(m, 10, null)).toBe(14);
  expect(drain(mod("Aura", -6, "madurai"), 0, null)).toBeNull();
});
it("flags capacity, duplicates, rank", () => {
  const b = newBuild(); b.reactor = false; b.slots[0] = { mod: "vitality", rank: 9 }; b.slots[1] = { mod: "vitality", rank: 5 };
  const r = evaluate(b, undefined, new Map([["vitality", mod("Vitality", 4, null)]]));
  const t = r.issues.map(i => i.text).join("|");
  expect(t).toContain("more than once"); expect(t).toContain("exceeds max rank"); expect(t).toContain("Capacity exceeded");
});
it("endo estimate and requirements", () => {
  expect(endoFor("Common", 10)).toBe(10230); expect(endoFor("Weird", 3)).toBeNull();
  const b = newBuild(); b.frame = "rhino"; b.haveFrame = true; b.slots[0] = { mod: "vitality", rank: 2, owned: true }; b.slots[1] = { mod: "steel", rank: 1 };
  const r = requirements(b, undefined, new Map([["vitality", mod("Vitality", 4, null)], ["steel", mod("Steel", 4, null)]]));
  expect(r.missingMods.map(m => m.name)).toEqual(["Steel"]); expect(r.endoTotal).toBe(30 + 10); expect(r.frame?.have).toBe(true);
});
