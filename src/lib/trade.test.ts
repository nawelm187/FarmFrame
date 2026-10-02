import { expect, it } from "vitest";
import { setTradable, tradeLine } from "./trade";
import type { Entity } from "./catalog";
const e = (o: Partial<Entity>, parts: [string, boolean | null][] = []): Entity => ({ slug: "x", name: "X Prime", type: "", description: "", image: null, isPrime: true, vaulted: null, stats: [], facts: [], components: parts.map(([name, tradable]) => ({ name, count: 1, drops: [], children: [], tradable })), polarity: null, baseDrain: null, maxRank: null, compat: "", rarity: "", slots: null, levelStats: null, category: "", raw: {}, tradable: null, ...o });
it("explains trading from the data without guessing", () => {
  expect(tradeLine(e({ tradable: false }, [["Chassis", true], ["Blueprint", true]]))?.tone).toBe("mixed");
  expect(tradeLine(e({ tradable: false }, [["Chassis", false]]))?.tone).toBe("no");
  expect(tradeLine(e({ tradable: true }))?.tone).toBe("yes");
  expect(tradeLine(e({}))).toBeNull();
});
it("sets are priced only when parts can be traded", () => {
  expect(setTradable(e({}, [["A", true], ["B", false]]))).toBe(true);
  expect(setTradable(e({}, [["A", false], ["B", false]]))).toBe(false);
  expect(setTradable(e({}, [["A", null]]))).toBe(true);
  expect(setTradable(e({ isPrime: false }, [["A", true]]))).toBe(false);
});
it("Prime parts count as tradable when they carry ducats and the data has no flag", () => {
  const p = e({ tradable: false }); p.components = [{ name: "Chassis", count: 1, drops: [], children: [], ducats: 45 }, { name: "Orokin Cell", count: 1, drops: [], children: [] }];
  expect(tradeLine(p)?.label).toContain("Prime parts can: Chassis"); expect(setTradable(p)).toBe(true);
  const n = e({ tradable: false, isPrime: false }); expect(tradeLine(n)?.tone).toBe("no");
});
