import { expect, it } from "vitest";
import { baroMatches, expired, isExp, traderState } from "./planner";
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
it("baro state comes from the timestamps, not from a missing active flag", () => {
  const t = { activation: "2026-10-02T13:00:00.000Z", expiry: "2026-10-04T13:00:00.000Z", inventory: [{ item: "Primed Cryo Rounds" }] };
  const at = (iso: string) => Date.parse(iso);
  expect(traderState(t, at("2026-10-01T00:00:00Z"))).toBe("coming");
  expect(traderState(t, at("2026-10-03T07:00:00Z"))).toBe("here");
  expect(traderState(t, at("2026-10-05T00:00:00Z"))).toBe("gone");
  expect(baroMatches(t, new Set(["primed cryo rounds"]), at("2026-10-03T07:00:00Z")).length).toBe(1);
  expect(baroMatches(t, new Set(["primed cryo rounds"]), at("2026-10-01T00:00:00Z"))).toEqual([]);
  expect(traderState({ expiry: "x", active: true })).toBe("here"); expect(traderState({ expiry: "x" })).toBe("unknown");
});
