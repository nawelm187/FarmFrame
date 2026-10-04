import { expect, it } from "vitest";
import { parseEnemies } from "./enemies";
it("reads layers and splits weaknesses from resistances", () => {
  const l = parseEnemies([{ name: "Moa", type: "Corpus", health: 100, shield: 50, armor: 0, imageName: "moa.png", resistances: [{ type: "Shield", amount: 50, affectors: [{ element: "Magnetic", modifier: 0.75 }, { element: "Puncture", modifier: -0.5 }, { element: "Heat", modifier: 0 }] }] }])!;
  expect(l[0].layers[0].takesMore).toEqual([{ el: "Magnetic", pct: 75 }]); expect(l[0].layers[0].takesLess).toEqual([{ el: "Puncture", pct: -50 }]);
  expect(parseEnemies({})).toBeNull();
});
