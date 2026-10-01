import { expect, it } from "vitest";
import { parseStats, slugOf } from "./market";
it("slug and strict stats", () => {
  expect(slugOf("Styanax Prime Chassis")).toBe("styanax_prime_chassis");
  const d = { payload: { statistics_closed: { "48hours": [{ median: 5, min_price: 3, max_price: 9, volume: 12 }, { median: 6, min_price: 4, max_price: 10, volume: 20 }] } } };
  expect(parseStats(d)).toEqual({ median: 6, min: 4, max: 10, volume: 20 });
  expect(parseStats({ payload: { statistics_closed: { "48hours": [{ median: 5 }] } } })).toBeNull(); expect(parseStats(null)).toBeNull();
});
