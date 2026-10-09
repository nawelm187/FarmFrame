import { expect, it } from "vitest";
import { ACRITHIS, ARB_ROTATIONS, PALLADINO, acrithisOutdated, rotationTotal, weekStartUtc } from "./vendors";
it("every Arbitration rotation adds up to 100%, so the copied table is complete", () => {
  for (const k of ["A", "B", "C"] as const) expect(rotationTotal(ARB_ROTATIONS[k])).toBe(100);
});
it("Palladino wares are priced and limited", () => { expect(PALLADINO.every(w => w.cost > 0 && w.limit)).toBe(true); });
it("Acrithis' list is valid for its own week and outdated from the next Monday 00:00 UTC", () => {
  expect(new Date(weekStartUtc("2026-10-07")).toISOString()).toBe("2026-10-05T00:00:00.000Z");
  expect(acrithisOutdated(Date.parse("2026-10-11T23:59:59Z"))).toBe(false);
  expect(acrithisOutdated(Date.parse("2026-10-12T00:00:00Z"))).toBe(true);
  expect(ACRITHIS.wares.length).toBe(5);
});
