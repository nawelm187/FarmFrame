import { expect, it } from "vitest";
import { advise } from "./advisor";
import type { Fis, PartPlan, RelicOpt } from "./exact";
const now = Date.parse("2026-10-06T12:00:00Z"), later = new Date(now + 3_600_000).toISOString();
const goal = { id: "warframe:wisp-prime", cat: "warframe" as const, slug: "wisp-prime", name: "Wisp Prime" };
const relic = (name: string, tier: string, stack = 1, vaulted: boolean | null = false): RelicOpt => ({ name, tier, rarity: "Rare", chance: { Intact: 2 }, vaulted, stack });
const plan = (part: string, relics: RelicOpt[], left = 1): PartPlan => ({ goal, entity: "Wisp Prime", part: { name: part, count: 1, drops: [], children: [] }, left, have: 0, relics, other: [], relicTiers: [] });
const fis = (tier: string): Fis => ({ tier, node: "Mot", missionType: "Survival", expiry: later, isHard: false, isStorm: false });
const info = { have: 1, total: 4, parts: 4 };
it("puts what you can do right now first, and explains why", () => {
  const plans = [plan("Chassis", [relic("Lith A1", "Lith")]), plan("Systems", [relic("Axi B2", "Axi", 2)]), plan("Neuroptics", [relic("Axi B2", "Axi", 2)])];
  const a = advise(goal.id, goal.name, plans, info, [fis("Axi")], { "Axi B2": 1 }, true, now);
  expect(a.status).toBe("active"); expect(a.pct).toBe(25);
  expect(a.focus?.group).toBe("now"); expect(a.focus?.relic).toBe("Axi B2"); expect(a.focus?.fissure).toBe("Survival Mot");
  expect(a.focus?.alsoAdvances).toHaveLength(1); expect(a.why.join(" ")).toContain("fissure is running now");
  expect(a.missing).toHaveLength(3); expect(a.after).toContain("Axi B2");
});
it("recommends getting the best relic when you own none", () => {
  const a = advise(goal.id, goal.name, [plan("Chassis", [relic("Lith A1", "Lith", 2)])], info, [], {}, true, now);
  expect(a.focus?.group).toBe("next"); expect(a.focus?.action.kind).toBe("get"); expect(a.why.join(" ")).toContain("not vaulted"); expect(a.after).toBeNull();
});
it("puts blocked parts last and never invents a source", () => {
  const a = advise(goal.id, goal.name, [plan("Chassis", [relic("Lith V1", "Lith", 1, true)]), plan("Systems", [relic("Neo C3", "Neo")])], info, [], {}, true, now);
  expect(a.focus?.part).toContain("Systems"); expect(a.missing[1].group).toBe("blocked");
});
it("reports done and no-data honestly", () => {
  expect(advise(goal.id, goal.name, [], { have: 4, total: 4, parts: 4 }, null, {}, true, now).status).toBe("done");
  expect(advise(goal.id, goal.name, [], { have: 0, total: 0, parts: 0 }, null, {}, true, now).status).toBe("nodata");
  expect(advise(goal.id, goal.name, [], undefined, null, {}, true, now).status).toBe("nodata");
});
import { rankActivities } from "./advisor";
import type { Opp } from "./farmNow";
it("ranks the activity that advances more goals first and says why", () => {
  const one: Opp = { key: "a", kind: "fissure", title: "Lith", advances: ["X", "Y", "Z"], why: [], goals: [{ name: "A", have: 0, total: 4 }] };
  const two: Opp = { key: "b", kind: "fissure", title: "Axi", advances: ["X"], why: [], goals: [{ name: "A", have: 0, total: 4 }, { name: "B", have: 1, total: 2 }], relics: [{ relic: "Axi B2", rarity: "Rare", parts: ["X"], vaulted: false, owned: 1 }] };
  const r = rankActivities([one, two]);
  expect(r[0].opp.key).toBe("b"); expect(r[0].goals).toHaveLength(2); expect(r[0].reasons.join(" ")).toContain("Advances 2 goals"); expect(r[0].reasons.join(" ")).toContain("already own Axi B2");
  expect(rankActivities([])).toEqual([]);
});
