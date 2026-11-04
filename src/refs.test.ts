import { expect, it } from "vitest";
import { nameKey, ref, refOf, sameName, thingRoute } from "./refs";
import { goalId } from "./goals";
it("one name, one key, whatever the case, accents or apostrophes", () => {
  expect(nameKey("Rhino Prime  Neuroptics")).toBe("rhino-prime-neuroptics"); expect(sameName("Vauban's Chassis", "vaubans chassis")).toBe(true); expect(sameName("Forma", "Forma Blueprint")).toBe(false);
});
it("every address of the same part maps to the same id", () => {
  const id = ref("thing", "Forma Blueprint");
  expect(refOf(thingRoute("Forma Blueprint"))).toBe(id); expect(refOf("/farm/Forma%20Blueprint")).toBe(id); expect(refOf("/resources?q=Forma%20Blueprint")).toBe(id);
});
it("entity ids equal the goal id and unrelated addresses have none", () => {
  expect(refOf("/warframe/rhino-prime")).toBe(goalId("warframe", "rhino-prime")); expect(refOf("/relics?q=Lith%20A1")).toBe("relic:lith-a1");
  expect(refOf("/fissures")).toBeNull(); expect(refOf("/mod")).toBeNull();
});
