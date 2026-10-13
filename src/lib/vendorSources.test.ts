import { expect, it } from "vitest";
import { vendorSources } from "./vendorSources";
it("finds who sells an item and at which rank", () => {
  const h = vendorSources("Archon Continuity");
  expect(h.length > 0).toBe(true);
  expect(h[0].seller.startsWith("Kahl's Garrison")).toBe(true);
  expect(h[0].price).toBe("40 Stock");
  expect(h[0].need?.startsWith("Rank 3")).toBe(true);
  const s = vendorSources("Seeking Shuriken");
  expect(s[0].seller).toBe("Arbiters of Hexis");
  expect(s[0].price).toBe(`${(25000).toLocaleString()} standing`); // follows the machine's number format, so the test does too
});
it("ignores the Warframe in brackets and short or unknown names", () => {
  expect(vendorSources("Seeking Shuriken").length > 0).toBe(true);
  expect(vendorSources("zz").length).toBe(0);
  expect(vendorSources("Definitely Not An Item").length).toBe(0);
});
