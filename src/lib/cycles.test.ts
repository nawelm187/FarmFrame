import { expect, it } from "vitest";
import { projectCycle } from "./cycles";
const at = (ms: number) => new Date(ms).toISOString();
it("keeps a valid cycle as served", () => {
  const now = Date.now(), p = projectCycle("vallisCycle", "warm", at(now + 60_000), now);
  expect(p).toEqual({ state: "warm", expiry: at(now + 60_000), calculated: false });
});
it("projects an expired Orb Vallis cycle forward (warm 6m40s, cold 20m)", () => {
  const now = 1_000_000_000_000, p = projectCycle("vallisCycle", "warm", at(now - 5 * 60_000), now);
  expect(p?.calculated).toBe(true); expect(p?.state).toBe("cold");
  expect(Date.parse(p!.expiry) - (now - 5 * 60_000)).toBe(20 * 60_000);
});
it("walks several phases and keeps the capitalisation of the source", () => {
  const now = 1_000_000_000_000, p = projectCycle("cetusCycle", "Day", at(now - 60 * 60_000), now);
  expect(p?.state).toBe("Day"); expect(Date.parse(p!.expiry)).toBeGreaterThan(now);
});
it("refuses to guess unknown states or very old data", () => {
  const now = 1_000_000_000_000;
  expect(projectCycle("vallisCycle", "mystery", at(now - 60_000), now)).toBeNull();
  expect(projectCycle("vallisCycle", "warm", at(now - 24 * 3_600_000), now)).toBeNull();
  expect(projectCycle("unknownCycle", "warm", at(now - 60_000), now)).toBeNull();
});
import { phaseProgress } from "./cycles";
it("phase progress runs from 0 to 1 and is unknown for unknown phases", () => {
  const now = Date.parse("2026-01-01T00:00:00Z"), end = new Date(now + 50 * 60_000).toISOString();
  expect(phaseProgress("cetusCycle", "Day", end, now)).toBe(0.5); expect(phaseProgress("cetusCycle", "Day", end, now + 60 * 60_000)).toBe(1);
  expect(phaseProgress("zarimanCycle", "Mystery", end, now)).toBeNull();
});
