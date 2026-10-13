import { expect, it } from "vitest";
import { METHODS } from "../data/methods";
import { methodDocs, methodsFor } from "./methods";
import { buildIndex, searchIndex } from "./smartSearch";
it("finds the methods that give a material, easiest first", () => {
  expect(methodsFor("aya").map(m => m.level)).toEqual(["Beginner", "Beginner"]); expect(methodsFor("CREDITS")).toHaveLength(6); expect(methodsFor("credits").at(-1)?.status).toBe("community"); expect(methodsFor("Forma Blueprint")).toHaveLength(1); expect(methodsFor("steel essence")).toHaveLength(1); expect(methodsFor("orokin cell")).toHaveLength(4); expect(methodsFor("plastids").map(m => m.id)).toContain("plastids-uranus"); expect(methodsFor("argon crystal")).toHaveLength(1); for (const n of ["Void Traces", "Vosfor", "Gallium", "Nitain Extract", "Tellurium"]) expect(methodsFor(n)).toHaveLength(1); expect(methodsFor("")).toEqual([]); expect(methodsFor("platinum")).toEqual([]);
});
it("every method states its source, date and steps", () => {
  for (const m of METHODS) { expect(m.status === "wiki" ? m.source.url.startsWith("https://wiki.warframe.com/") : /^https:\/\/(forums\.warframe\.com|steamcommunity\.com)\//.test(m.source.url)).toBe(true); if (m.status === "community") expect(m.notes.join(" ")).toContain("NOT VERIFIED"); expect(m.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(m.steps.length > 0).toBe(true); expect(m.title.length > 0).toBe(true); }
  expect(new Set(METHODS.map(m => m.id)).size).toBe(METHODS.length);
});
it("search finds a method by what it gives or by a mod name, with no fixed phrase", () => {
  const ix = buildIndex(methodDocs());
  expect(searchIndex(ix, "double credits companion", 5)[0]?.doc.to).toBe("/methods?m=credits-profit-taker");
  expect(searchIndex(ix, "xoris index", 3)[0]?.doc.to).toBe("/methods?m=credits-index-xoris");
  expect(searchIndex(ix, "break containers xaku", 3)[0]?.doc.to.startsWith("/methods?m=")).toBe(true);
  expect(searchIndex(ix, "vosfor arcanes loid", 3)[0]?.doc.to).toBe("/methods?m=vosfor-sources");
  expect(searchIndex(ix, "aya farm", 3).every(h => h.doc.kind === "Method")).toBe(true);
  expect(searchIndex(ix, "kuva siphon", 3)[0]?.doc.to).toBe("/methods?m=kuva-flood");
});
