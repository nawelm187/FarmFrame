import { expect, it } from "vitest";
import { clean, pieces } from "./text";
it("strips game markup but never invents the missing values", () => {
  const t = clean("<DT_SLASH>Slash Status Effects inflicted on enemies do |DAMAGE|% increased damage and last |DURATION|% longer.");
  expect(t).toBe("Slash Status Effects inflicted on enemies do |DAMAGE|% increased damage and last |DURATION|% longer.");
  expect(pieces(t).filter(p => p.unknown).map(p => p.t)).toEqual(["|DAMAGE|", "|DURATION|"]);
  expect(clean("+15% <DT_PUNCTURE_COLOR>Puncture")).toBe("+15% Puncture");
  expect(clean("One<br>Two")).toBe("One\nTwo");
  expect(clean("a < b and c > d")).toBe("a < b and c > d");
});
import { rich } from "./text";
it("turns damage tags into markers and keeps blanks visible as blanks", () => {
  const t = rich("Enemies take |DAMAGE|% more <DT_FREEZE_COLOR>Cold damage and <DT_FIRE>Heat.</DT_FIRE>");
  expect(t.filter(x => x.k === "dmg").map(x => x.v)).toEqual(["cold", "heat"]);
  expect(t.filter(x => x.k === "unk")).toHaveLength(1);
  expect(t.filter(x => x.k === "t").map(x => x.v).join("")).toContain("% more ");
});
it("turns a literal backslash-n from the source into a real line break", () => {
  expect(clean("When Damaged:\\n+10% Resistance")).toBe("When Damaged:\n+10% Resistance");
});
