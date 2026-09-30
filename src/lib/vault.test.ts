import { expect, it } from "vitest";
import { parseVault } from "./vault";
it("keys by relic and ignores missing flags", () => {
  const m = parseVault([{ name: "Axi A1 Intact", vaulted: true }, { name: "Axi A1 Radiant", vaulted: true }, { name: "Lith B2 Intact" }, { name: "Neo C3 Intact", vaulted: false }, 5])!;
  expect(m.get("Axi A1")).toBe(true); expect(m.get("Neo C3")).toBe(false); expect(m.has("Lith B2")).toBe(false);
  expect(parseVault("bad")).toBeNull();
});
