import { expect, it } from "vitest";
import { archView, calendarView, duviriView, label, nextWeeklyReset, steelView, stockView } from "./rotations";
it("steel path offers and unknown shapes", () => {
  const v = steelView({ currentReward: { name: "Umbra Forma Blueprint", cost: 150 }, rotation: [{ name: "Kuva", cost: 55 }, { name: "" }], evergreens: [{ name: "Veiled Riven Cipher", cost: 20 }] })!;
  expect(v.current).toEqual({ name: "Umbra Forma Blueprint", cost: 150 }); expect(v.rotation).toHaveLength(1); expect(v.evergreens[0].cost).toBe(20);
  expect(steelView("x")).toBeNull();
});
it("duviri choices accept strings or objects", () => {
  const v = duviriView({ state: "joy", expiry: "x", choices: [{ category: "normal", choices: ["Loki", { name: "Mag" }] }, { category: "empty", choices: [] }] })!;
  expect(v.choices).toEqual([{ category: "normal", items: ["Loki", "Mag"] }]);
});
it("calendar keeps only days with readable events", () => {
  const v = calendarView([{ season: "Spring", yearIteration: 2, days: [{ day: "3", events: [{ type: "challenge", challenge: { title: "Do a thing" } }] }, { day: "4", events: [] }] }])!;
  expect(v.season).toBe("Spring"); expect(v.days).toEqual([{ day: "3", events: ["Do a thing"] }]);
});
it("archimedea, stock and label", () => {
  expect(archView([{ typeKey: "Deep", missions: [{ missionType: "Survival", faction: "Grineer" }] }])[0].missions).toEqual(["Survival · Grineer"]);
  expect(stockView({ active: true, inventory: [{ item: "Prism" }, 5] })?.items).toEqual(["Prism"]); expect(label({ a: 1 })).toBeNull();
});
it("weekly reset is the next Monday 00:00 UTC", () => {
  expect(new Date(nextWeeklyReset(Date.parse("2026-10-07T12:00:00Z"))).toISOString()).toBe("2026-10-12T00:00:00.000Z");
  expect(new Date(nextWeeklyReset(Date.parse("2026-10-12T00:00:01Z"))).toISOString()).toBe("2026-10-19T00:00:00.000Z");
});
