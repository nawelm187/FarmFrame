import { describe, expect, it } from "vitest";
import { detectIntent } from "./smartSearch";
describe("the mods intent", () => {
  it("understands the usual ways to ask for mods for a Warframe, in English and Spanish", () => {
    for (const [q, subject] of [["mods for rhino", "rhino"], ["best mods for rhino prime", "rhino prime"], ["what mods should i use on ash", "ash"], ["que mods uso en rhino", "rhino"], ["mods de atlas", "atlas"], ["Mods para Saryn?", "saryn"]] as const)
      expect(detectIntent(q)).toEqual({ kind: "mods", subject });
  });
  it("does not steal questions about getting mods or other intents", () => {
    expect(detectIntent("where do i farm mods for rhino")?.kind).not.toBe("mods"); expect(detectIntent("how do i get serration mods")?.kind).not.toBe("mods");
    expect(detectIntent("what changed")).toEqual({ kind: "changed" }); expect(detectIntent("mods")).toBeNull(); expect(detectIntent("mods for")).toBeNull();
  });
});
