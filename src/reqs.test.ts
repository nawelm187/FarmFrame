import { expect, it } from "vitest";
import { newBuild } from "./build";
import type { Entity } from "./catalog";
import { acquisition, fromBuild } from "./reqs";
const ent = (drops: unknown): Entity => ({ slug: "x", name: "X", raw: { drops } } as unknown as Entity);
it("lists acquisition from the item data only, best chance first, without inventing percentages", () => {
  expect(acquisition(ent([{ location: "Low", chance: 0.1, rarity: "Rare" }, { location: "High", chance: 0.5, rarity: "Common" }, { location: "Mid" }]))).toEqual(["High (Common)", "Low (Rare)", "Mid"]);
  expect(acquisition(ent(undefined))).toEqual([]); expect(acquisition(undefined)).toEqual([]);
});
it("turns build requirements into roadmap rows and keeps the owned amounts", () => {
  const b = { ...newBuild(), id: "b1", name: "Tank" }, rq = { missingMods: [{ slug: "steel", name: "Steel Fiber", rank: 5 }], missingArcanes: [{ slug: "grace", name: "Arcane Grace" }], forma: 2, omni: 0 };
  const first = fromBuild(b, rq, new Map([["steel", ent([{ location: "Corrupted Vault", rarity: "Common" }])]]), new Map(), []);
  expect(first.map(r => [r.kind, r.name, r.need])).toEqual([["mod", "Steel Fiber", 1], ["arcane", "Arcane Grace", 1], ["forma", "Forma Blueprint", 2]]);
  expect(first[0].src).toEqual(["Corrupted Vault (Common)"]);
  first[2].have = 1;
  const again = fromBuild(b, { ...rq, missingMods: [], forma: 2 }, new Map(), new Map(), [...first, { ...first[0], id: "other:mod:y", build: "other" }]);
  expect(again.find(r => r.kind === "forma")?.have).toBe(1); expect(again.some(r => r.kind === "mod" && r.build === "b1")).toBe(false); expect(again.some(r => r.build === "other")).toBe(true);
});
