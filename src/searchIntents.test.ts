import { describe, expect, it } from "vitest";
import { buildIndex, detectIntent, searchIndex } from "./smartSearch";
import { understand } from "./understand";
import { PAGE_WORDS } from "./searchDocs";
describe("lore questions", () => {
  it("reads the subject out of Spanish and English lore questions", () => {
    expect(detectIntent("cual es el lore de styanax")).toEqual({ kind: "lore", subject: "styanax" });
    expect(detectIntent("historia de excalibur")).toEqual({ kind: "lore", subject: "excalibur" });
    expect(detectIntent("lore of the grineer")).toEqual({ kind: "lore", subject: "grineer" });
    expect(detectIntent("what is the backstory of nidus")).toEqual({ kind: "lore", subject: "nidus" });
  });
  it("a lone word, or lore with no subject, is not a lore question", () => {
    expect(detectIntent("lore")).toBeNull();
    expect(detectIntent("cual es el lore")).toBeNull();
  });
  it("farming questions are untouched by the new words", () => {
    expect(detectIntent("donde consigo a styanax prime")).toEqual({ kind: "where", subject: "styanax prime" });
    expect(detectIntent("where do i farm forma")?.kind).toBe("where");
  });
});
describe("I need <material>", () => {
  it("turns a need plus a known material into 'how do I get it'", () => {
    for (const q of ["necesito creditos", "i need credits", "quiero platino", "busco creditos", "necesito plat"]) {
      const u = understand(q); expect(u.intent?.kind, q).toBe("where"); expect(u.material, q).not.toBeNull();
    }
    expect(understand("necesito creditos").material).toBe("Credits");
    expect(understand("quiero platino").material).toBe("Platinum");
  });
  it("a need with no known material is not forced into an answer card", () => {
    expect(understand("necesito ayuda").intent).toBeNull();
  });
  it("need words are ignored when searching, so 'necesito styanax prime' still finds Styanax Prime", () => {
    const ix = buildIndex([{ title: "Styanax Prime", kind: "Warframe", to: "/warframe/styanax-prime" }, { title: "Atlas Prime", kind: "Warframe", to: "/warframe/atlas-prime" }]);
    expect(searchIndex(ix, "necesito styanax prime")[0]?.doc.title).toBe("Styanax Prime");
    expect(searchIndex(ix, "quiero atlas")[0]?.doc.title).toBe("Atlas Prime");
  });
});
describe("everyday Spanish questions", () => {
  const sub = (q: string) => { const i = understand(q).intent; return i && "subject" in i ? i.subject : null; };
  it("buying, price and 'sacar' phrases give a clean subject", () => {
    expect(sub("donde compro platino")).toBe("platinum");
    expect(sub("como saco aya")).toBe("aya");
    expect(sub("cuanto cuesta un forma")).toBe("forma");
    expect(sub("ayudame a farmear orokin cells")).toBe("orokin cell");
    expect(sub("donde cae el blueprint de atlas prime")).toBe("blueprint de atlas prime");
  });
  it("'best place to farm X' is a method question, 'dame X rapido' is a how-to-get question", () => {
    expect(understand("mejor lugar para farmear credits").intent).toEqual({ kind: "method", subject: "credits" });
    expect(understand("best spot to farm endo").intent?.kind).toBe("method");
    expect(understand("dame creditos rapido").intent?.kind).toBe("where");
  });
});
describe("questions with no farming word still find the page", () => {
  const pages: [string, string][] = [["/helminth", "Helminth"], ["/rotations", "Rotations"], ["/fissures", "Fissures"]];
  const ix = buildIndex(pages.map(([to, title]) => ({ title, kind: "Page", to, alias: PAGE_WORDS[to] ?? "" })));
  it("Spanish question words are ignored", () => {
    for (const [q, to] of [["que hace la helminth", "/helminth"], ["quien es baro", "/rotations"], ["cuando llega baro", "/rotations"], ["como funciona el circuit", "/rotations"], ["cuando llega varzia", "/rotations"]] as const)
      expect(searchIndex(ix, q)[0]?.doc.to, q).toBe(to);
  });
});
