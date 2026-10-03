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
import { anomalyView, arbView, dealsView, kuvaView, simarisView } from "./rotations";
it("daily deal, arbitration, kuva, simaris and anomaly views", () => {
  expect(dealsView([{ item: "Forma", salePrice: 35, originalPrice: 50, total: 20, sold: 5, expiry: "x" }, { price: 3 }])).toEqual([{ item: "Forma", price: 35, original: 50, left: 15, expiry: "x" }]);
  expect(arbView({ node: "Hydron (Sedna)", type: "Defense", enemy: "Grineer" })?.node).toBe("Hydron (Sedna)"); expect(arbView({})).toBeNull();
  expect(kuvaView([{ node: "Taveuni (Kuva Fortress)", type: "Survival" }, {}])).toHaveLength(1);
  expect(simarisView({ target: "Mutalist Alad V", isTargetActive: true })).toEqual({ target: "Mutalist Alad V", active: true });
  expect(anomalyView([{ active: true, mission: { node: "Hydron", faction: "Sentient", type: "Defense" } }])?.faction).toBe("Sentient");
});
import { arbView as arb2 } from "./rotations";
it("arbitration placeholder from the source is no data", () => {
  const now = Date.parse("2026-10-03T00:00:00Z");
  expect(arb2({ node: "SolNode000", type: "Unknown", enemy: "Tenno", expired: true, expiry: "+275760-09-13T00:00:00.000Z" }, now)).toBeNull();
  expect(arb2({ node: "Hydron (Sedna)", type: "Defense", expiry: "2026-10-03T01:00:00Z" }, now)?.node).toBe("Hydron (Sedna)");
  expect(arb2({ node: "Hydron (Sedna)", expiry: "2026-10-02T01:00:00Z" }, now)).toBeNull();
});
