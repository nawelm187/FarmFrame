import { expect, it } from "vitest";
import { partKey, placeKey, planetOf } from "./partImg";
it("maps part names to image keys, with companion aliases", () => {
  expect(partKey("Neuroptics", false)).toBe("neuroptics"); expect(partKey("Chassis", true)).toBe("chassis-prime");
  expect(partKey("Cerebrum", true)).toBe("neuroptics-prime"); expect(partKey("Carapace", false)).toBe("chassis"); expect(partKey("Systems", true)).toBe("systems-prime");
});
it("makes place keys that match the file names", () => {
  expect(placeKey("Höllvania")).toBe("hollvania"); expect(placeKey("Kuva Fortress")).toBe("kuva-fortress"); expect(placeKey("Earth")).toBe("earth");
});
it("finds the planet of a node in either notation", () => {
  const k = new Set(["ceres", "earth", "void"]);
  expect(planetOf("Gabii (Ceres)", k)).toBe("Ceres"); expect(planetOf("Ceres, Gabii", k)).toBe("Ceres"); expect(planetOf("Mot (Void)", k)).toBe("Void"); expect(planetOf("Nowhere", k)).toBeNull();
});
