import { expect, it } from "vitest";
import { dispositionCoverage, dispositionOf, hasIncarnonForm, incarnonWeapons } from "./coverage";
// Fixtures are small hand-made samples shaped like the catalog, not real data.
it("disposition is a number from 1 up, or null; zero and text never count", () => {
  expect(dispositionOf({ disposition: 3 })).toBe(3); expect(dispositionOf({ disposition: 0 })).toBeNull();
  expect(dispositionOf({ disposition: "3" })).toBeNull(); expect(dispositionOf({})).toBeNull(); expect(dispositionOf(null)).toBeNull();
});
it("coverage lists the weapons without disposition and the duplicate names", () => {
  const r = dispositionCoverage([{ name: "A", disposition: 1 }, { name: "B" }, { name: "a", disposition: 2 }, 5]);
  expect(r.status).toBe("MISSING"); expect(r.received).toBe(3); expect(r.found).toBe(2); expect(r.missing).toEqual(["B"]); expect(r.duplicates).toEqual(["a"]);
  expect(dispositionCoverage([{ name: "A", disposition: 1 }]).status).toBe("FOUND");
});
it("an empty or broken download is SOURCE_UNAVAILABLE, never a clean pass", () => {
  expect(dispositionCoverage([]).status).toBe("SOURCE_UNAVAILABLE"); expect(dispositionCoverage({ x: 1 }).status).toBe("SOURCE_UNAVAILABLE");
});
it("Incarnon is read from the attack list as well as from tags", () => {
  expect(hasIncarnonForm({ tags: ["Corpus"], attacks: [{ name: "Normal Attack" }, { name: "Incarnon Form" }] })).toBe(true);
  expect(hasIncarnonForm({ tags: ["Incarnon"] })).toBe(true); expect(hasIncarnonForm({ tags: ["Tenno"], attacks: [] })).toBe(false);
  expect(incarnonWeapons([{ name: "X", attacks: [{ name: "Incarnon Form" }] }, { name: "Y" }])).toEqual(["X"]);
});
