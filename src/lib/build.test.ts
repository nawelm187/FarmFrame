import { expect, it } from "vitest";
import { drain, evaluate, newBuild } from "./build";
import type { Entity } from "./catalog";
const mod = (name: string, baseDrain: number, polarity: string | null, maxRank = 5): Entity => ({ slug: name.toLowerCase(), name, type: "", description: "", image: null, isPrime: false, vaulted: null, stats: [], facts: [], components: [], polarity, baseDrain, maxRank, compat: "", slots: null });
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
