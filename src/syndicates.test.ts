import { expect, it } from "vitest";
import { affordable, parseSyndicates, toTarget } from "./syndicates";
const raw = { syndicates: { "The Quills": [{ item: "Magus Vigor", place: "The Quills, Mote", standing: 2500 }, { item: "Zenurik Charge", place: "The Quills, Mote", standing: 500 }, { item: "Sigil", place: "The Quills, Neutral", standing: 0, cost: 100 }], "Empty": [], "Bad": "x" } };
it("groups offers by rank in file order and sorts by standing", () => {
  const s = parseSyndicates(raw)!; expect(s).toHaveLength(1); expect(s[0].name).toBe("The Quills"); expect(s[0].count).toBe(3);
  expect(s[0].ranks.map(r => r.rank)).toEqual(["Mote", "Neutral"]); expect(s[0].ranks[0].offers.map(o => o.item)).toEqual(["Zenurik Charge", "Magus Vigor"]); expect(s[0].ranks[1].offers[0].cost).toBe(100);
});
it("returns null for unexpected shapes", () => { expect(parseSyndicates(null)).toBeNull(); expect(parseSyndicates([])).toBeNull(); expect(parseSyndicates({ syndicates: {} })).toBeNull(); });
it("says what standing can buy and how much is missing", () => {
  const a = affordable([{ item: "A", standing: 500, cost: null }, { item: "B", standing: 2500, cost: null }], 1000);
  expect(a[0].canBuy).toBe(true); expect(a[1].canBuy).toBe(false); expect(a[1].missing).toBe(1500);
});
it("computes progress to a target", () => { expect(toTarget(2500, 5000)).toEqual({ left: 2500, pct: 50 }); expect(toTarget(6000, 5000)).toEqual({ left: 0, pct: 100 }); expect(toTarget(0, 0)).toEqual({ left: 0, pct: 0 }); });

import { clampStanding as cs, effects as ef, toRank as tr } from "./syndicates";
it("faction relations apply +50 / -50 / -100 percent", () => {
  expect(ef("Steel Meridian", 10000)).toEqual([{ name: "Red Veil", kind: "ally", delta: 5000 }, { name: "New Loka", kind: "opposed", delta: -5000 }, { name: "Perrin Sequence", kind: "enemy", delta: -10000 }]);
  expect(ef("Conclave", 1000)).toEqual([]);
});
it("standing is kept inside the rank table and ranks add up", () => {
  expect(cs(0, -9000)).toBe(-5000); expect(cs(-2, -50000)).toBe(-44000); expect(cs(1, 30000)).toBe(22000);
  expect(tr(0, 1000, 1)).toBe(4000); expect(tr(1, 0, 3)).toBe(66000); expect(tr(3, 0, 3)).toBe(0); expect(tr(0, 0, 99)).toBe(5000 + 22000 + 44000 + 70000 + 99000);
});
