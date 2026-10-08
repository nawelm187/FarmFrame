import { expect, it } from "vitest";
import { MASTERY_GROUPS, STARCHART } from "../data/masteryData";
import { ALL_GROUPS, groupProgress, groupTotal, itemKey, nextRankHelp, pointsFor, rankFor, totalPoints } from "./mastery";
it("rank thresholds follow the wiki formula", () => {
  expect(pointsFor(1)).toBe(2500); expect(pointsFor(29)).toBe(2_102_500); expect(pointsFor(30)).toBe(2_250_000); expect(pointsFor(31)).toBe(2_397_500);
  const r = rankFor(2_025_909); expect(r.rank).toBe(28); expect(r.toNext).toBe(76_591);
  expect(rankFor(0).rank).toBe(0); expect(rankFor(2500).rank).toBe(1); expect(rankFor(2499).rank).toBe(0); expect(rankFor(3_213_138).label).toBe("Legendary 6 (MR 36)");
});
it("the checklist adds up to the wiki's maximum of 3,213,138", () => {
  const nonFounder = ALL_GROUPS().filter(g => g.kind !== "founder"), t = totalPoints(new Set(), nonFounder); expect(t.max).toBe(3_213_138);
});
it("group totals match the wiki's printed totals", () => {
  const sum = (id: string) => groupTotal(MASTERY_GROUPS.find(g => g.id === id)!);
  expect(sum("warframe")).toBe(708_000); expect(sum("primary-weapon")).toBe(612_000); expect(sum("secondary-weapon")).toBe(455_000); expect(sum("melee-weapon")).toBe(684_000);
  expect(sum("k-drive")).toBe(30_000); expect(sum("necramech")).toBe(16_000); expect(MASTERY_GROUPS.find(g => g.id === "warframe")!.items).toHaveLength(118);
  expect(groupTotal(STARCHART.find(g => g.id === "earth")!)).toBe(2308);
});
it("counts only checked items and gives practical help", () => {
  const g = MASTERY_GROUPS.find(x => x.id === "k-drive")!, c = new Set([itemKey(g.id, g.items[0][0]), itemKey(g.id, g.items[1][0])]);
  expect(groupProgress(g, c)).toEqual({ n: 2, count: 5, have: 12000, total: 30000 }); expect(totalPoints(c).have).toBe(12000);
  expect(nextRankHelp(7000)).toEqual({ frames: 2, weapons: 3 });
});
