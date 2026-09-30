import { expect, it } from "vitest";
import { rank, stackIndex } from "./farm";
import type { Row } from "./drops";
const r = (item: string, where: string, ch: number | null): Row => ({ item, where, mode: "", rot: "", ch, rar: "", note: "", src: "" });
it("ranks by chance, estimates rolls, flags stacking", () => {
  const rows = [r("Plastids", "Ceres", 10), r("Plastids", "Eris", 25), r("Neural Sensors", "Ceres", 5), r("Plastids", "Void", null)];
  const idx = stackIndex(rows, new Set(["neural sensors", "plastids"]));
  const out = rank(rows.filter(x => x.item === "Plastids"), idx, "Plastids");
  expect(out.map(o => o.row.where)).toEqual(["Eris", "Ceres", "Void"]);
  expect(out[0].rolls).toBe(4);
  expect(out[2].rolls).toBeNull();
  expect(out[1].stacked).toEqual(["Neural Sensors"]);
  expect(out[1].tags).toContain("Currently useful");
  expect(out[2].tags).toEqual([]);
});
