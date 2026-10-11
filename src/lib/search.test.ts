import { expect, it } from "vitest";
import { search } from "./search";
it("intent and typo", () => {
  expect(search("where do i farm plastids?", null)[0].to).toBe("/farm/plastids");
  expect(search("where do i farm plastids?", null)[1].to).toBe("/finder?q=plastids");
  expect(search("fisures", null)[0].label).toBe("Fissures");
});
it("relic, need and build intents", () => {
  const ents = [{ name: "Rhino", cat: "warframe", slug: "rhino", label: "Warframe", kind: "warframe" }, { name: "Rhino Prime", cat: "warframe", slug: "rhino-prime", label: "Warframe", kind: "warframe" }, { name: "Rhino Mod", cat: "mod", slug: "rhino-mod", label: "Mod" }];
  expect(search("what relic contains Rhino Prime Neuroptics?", null)[0].to).toBe("/relics?q=rhino%20prime%20neuroptics");
  expect(search("which relics have ash prime systems", null)[0].to).toBe("/relics?q=ash%20prime%20systems");
  expect(search("what do i need for rhino prime", null, ents)[0].to).toBe("/warframe/rhino-prime");
  expect(search("what do i need for unknownthing", null, ents)[0].to).toBe("/relics?q=unknownthing");
  expect(search("how do i get forma blueprint", null)[0].to).toBe("/farm/forma%20blueprint");
  expect(search("build rhino", null, ents)[0].to).toBe("/builds?new=warframe:rhino&n=Rhino");
  expect(search("build rhino mod", null, ents)[0].to).toBe("/builds");
  expect(search("builds", null)[0].label).toBe("Builds");
});
import { search as s2 } from "./search";
it("pages include resources, enemies and parts", () => {
  expect(s2("enemies", null).some(h => h.to === "/enemies")).toBe(true); expect(s2("parts", null).some(h => h.to === "/parts")).toBe(true);
});
it("finds buying questions, syndicates and the new guides", () => {
  expect(search("where do i buy archon continuity", null)[0].to).toBe("/farm/archon%20continuity");
  expect(search("who sells seeking shuriken", null)[0].to).toBe("/farm/seeking%20shuriken");
  expect(search("new loka", null).some(h => h.to === "/syndicates?s=New%20Loka")).toBe(true);
  expect(search("kuva siphon", null).some(h => h.to === "/guides?s=kuva")).toBe(true);
  expect(search("arbitrations", null).some(h => h.to === "/guides?s=arbitrations")).toBe(true);
});
it("routes the remaining intents: farm now, who sells, prerequisites, latest update", () => {
  const ents = [{ name: "Rhino Prime", cat: "warframe", slug: "rhino-prime", label: "Warframe", kind: "warframe" }];
  expect(search("what can i farm right now?", null)[0].to).toBe("/farm");
  expect(search("what should i farm today", null)[0].to).toBe("/farm");
  expect(search("which syndicate sells seeking shuriken", null)[0].to).toBe("/farm/seeking%20shuriken");
  expect(search("what is the prerequisite for rhino prime", null, ents)[0].to).toBe("/warframe/rhino-prime");
  expect(search("how do i unlock mystery thing", null, ents)[0].to).toBe("/farm/mystery%20thing");
  expect(search("what changed in the latest update?", null)[0].to).toBe("/patches");
  expect(search("what's new", null)[0].to).toBe("/patches");
});
