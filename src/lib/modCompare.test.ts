import { expect, it } from "vitest";
import { costAt, effectsAtMax } from "./modCompare";
import type { Entity } from "./catalog";
const mod = (x: Partial<Entity>) => ({ name: "M", slug: "m", baseDrain: 4, maxRank: 5, levelStats: null, description: "", ...x }) as Entity;
it("cost grows one per rank, auras give capacity, a missing cost stays missing", () => {
  expect(costAt(mod({}), 0)).toBe("4"); expect(costAt(mod({}), 5)).toBe("9");
  expect(costAt(mod({ baseDrain: -6 }), 5)).toBe("+11"); expect(costAt(mod({ baseDrain: null }), 3)).toBeNull();
});
it("effects come from the highest rank, one per line, or from the description when there are no levels", () => {
  expect(effectsAtMax(mod({ levelStats: [["+10% Health"], ["+20% Health\n+5% Armor"]] }))).toEqual(["+20% Health", "+5% Armor"]);
  expect(effectsAtMax(mod({ description: "Does a thing" }))).toEqual(["Does a thing"]); expect(effectsAtMax(mod({}))).toEqual([]);
});
