import { describe, expect, it } from "vitest";
import { FIND, collect, parseRelics, query } from "./drops";
import type { Rec } from "./data";
const rec = (data: unknown): Rec => ({ data, at: 1, err: null, url: "", window: 1, src: "" });
const f = (id: string) => FIND.find(x => x.id === id)!;
describe("drops", () => {
  it("enemy effective chance", () => {
    const d = { enemyBlueprintTables: [{ enemyName: "Manic", enemyItemDropChance: "33.00", items: [{ itemName: "Plastids", chance: 50, rarity: "Common" }] }] };
    const { rows } = collect([{ f: f("enemyBlueprintTables"), rec: rec(d), status: "FRESH" }]);
    expect(query(rows, "plastids")[0].ch).toBe(16.5);
  });
  it("bad shape becomes a gap", () => {
    const { gaps, ok } = collect([{ f: f("sortieRewards"), rec: rec("bad"), status: "FRESH" }]);
    expect(ok).toBe(0); expect(gaps[0]).toContain("unrecognised");
  });
  it("relics by refinement", () => {
    const r = parseRelics([{ tier: "Lith", relicName: "A1", state: "Radiant", rewards: [{ itemName: "X", chance: 10, rarity: "Rare" }] }]);
    expect(r?.[0].st.Radiant[0].chance).toBe(10);
  });
});
