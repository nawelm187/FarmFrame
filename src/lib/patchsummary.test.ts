import { describe, expect, it } from "vitest";
import type { Patch } from "./patchlogs";
import { readChange, readLoose, summarize, tally, touches } from "./patchsummary";
const P = (o: Partial<Patch>): Patch => ({ name: "x", url: null, date: 0, type: "Update", img: null, additions: "", changes: "", fixes: "", ...o });
describe("readChange", () => {
  it("reads from-to values and tells a buff from a nerf", () => {
    const a = readChange("- Nidus: Increased Virulence damage from 50 to 75.")!;
    expect(a.subject).toBe("Nidus"); expect(a.stat).toBe("Damage"); expect(a.from).toBe(50); expect(a.to).toBe(75); expect(a.good).toBe("buff");
    const b = readChange("* Reduced Rhino's Armor from 225 to 190")!; expect(b.good).toBe("nerf"); expect(b.stat).toBe("Armor");
  });
  it("treats lower cost, cooldown and reload as better", () => {
    expect(readChange("Reduced Roar energy cost from 50 to 25")!.good).toBe("buff");
    expect(readChange("Increased reload time of the Soma from 2.5 to 3")!.good).toBe("nerf");
    expect(readChange("Increased the Soma's reload speed by 20%")).not.toBeNull();
  });
  it("uses the percentage when there are no from-to numbers", () => {
    const c = readChange("Increased Shield capacity by 25%")!; expect(c.stat).toBe("Shields"); expect(c.from).toBeNull(); expect(c.good).toBe("buff");
  });
  it("ignores fixes and lines without a stat or a direction", () => {
    expect(readChange("Fixed a crash when damage was applied twice")).toBeNull();
    expect(readChange("Added a new cosmetic for Nidus")).toBeNull();
    expect(readChange("Nidus now has a new damage animation")).toBeNull();
  });
});
describe("summarize", () => {
  const p = P({ additions: "Introducing Narin\n- A new warframe with four abilities\n- New cosmetics", changes: "### Banshee\n- Sonic Boom: Reduced damage from 400 to 300\n- Silence: Increased duration by 20%\n### Misc\n- Changed the hair shader", fixes: "- Fixed a crash\n- Fixed a typo\n" });
  it("keeps stat changes, a few additions and counts fixes", () => {
    const s = summarize(p);
    expect(s.changes.length).toBe(3); expect(s.changes[0].subject).toBe("Sonic Boom"); expect(s.changes[1].stat).toBe("Duration");
    expect(tally(s.changes)).toEqual({ buff: 1, nerf: 1, change: 1 }); expect(s.fixes).toBe(2); expect(s.additions.length).toBeGreaterThan(0);
  });
  it("marks changes that touch what the player owns", () => {
    const s = summarize(p); expect(touches(s.changes[0], new Set(["sonic boom"]))).toBe("sonic boom"); expect(touches(s.changes[0], new Set(["rhino"]))).toBeNull();
  });
  it("handles empty notes", () => { expect(summarize(P({}))).toEqual({ changes: [], additions: [], fixes: 0 }); });
});
it("reads loose changes and keeps direction", () => {
  expect(readLoose("Narin's Neote now also slows enemies hit.", "Narin")?.good).toBe("change");
  expect(readLoose("Reduced the duration of Frostbite to 8s.", "Narin")?.good).toBe("nerf");
  expect(readLoose("Fixed a crash.", "")).toBeNull();
});
