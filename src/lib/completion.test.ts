import { expect, it } from "vitest";
import { completionNote, nextTracked } from "./completion";
const comps = [{ name: "Chassis", count: 1, drops: [], children: [] }, { name: "Systems", count: 1, drops: [], children: [] }];
it("notes a part that just became complete and names the next missing one", () => {
  const n = completionNote("g", "Wisp Prime", comps, { Chassis: 0 }, { Chassis: 1 }, "Chassis");
  expect(n?.have).toBe(1); expect(n?.total).toBe(2); expect(n?.next).toBe("Systems"); expect(n?.goalDone).toBe(false); expect(n?.prev).toBe(0);
  expect(n?.text).toContain("Next: Systems");
});
it("says the goal is complete when the last part is collected", () => {
  const n = completionNote("g", "Wisp Prime", comps, { Chassis: 1, Systems: 0 }, { Chassis: 1, Systems: 1 }, "Systems");
  expect(n?.goalDone).toBe(true); expect(n?.next).toBeNull(); expect(n?.text).toContain("is complete");
});
it("returns null for changes that do not complete a part", () => {
  expect(completionNote("g", "W", comps, { Chassis: 0 }, { Chassis: 0 }, "Chassis")).toBeNull();
  expect(completionNote("g", "W", comps, { Chassis: 1 }, { Chassis: 0 }, "Chassis")).toBeNull();
  expect(completionNote("g", "W", comps, { Chassis: 1 }, { Chassis: 1 }, "Chassis")).toBeNull();
  expect(completionNote("g", "W", comps, {}, { Nope: 1 }, "Nope")).toBeNull();
});
it("finds the next missing tracked item", () => {
  const l = [{ n: "A", o: 1, t: 1 }, { n: "B", o: 0, t: 2 }, { n: "C", o: 0, t: 1 }];
  expect(nextTracked(l, 1)).toBe("C"); expect(nextTracked(l, 2)).toBe("B"); expect(nextTracked([{ n: "A", o: 1, t: 1 }], 0)).toBeNull();
});
