import { describe, expect, it } from "vitest";
import { frameClass, frameFor, frameVars, indexFrames, parseConfig, DEFAULT_CFG } from "./modFrames";
describe("indexFrames", () => {
  it("reads the quality from the file name, longest name first, ignoring case and extension", () => {
    const m = indexFrames({ "../a/Uncommon_Frame.PNG": "u", "../a/common.webp": "c", "../a/mod-rare.svg": "r", "../a/Legendary.png": "l", "../a/amalgam.png": "a" });
    expect(m).toEqual({ uncommon: "u", common: "c", rare: "r", legendary: "l", amalgam: "a" });
  });
  it("sends primed and default files to their own keys, and ignores unknown names", () => {
    const m = indexFrames({ "../a/legendary_primed.png": "p", "../a/default.png": "d", "../a/banner.png": "x", "../a/readme.png": "y" });
    expect(m).toEqual({ primed: "p", default: "d" });
  });
  it("keeps the first file when two claim the same quality", () => { expect(indexFrames({ "../a/rare.png": "1", "../a/rare2.png": "2" })).toEqual({ rare: "1" }); });
});
describe("frameFor", () => {
  const f = { rare: "R", primed: "P", default: "D" };
  it("prefers the Primed image for Primed mods, then the quality, then the default, else null", () => {
    expect(frameFor("rare", true, f)).toEqual({ key: "primed", url: "P" }); expect(frameFor("rare", false, f)).toEqual({ key: "rare", url: "R" });
    expect(frameFor("common", false, f)).toEqual({ key: "default", url: "D" }); expect(frameFor("common", false, { rare: "R" })).toBeNull(); expect(frameFor("common", true, {})).toBeNull();
  });
});
describe("parseConfig", () => {
  it("gives defaults for nothing, broken JSON or the wrong shape", () => {
    for (const raw of [undefined, "", "{broken", "[1,2]", "null", "5"]) expect(parseConfig(raw)).toEqual({ base: DEFAULT_CFG, tiers: {} });
  });
  it("reads the mode, clamps the numbers and applies per-quality overrides on top of the base", () => {
    const c = parseConfig('{"mode":"slice","slice":48,"width":14,"tiers":{"rare":{"slice":60},"primed":{"width":99},"bogus":{"slice":1}}}');
    expect(c.base).toEqual({ mode: "slice", slice: 48, width: 14 }); expect(c.tiers.rare).toEqual({ mode: "slice", slice: 60, width: 14 }); expect(c.tiers.primed.width).toBe(60); expect(c.tiers.bogus).toBeUndefined();
    expect(parseConfig('{"mode":"weird","slice":-5,"width":"x"}').base).toEqual({ mode: "overlay", slice: 1, width: 8 });
  });
});
describe("frameVars", () => {
  it("quotes the url and cannot be broken out of by quotes or backslashes in a file name", () => {
    const v = frameVars('/a/b"c\\d.png', { mode: "slice", slice: 48, width: 12 });
    expect(v["--frame"]).toBe('url("/a/b%22c%5Cd.png")'); expect(v["--fw"]).toBe("12px"); expect(v["--fs"]).toBe("48");
  });
});

it("a framed card gets the class the CSS looks for", () => { expect(frameClass("slice")).toBe("has-frame fm-slice"); expect(frameClass("overlay")).toBe("has-frame fm-overlay"); });
