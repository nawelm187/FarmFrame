import { expect, it } from "vitest";
import { CONFIDENCE, SOURCES, sourceById, sourceFor } from "./sources";
it("every source has a unique id, a known trust level and a note", () => {
  const ids = SOURCES.map(s => s.id); expect(new Set(ids).size).toBe(ids.length);
  for (const s of SOURCES) { expect(Object.keys(CONFIDENCE)).toContain(s.confidence); expect(s.note.length > 20).toBe(true); expect(s.provides.length > 5).toBe(true); }
});
it("planned sources are never the only trusted source of anything, and unverified ones are marked F", () => {
  for (const s of SOURCES.filter(x => ["wfdrops", "tenno-tools", "rivens-wf"].includes(x.id))) { expect(s.use).toBe("planned"); expect(s.confidence).toBe("F"); }
});
it("hand-checked dates are real dates and not in the future", () => {
  for (const s of SOURCES) if (s.checked) { expect(/^\d{4}-\d{2}-\d{2}$/.test(s.checked)).toBe(true); expect(Date.parse(s.checked) <= Date.now() + 86_400_000).toBe(true); }
});
it("finds sources by id and by host, and only active ones by host", () => {
  expect(sourceById("wfcd-drops")?.hosts).toContain("drops.warframestat.us");
  expect(sourceFor("https://drops.warframestat.us/data/all.json")?.id).toBe("wfcd-drops");
  expect(sourceFor("https://origin.warframe.com/PublicExport/index_en.txt.lzma")).toBeNull();
});

it("the official weekly Riven dump is planned and never claims to carry disposition", () => {
  const s = sourceById("official-rivens-weekly")!;
  expect(s.use).toBe("planned"); expect(s.note).toContain("no disposition");
});

it("community strategy sources are never trusted above E, and unreadable ones are planned", () => {
  for (const id of ["steam-discussions", "warframe-forums", "reddit-warframe"]) expect(sourceById(id)!.confidence).toBe("E");
  for (const id of ["warframe-forums", "reddit-warframe", "guide-sites"]) expect(sourceById(id)!.use).toBe("planned");
  expect(sourceById("guide-sites")!.note).toContain("Neither cites");
});
