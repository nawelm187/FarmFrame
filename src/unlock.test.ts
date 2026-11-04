import { expect, it } from "vitest";
import { STARCHART } from "../data/masteryData";
import { itemKey } from "./mastery";
import { nodeBlocks, parseNode, readiness } from "./unlock";
const earth = STARCHART.find(g => g.id === "earth")!, first = earth.items[0][0], second = earth.items[1][0];
it("reads a node name and its planet", () => { expect(parseNode("Hepit (Void)")).toEqual({ name: "Hepit", planet: "Void" }); expect(parseNode("Cambria")).toBeNull(); });
it("says nothing when the checklist is empty: it cannot tell", () => { expect(nodeBlocks(`${first} (Earth)`, false, false, new Set())).toEqual([]); });
it("asks to check a Star Chart node that is not ticked once the checklist is in use", () => {
  const m = new Set([itemKey("earth", second)]), b = nodeBlocks(`${first} (Earth)`, false, false, m);
  expect(b.length).toBe(1); expect(b[0].kind).toBe("node"); expect(b[0].severity).toBe("check"); expect(nodeBlocks(`${second} (Earth)`, false, false, m)).toEqual([]);
});
it("does not guess about nodes it does not know (Proxima, origin system, typos)", () => { const m = new Set([itemKey("earth", second)]); expect(nodeBlocks("Nowhere (Earth)", false, false, m)).toEqual([]); expect(nodeBlocks("Whatever (Pluto Fake)", false, false, m)).toEqual([]); });
it("Steel Path fissures need the Steel Path; Void Storms need Railjack", () => {
  expect(nodeBlocks(`${first} (Earth)`, true, false, new Set())[0].kind).toBe("steelpath");
  const m = new Set([itemKey("sp-earth", second)]); expect(nodeBlocks(`${first} (Earth)`, true, false, m)[0].text).toContain("Steel Path");
  expect(nodeBlocks(`${second} (Earth)`, true, false, m)).toEqual([]);
  expect(nodeBlocks("Lu-yan (Saturn Proxima)", false, true, new Set())[0].kind).toBe("railjack"); expect(nodeBlocks("Lu-yan (Saturn Proxima)", false, false, new Set())[0].kind).toBe("railjack");
});
it("ready, check first or needs setup", () => {
  expect(readiness(undefined)).toBe("ready"); expect(readiness([])).toBe("ready");
  expect(readiness([{ kind: "node", severity: "check", text: "x" }])).toBe("check");
  expect(readiness([{ kind: "node", severity: "check", text: "x" }, { kind: "relic", severity: "blocked", text: "y" }])).toBe("needs");
});
