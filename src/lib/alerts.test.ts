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
