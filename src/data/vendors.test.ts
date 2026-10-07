import { expect, it } from "vitest";
import { ARB_ROTATIONS, PALLADINO, rotationTotal } from "./vendors";
it("every Arbitration rotation adds up to 100%, so the copied table is complete", () => {
  for (const k of ["A", "B", "C"] as const) expect(rotationTotal(ARB_ROTATIONS[k])).toBe(100);
});
it("Palladino wares are priced and limited", () => { expect(PALLADINO.every(w => w.cost > 0 && w.limit)).toBe(true); });
