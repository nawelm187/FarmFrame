import { expect, it } from "vitest";
import { missing, progress, tiersOf } from "./goals";
const cs = [{ name: "Chassis", count: 1, drops: [{ location: "Axi S1 Relic", type: "Relic" }, { location: "axi K2", type: "" }], children: [] }, { name: "Blueprint", count: 2, drops: [], children: [] }];
it("progress, missing, tiers", () => {
  expect(progress(cs, { Chassis: 1, Blueprint: 1 })).toEqual({ total: 3, have: 2, pct: 67 });
  expect(progress(cs, { Blueprint: 9 }).have).toBe(2);
  expect(missing(cs, { Chassis: 1 }).map(c => c.name)).toEqual(["Blueprint"]);
  expect(tiersOf(cs[0])).toEqual(["Axi"]);
});
