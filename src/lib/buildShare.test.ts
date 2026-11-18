import { expect, it } from "vitest";
import { newBuild } from "./build";
import { decodeBuild, encodeBuild } from "./buildShare";
const sample = () => { const b = { ...newBuild(), name: "Rhino ✓ tank", kind: "warframe" as const, frame: "rhino", reactor: false }; b.slots[0] = { mod: "vitality", rank: 10, pol: "naramon", owned: true }; b.slots[3] = { mod: "steel fiber", rank: 5 }; return { ...b, special: { aura: { mod: "steel charge", rank: 3, pol: "madurai" } } }; };
it("a build survives a round trip, with unicode names, and never carries ownership", () => {
  const orig = { ...sample(), id: "original-id" }, o = decodeBuild(encodeBuild(orig))!; expect(o.name).toBe("Rhino ✓ tank"); expect(o.frame).toBe("rhino"); expect(o.reactor).toBe(false);
  expect(o.slots[0]).toEqual({ mod: "vitality", rank: 10, pol: "naramon" }); expect(o.slots[3]).toEqual({ mod: "steel fiber", rank: 5 }); expect(o.special?.aura).toEqual({ mod: "steel charge", rank: 3, pol: "madurai" });
  expect(o.id).not.toBe("original-id");
});
it("rejects text that is not a code, wrong sizes and impossible values", () => {
  expect(decodeBuild("hello")).toBeNull(); expect(decodeBuild("FF1.@@@")).toBeNull();
  const bad = encodeBuild({ ...sample(), slots: sample().slots.slice(0, 3) }); expect(decodeBuild(bad)).toBeNull();
  const worse = encodeBuild({ ...sample(), slots: sample().slots.map(s => ({ ...s, rank: 99 })) }); expect(decodeBuild(worse)).toBeNull();
});
