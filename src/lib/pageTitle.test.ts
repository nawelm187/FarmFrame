import { expect, it } from "vitest";
import { titleFrom } from "./pageTitle";
it("builds the tab title from the page heading", () => {
  expect(titleFrom("Helminth")).toBe("Helminth · FarmFrame");
  expect(titleFrom("  Mastery   Rank ")).toBe("Mastery Rank · FarmFrame");
  expect(titleFrom("")).toBe("FarmFrame");
  expect(titleFrom(null)).toBe("FarmFrame");
});
