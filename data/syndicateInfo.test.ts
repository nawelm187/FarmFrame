import { expect, it } from "vitest";
import { ALL_SYNDICATES, FACTION, RANKS, dailyCap, groupOfSyndicate, keyOf } from "./syndicateInfo";
it("every relation points to another faction and the three effects differ", () => {
  for (const [k, r] of Object.entries(FACTION)) { const s = [r.ally, r.opposed, r.enemy]; expect(new Set(s).size).toBe(3); for (const x of s) { expect(FACTION[keyOf(x)]).toBeDefined(); expect(keyOf(x)).not.toBe(k); } }
});
it("allies are mutual", () => { for (const [k, r] of Object.entries(FACTION)) expect(keyOf(FACTION[keyOf(r.ally)].ally)).toBe(k); });
it("rank table has -2..5 and the lowest standing is -44000", () => { expect(RANKS.map(r => r.rank)).toEqual([5, 4, 3, 2, 1, 0, -1, -2]); expect(Math.min(...RANKS.map(r => r.min))).toBe(-44000); });
it("daily cap and names", () => { expect(dailyCap(0)).toBe(16000); expect(dailyCap(30)).toBe(31000); expect(keyOf("The Perrin Sequence")).toBe("perrin sequence"); expect(keyOf("Kahl's Garrison")).toBe("kahls garrison"); expect(groupOfSyndicate("Red Veil")).toBe("faction"); expect(groupOfSyndicate("Conclave")).toBe("neutral"); });

it("ALL_SYNDICATES lists every syndicate once, including all six faction syndicates", () => {
  const keys = ALL_SYNDICATES.map(keyOf);
  expect(new Set(keys).size).toBe(keys.length);
  for (const f of Object.keys(FACTION)) expect(keys).toContain(f);
  expect(keys.length).toBe(22);
});
it("ALL_SYNDICATES puts each one in a known group", () => {
  for (const n of ALL_SYNDICATES) expect(["faction", "open-world", "neutral", "event"]).toContain(groupOfSyndicate(n));
});
