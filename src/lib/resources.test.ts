import { expect, it } from "vitest";
import { parseThings, pct } from "./resources";
it("reads resources and sorts drops by chance", () => {
  const t = parseThings([{ name: "Ferrite", type: "Resource", imageName: "f.png", drops: [{ location: "A", chance: 0.1 }, { location: "B", chance: 0.3 }] }, { name: "Alloy" }])!;
  expect(t[0].name).toBe("Alloy"); expect(t[1].drops[0].location).toBe("B"); expect(pct(0.125)).toBe(12.5); expect(pct(null)).toBeNull(); expect(parseThings({})).toBeNull();
});
