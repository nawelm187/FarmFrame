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
