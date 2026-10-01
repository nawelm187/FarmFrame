import { expect, it } from "vitest";
import { baroMatches, expired, isExp } from "./planner";
import { value } from "./farmNow";
it("baro relevance only when active", () => {
  const t = { expiry: "x", active: true, inventory: [{ item: "Styanax Prime Blueprint" }, { item: "Other" }] };
  expect(baroMatches(t, new Set(["styanax prime blueprint"])).map(i => i.item)).toEqual(["Styanax Prime Blueprint"]);
  expect(baroMatches({ ...t, active: false }, new Set(["styanax prime blueprint"]))).toEqual([]);
});
it("guards and value", () => {
  expect(isExp({ expiry: "2020-01-01T00:00:00Z" })).toBe(true); expect(isExp(5)).toBe(false);
  expect(expired({ expiry: "2020-01-01T00:00:00Z" })).toBe(true);
  expect([value(1), value(2), value(3), value(5)]).toEqual(["Low", "Medium", "High", "High"]);
});
