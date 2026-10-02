import { expect, it } from "vitest";
import { parseStats, slugOf } from "./market";
it("slug and strict stats", () => {
  expect(slugOf("Styanax Prime Chassis")).toBe("styanax_prime_chassis");
  const d = { payload: { statistics_closed: { "48hours": [{ median: 5, min_price: 3, max_price: 9, volume: 12 }, { median: 6, min_price: 4, max_price: 10, volume: 20 }] } } };
  expect(parseStats(d)).toEqual({ median: 6, min: 4, max: 10, volume: 20 });
  expect(parseStats({ payload: { statistics_closed: { "48hours": [{ median: 5 }] } } })).toBeNull(); expect(parseStats(null)).toBeNull();
});
import { candidates } from "./market";
it("tries the name with and without Blueprint", () => {
  expect(candidates("Ash Prime Chassis Blueprint")).toEqual(["ash_prime_chassis_blueprint", "ash_prime_chassis"]);
  expect(candidates("Orokin Cell")).toEqual(["orokin_cell"]);
});
import { sumParts } from "./market";
it("sums parts with quantities and lists unpriced ones", () => {
  expect(sumParts([{ name: "A", count: 1 }, { name: "B", count: 2 }, { name: "C", count: 1 }], { A: 10, B: 4.5, C: null })).toEqual({ total: 19, missing: ["C"] });
});
it("rank filter picks the matching bucket for rankable mods", () => {
  const d = { payload: { statistics_closed: { "48hours": [{ mod_rank: 0, median: 5, min_price: 4, max_price: 6, volume: 9 }, { mod_rank: 10, median: 40, min_price: 30, max_price: 50, volume: 3 }] } } };
  expect(parseStats(d, 0)?.median).toBe(5); expect(parseStats(d, 10)?.median).toBe(40); expect(parseStats(d, 7)).toBeNull();
});
