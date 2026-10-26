import { expect, it } from "vitest";
import { allSlots, capacityBonus, evaluate, modFits, newBuild, requirements, specialFits, SPECIALS } from "./build";
import type { Entity } from "./catalog";
const mod = (name: string, baseDrain: number, polarity: string | null, over: Partial<Entity> = {}): Entity => ({ slug: name.toLowerCase(), name, type: "", description: "", image: null, isPrime: false, vaulted: null, stats: [], facts: [], components: [], polarity, baseDrain, maxRank: 5, compat: "", rarity: "Common", slots: null, levelStats: null, category: "", raw: {}, tradable: null, ...over });
const aura = (n = "Steel Charge", base = -6, pol = "madurai") => mod(n, base, pol, { type: "Aura Mod", compat: "Warframe", maxRank: 3 });
it("aura capacity: base + rank, doubled on a match or an omni slot, 25% less (rounded) on a mismatch", () => {
  const a = aura(); // base 6, rank 3 -> 9
  expect(capacityBonus(a, 3, null)).toBe(9); expect(capacityBonus(a, 3, "madurai")).toBe(18); expect(capacityBonus(a, 3, "any")).toBe(18); expect(capacityBonus(a, 3, "naramon")).toBe(7);
  expect(capacityBonus(mod("X", null as unknown as number, "madurai"), 3, null)).toBeNull();
});
it("an aura in the aura slot raises capacity instead of spending it", () => {
  const b = { ...newBuild(), kind: "warframe" as const, special: { aura: { mod: "steel charge", rank: 3, pol: "madurai" } } };
  const r = evaluate(b, undefined, new Map([["steel charge", aura()]]));
  expect(r.capacity).toBe(60 + 18); expect(r.total).toBe(0); expect(r.special.find(s => s.key === "aura")?.bonus).toBe(18);
});
it("an exilus mod spends capacity like a normal one, and needs the utility flag", () => {
  const u = mod("Speed Drift", 4, null, { type: "Warframe Mod", raw: { isUtility: true } }), n = mod("Vitality", 4, null, { type: "Warframe Mod", raw: { isUtility: false } }), q = mod("Unknown", 4, null, { type: "Warframe Mod" });
  const mk = (slug: string) => ({ ...newBuild(), kind: "warframe" as const, special: { exilus: { mod: slug, rank: 2, pol: undefined } } });
  const ok = evaluate(mk("speed drift"), undefined, new Map([["speed drift", u]])); expect(ok.total).toBe(6); expect(ok.issues).toEqual([]);
  expect(evaluate(mk("vitality"), undefined, new Map([["vitality", n]])).issues.map(i => i.level + ":" + i.text).join()).toContain("error:Vitality does not fit the Exilus slot");
  expect(evaluate(mk("unknown"), undefined, new Map([["unknown", q]])).issues.map(i => i.level).join()).toBe("warn");
  expect(specialFits("exilus", "warframe", u)).toBe("yes"); expect(specialFits("exilus", "warframe", n)).toBe("no"); expect(specialFits("exilus", "warframe", q)).toBe("unknown");
});
it("stance mods go only in a melee Stance slot, aura mods only in a Warframe Aura slot, and neither in a normal slot", () => {
  const st = mod("Iron Phoenix", -10, "madurai", { type: "Stance Mod", compat: "Sword" });
  expect(specialFits("stance", "melee", st)).toBe("yes"); expect(specialFits("stance", "primary", st)).toBe("no"); expect(specialFits("aura", "melee", aura())).toBe("no"); expect(specialFits("aura", "warframe", aura())).toBe("yes");
  expect(modFits("warframe", aura())).toBe(false); expect(modFits("melee", st)).toBe(false);
});
it("special slots exist only where the item has them", () => {
  expect(SPECIALS.warframe).toEqual(["aura", "exilus"]); expect(SPECIALS.melee).toEqual(["stance", "exilus"]); expect(SPECIALS.companion).toEqual([]);
  expect(allSlots({ ...newBuild(), kind: "companion" }).length).toBe(8); expect(allSlots({ ...newBuild(), kind: "melee" }).length).toBe(10); expect(allSlots({ ...newBuild(), kind: "primary" }).length).toBe(9);
});
it("special-slot mods are counted as used once and listed in the requirements", () => {
  const a = aura(), b = { ...newBuild(), kind: "warframe" as const, slots: newBuild().slots.map((s, i) => (i === 0 ? { mod: "steel charge", rank: 3 } : s)), special: { aura: { mod: "steel charge", rank: 3 } } };
  expect(evaluate(b, undefined, new Map([["steel charge", a]])).issues.map(i => i.text).join()).toContain("used more than once");
  const r = requirements({ ...b, slots: newBuild().slots }, undefined, new Map([["steel charge", a]])); expect(r.mods.map(m => m.slug)).toEqual(["steel charge"]);
});
