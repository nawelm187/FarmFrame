import { expect, it } from "vitest";
import { aboutText, MANUAL, parseThings, pct, whereFrom } from "./resources";
it("reads resources and sorts drops by chance", () => {
  const t = parseThings([{ name: "Ferrite", type: "Resource", imageName: "f.png", drops: [{ location: "A", chance: 0.1 }, { location: "B", chance: 0.3 }] }, { name: "Alloy" }])!;
  expect(t[0].name).toBe("Alloy"); expect(t[1].drops[0].location).toBe("B"); expect(pct(0.125)).toBe(12.5); expect(pct(null)).toBeNull(); expect(parseThings({})).toBeNull();
});

it("pulls the source out of a description", () => {
  const d = "A dangerous and erratic type of Kuva.\n\nObtained from Zariman missions.";
  expect(whereFrom(d)).toEqual(["Obtained from Zariman missions."]); expect(aboutText(d)).toBe("A dangerous and erratic type of Kuva.");
  expect(whereFrom("Infested mineral deposits mimicking organs.  Location: Cambion Drift (Deimos) from Red Mining Veins")).toEqual(["Location: Cambion Drift (Deimos) from Red Mining Veins"]);
  expect(whereFrom("A violet gem.\nLocation: Orb Vallis (Venus)")).toEqual(["Location: Orb Vallis (Venus)"]);
  expect(whereFrom("Purged of spores. Blueprint sold by Otak in the Necralisk.")).toEqual(["Blueprint sold by Otak in the Necralisk."]);
  expect(whereFrom("")).toEqual([]);
});
it("has manual sources for the Necramech parts", () => { expect(MANUAL["Voidrig Capsule"]).toMatch(/Necraloid/); });
