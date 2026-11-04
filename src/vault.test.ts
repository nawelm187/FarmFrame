import { expect, it } from "vitest";
import { parseVault } from "./vault";
it("keys by relic and ignores missing flags", () => {
  const m = parseVault([{ name: "Axi A1 Intact", vaulted: true }, { name: "Axi A1 Radiant", vaulted: true }, { name: "Lith B2 Intact" }, { name: "Neo C3 Intact", vaulted: false }, 5])!;
  expect(m.get("Axi A1")).toBe(true); expect(m.get("Neo C3")).toBe(false); expect(m.has("Lith B2")).toBe(false);
  expect(parseVault("bad")).toBeNull();
});
import { parseRelicImages } from "./vault";
it("relic images: per relic and per tier, Intact preferred", () => {
  const a = parseRelicImages([{ name: "Axi A1 Radiant", imageName: "axi-r.png" }, { name: "Axi A1 Intact", imageName: "axi-i.png" }, { name: "Axi B2 Intact" }, { name: "Lith C3 Intact", imageName: "lith-i.png" }])!;
  expect(a.byRelic.get("Axi A1")).toBe("axi-i.png"); expect(a.byTier.get("Axi")).toBe("axi-i.png"); expect(a.byTier.get("Lith")).toBe("lith-i.png"); expect(a.byRelic.has("Axi B2")).toBe(false);
  expect(parseRelicImages({})).toBeNull();
});
