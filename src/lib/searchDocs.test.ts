import { expect, it } from "vitest";
import { buildDocs, goalTarget, PAGE_WORDS } from "./searchDocs";
import { buildIndex, searchIndex } from "./smartSearch";
const pages: [string, string][] = [["/rotations", "Rotations"], ["/fissures", "Fissures"], ["/mastery", "Mastery Rank checklist"]];
const ents = [{ name: "Ash Prime", cat: "warframe", slug: "ash-prime", label: "Warframe", description: "Stealthy master of shuriken", parts: ["Blueprint", "Neuroptics"] }];
const relics = [{ name: "Axi A1", tier: "Axi", st: { Intact: [{ itemName: "Ash Prime Neuroptics Blueprint", rarity: "Rare", chance: 2 }, { itemName: "Forma Blueprint", rarity: "Common", chance: 25.33 }] } }];
const docs = buildDocs({ pages, ents, relics });
const ix = buildIndex(docs), top = (q: string) => searchIndex(ix, q, 3).map(m => m.doc.title);
it("builds documents from pages, items, parts, relics and the hand-written vendor data", () => {
  const kinds = new Set(docs.map(d => d.kind)); for (const k of ["Page", "Warframe", "Part", "Relic", "Item", "Vendor", "Helminth", "Guide", "Nightwave"]) expect(kinds.has(k)).toBe(true);
});
it("a part and a relic reward with the same name become one entry", () => { expect(docs.filter(d => d.title === "Ash Prime Blueprint").length).toBe(1); });
it("finds pages by what they hold, not only by their name", () => { expect(PAGE_WORDS["/rotations"].includes("baro")).toBe(true); expect(top("baro")[0]).toBe("Rotations"); expect(top("mastery points")[0]).toBe("Mastery Rank checklist"); });
it("finds who sells an item and what an ability belongs to", () => {
  expect(top("seeking shuriken")[0].startsWith("Seeking Shuriken")).toBe(true); expect(docs.find(d => d.title.startsWith("Seeking Shuriken"))!.kind).toBe("Vendor");
  expect(top("ember fire blast")[0]).toBe("Fire Blast (Ember)");
});
it("finds a relic from one of its rewards and a part from a few letters", () => { expect(top("axi a1")[0]).toBe("Axi A1"); expect(top("ash neuro")[0]).toBe("Ash Prime Neuroptics"); });
it("only Warframes and weapons can become goals", () => {
  expect(goalTarget("/warframe/ash-prime")).toEqual({ cat: "warframe", slug: "ash-prime" }); expect(goalTarget("/weapon/soma")).toEqual({ cat: "weapon", slug: "soma" });
  expect(goalTarget("/mod/serration")).toBeNull(); expect(goalTarget("/warframe/ash-prime/extra")).toBeNull(); expect(goalTarget("/item/Forma")).toBeNull();
});

import { goalId } from "./goals";
it("search results carry the same stable id as goals and part addresses", () => {
  const d = buildDocs({ pages: [["/fissures", "Fissures"]], ents: [{ name: "Rhino Prime", cat: "warframe", slug: "rhino-prime", label: "Warframe", parts: ["Neuroptics"] }], relics: null });
  expect(d.find(x => x.title === "Rhino Prime")?.id).toBe(goalId("warframe", "rhino-prime"));
  expect(d.find(x => x.title === "Rhino Prime Neuroptics")?.id).toBe("thing:rhino-prime-neuroptics");
  expect(d.find(x => x.kind === "Page")?.id).toBeUndefined();
});
