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
