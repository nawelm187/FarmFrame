import { expect, it } from "vitest";
import { calc, parseEffect } from "./calc";
import { newBuild } from "./build";
import type { Entity } from "./catalog";
const mod = (name: string, levelStats: string[][]): Entity => ({ slug: name.toLowerCase(), name, type: "", description: "", image: null, isPrime: false, vaulted: null, stats: [], facts: [], components: [], polarity: null, baseDrain: 4, maxRank: levelStats.length - 1, compat: "", rarity: "", slots: null, levelStats, category: "", raw: {} });
it("parses only plain percent lines", () => {
  expect(parseEffect("+110% Health")).toEqual({ key: "health", pct: 110 });
  expect(parseEffect("-15% Ability Duration")).toEqual({ key: "duration", pct: -15 });
  expect(parseEffect("+30% Health on kill")).toBeNull(); expect(parseEffect("+5% Mystery")).toBeNull();
});
it("sums per stat at the chosen rank and reports the rest", () => {
  const b = newBuild(); b.slots[0] = { mod: "vitality", rank: 1 }; b.slots[1] = { mod: "flow", rank: 0 }; b.slots[2] = { mod: "odd", rank: 0 };
  const r = calc(b, new Map([["vitality", mod("Vitality", [["+10% Health"], ["+20% Health", "+5% Ability Strength"]])], ["flow", mod("Flow", [["+25% Health", "+50% Energy Max"]])], ["odd", mod("Odd", [["+9% Health on kill"]])]]));
  expect(r.stats.find(s => s.key === "health")?.pct).toBe(45); expect(r.stats.find(s => s.key === "strength")?.pct).toBe(5); expect(r.stats.find(s => s.key === "energy")?.pct).toBe(50);
  expect(r.unparsed).toEqual(["Odd: +9% Health on kill"]);
});
