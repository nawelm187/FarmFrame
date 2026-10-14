import { describe, expect, it } from "vitest";
import { partNote } from "./partNote";
describe("partNote", () => {
  it("lists drops when present", () => expect(partNote([{ location: "Lua", type: "Rotation A" }], 0)).toBe("Lua (Rotation A)"));
  it("points to relics when only relics are known", () => expect(partNote([], 3)).toMatch(/relics/));
  it("only says nothing found when nothing is known", () => expect(partNote([], 0)).toMatch(/No drop source/));
});
