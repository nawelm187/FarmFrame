import { expect, it } from "vitest";
import { alertsView, usefulRewards } from "./alerts";
const exp = new Date(Date.now() + 3_600_000).toISOString();
const raw = [{ id: "1", expiry: exp, mission: { node: "Ceres", type: "Survival", reward: { credits: 5000, items: ["Orokin Catalyst Blueprint"] } } }];
it("flags only rewards that match what the user still needs", () => {
  const [a] = alertsView(raw);
  expect(usefulRewards(a, new Set(["orokin catalyst blueprint"]))).toEqual(["Orokin Catalyst Blueprint"]);
  expect(usefulRewards(a, new Set(["plastids"]))).toEqual([]);
  expect(usefulRewards(a, new Set())).toEqual([]);
});
import { syndicateAlerts } from "./alerts";
it("keeps only syndicate alerts that have nodes and have not ended", () => {
  const ok = { id: "a", syndicate: "Red Veil", nodes: ["Ara (Mars)", "Saxis (Eris)"], expiry: exp };
  const r = syndicateAlerts([ok, { id: "b", syndicate: "Ostron", nodes: [], expiry: exp }, { id: "c", syndicate: "Suda", nodes: ["X"], expiry: new Date(Date.now() - 1000).toISOString() }, "x"]);
  expect(r).toHaveLength(1); expect(r[0].nodes).toHaveLength(2); expect(syndicateAlerts(null)).toEqual([]);
});
