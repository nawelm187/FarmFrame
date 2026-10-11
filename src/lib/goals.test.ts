import { expect, it } from "vitest";
import { missing, progress, tiersOf } from "./goals";
const cs = [{ name: "Chassis", count: 1, drops: [{ location: "Axi S1 Relic", type: "Relic" }, { location: "axi K2", type: "" }], children: [] }, { name: "Blueprint", count: 2, drops: [], children: [] }];
it("progress, missing, tiers", () => {
  expect(progress(cs, { Chassis: 1, Blueprint: 1 })).toEqual({ total: 3, have: 2, pct: 67 });
  expect(progress(cs, { Blueprint: 9 }).have).toBe(2);
  expect(missing(cs, { Chassis: 1 }).map(c => c.name)).toEqual(["Blueprint"]);
  expect(tiersOf(cs[0])).toEqual(["Axi"]);
});
import { cleanCounts, cleanGoals, cleanOwned } from "./goals";
import { cleanReqs } from "./reqs";
it("drops damaged stored entries instead of passing them on", () => {
  expect(cleanGoals([{ id: "warframe:ash", cat: "warframe", slug: "ash", name: "Ash" }, null, { id: 1 }, "x"])).toEqual([{ id: "warframe:ash", cat: "warframe", slug: "ash", name: "Ash" }]);
  expect(cleanGoals({ not: "an array" })).toEqual([]);
  expect(cleanCounts({ a: 2, b: -1, c: "3", d: NaN, e: 0 })).toEqual({ a: 2, e: 0 });
  expect(cleanOwned({ g1: { Systems: 1, Bad: "x" }, g2: [1], g3: null })).toEqual({ g1: { Systems: 1 } });
});
it("keeps valid requirements, repairs a missing source list and drops the rest", () => {
  const ok = { id: "b:mod:serration", build: "b", buildName: "B", kind: "mod", name: "Serration", slug: "serration", need: 1, have: 0, src: ["Cephalon Simaris"] };
  expect(cleanReqs([ok, { ...ok, id: "2", src: undefined }, { ...ok, id: "3", kind: "weird" }, { ...ok, id: "4", need: "1" }, null])).toEqual([ok, { ...ok, id: "2", src: [] }]);
  expect(cleanReqs("nope")).toEqual([]);
});
