import { describe, expect, it } from "vitest";
import { latestUpdate, matchPatch, parsePatches, patchTypes, safeUrl } from "./patchlogs";
const raw = [
  { name: "Hotfix 44.0.1", url: "https://forums.warframe.com/topic/1/", date: "2026-09-24T19:59:15Z", type: "Hotfix", additions: "", changes: "Doubled the weighting<br>of a blueprint", fixes: "Fixed a crash", imgUrl: "" },
  { name: "Update 44", url: "https://forums.warframe.com/topic/2/", date: "2026-09-23T15:03:31Z", type: "Update", additions: "New cosmetics", changes: "", fixes: "", imgUrl: "https://www-static.warframe.com/uploads/a.png" },
  { name: "Update 43", url: "javascript:alert(1)", date: "2026-06-01T00:00:00Z", type: "Update" },
  { name: "", date: "2026-01-01T00:00:00Z" }, { name: "No date" }, 7,
];
describe("patchlogs", () => {
  it("parses, sorts newest first and counts skipped entries", () => {
    const r = parsePatches(raw)!;
    expect(r.patches.map(p => p.name)).toEqual(["Hotfix 44.0.1", "Update 44", "Update 43"]);
    expect(r.skipped).toBe(3);
    expect(r.patches[0].changes).toBe("Doubled the weighting\nof a blueprint");
  });
  it("keeps only https links and tolerates missing fields", () => {
    const r = parsePatches(raw)!;
    expect(r.patches[2].url).toBeNull(); expect(r.patches[2].fixes).toBe(""); expect(r.patches[0].img).toBeNull(); expect(r.patches[1].img).toContain("https://");
    expect(safeUrl("http://x.test")).toBeNull(); expect(safeUrl(5)).toBeNull();
  });
  it("returns null for schema drift instead of an empty list", () => {
    expect(parsePatches({ patches: [] })).toBeNull(); expect(parsePatches([])).toBeNull(); expect(parsePatches("x")).toBeNull();
  });
  it("finds the latest full update and filters by text and type", () => {
    const r = parsePatches(raw)!;
    expect(latestUpdate(r.patches)!.name).toBe("Update 44");
    expect(patchTypes(r.patches)).toEqual(["Hotfix", "Update"]);
    expect(r.patches.filter(p => matchPatch(p, "BLUEPRINT")).map(p => p.name)).toEqual(["Hotfix 44.0.1"]);
    expect(r.patches.filter(p => matchPatch(p, "")).length).toBe(3);
  });
});
