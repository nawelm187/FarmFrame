import { describe, expect, it } from "vitest";
import { BEGAN, ERAS, FACTIONS, PLACES } from "./lore";
describe("lore data", () => {
  it("has unique names and ids", () => { expect(new Set(PLACES.map(p => p.name)).size).toBe(PLACES.length); expect(new Set(ERAS.map(e => e.id)).size).toBe(ERAS.length); expect(new Set(FACTIONS.map(f => f.name)).size).toBe(FACTIONS.length); });
  it("every faction place exists in the places list", () => { const n = new Set(PLACES.map(p => p.name)); for (const f of FACTIONS) for (const p of f.places) expect(n.has(p), `${f.name} -> ${p}`).toBe(true); });
  it("every place has a known faction group", () => { for (const p of PLACES) expect(["Grineer", "Corpus", "Infested", "Orokin", "Other"]).toContain(p.faction); });
  it("has no empty text", () => { for (const x of [...ERAS.map(e => e.text), ...BEGAN.map(m => m.text), ...PLACES.map(p => p.text), ...FACTIONS.map(f => f.text)]) expect(x.length).toBeGreaterThan(20); });
});
