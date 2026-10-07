import { expect, it } from "vitest";
import { itemAdvice, sourceWhy } from "./itemAdvice";
import type { Row } from "./drops";
const row = (item: string, where: string, ch: number | null): Row => ({ item, where, mode: "", rot: "", ch, rar: "", note: "", src: "t" });
const rows = [row("Plastids", "Ceres", 10), row("Plastids", "Pluto", 25), row("Plastids Pack", "Eris", 90), row("Morphics", "Ceres", 5)];
it("prefers exact item names and orders by drop chance", () => {
  const a = itemAdvice(rows, "plastids", new Set());
  expect(a.exact).toBe(true); expect(a.sources[0].row.where).toBe("Pluto"); expect(a.sources[0].rolls).toBe(4);
});
it("says when a place also drops something else you need", () => {
  const a = itemAdvice(rows, "Plastids", new Set(["morphics"]));
  const ceres = a.sources.find(s => s.row.where === "Ceres");
  expect(ceres?.stacked).toEqual(["Morphics"]); expect(sourceWhy(ceres!)).toContain("also drops Morphics");
});
it("returns nothing for unknown or empty names", () => {
  expect(itemAdvice(rows, "", new Set()).sources).toEqual([]); expect(itemAdvice(rows, "Nope", new Set()).sources).toEqual([]);
});
