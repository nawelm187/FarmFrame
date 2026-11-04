// Queries in the 9 interface languages. Expectations are written by hand from what each phrase means; the Chinese and Japanese ones
// are the least certain wording-wise, so they only cover common, unambiguous words.
import { describe, expect, it } from "vitest";
import { PAGE_WORDS } from "./searchDocs";
import { buildIndex, normalize, searchIndex } from "./smartSearch";
import { toCanonical } from "./multilang";
import { understand } from "./understand";
describe("toCanonical: other languages become the English words the engine knows", () => {
  const cases: [string, string][] = [
    ["où farmer des crédits", "where farm credits"], ["wo bekomme ich platin", "where get platinum"], ["dove ottenere crediti", "where get credits"],
    ["onde conseguir créditos", "where conseguir créditos"], ["где фармить кредиты", "where farm credits"], ["信用点在哪里刷", "credits where farm"],
    ["クレジットはどこで周回できますか", "credits where farm"], ["什么是遗物", "what is relics"], ["ヘルミンスとは", "what is helminth"], ["Реликвии", "relics"],
    ["Relikte", "relics"], ["notas del parche", "patch notes"], ["Wisp Prime", "Wisp Prime"], ["where do i farm forma", "where do i farm forma"],
  ];
  for (const [q, want] of cases) it(`${q} -> ${want}`, () => expect(toCanonical(q)).toBe(want));
  it("a query made only of filler words is left as typed", () => { expect(toCanonical("le")).toBe("le"); expect(toCanonical("的")).toBe("的"); });
  it("a Warframe name written next to Chinese or Japanese text survives", () => { expect(toCanonical("Atlas Prime在哪里")).toBe("atlas prime where"); });
});
describe("understand: the same meaning in every language gives the same reading", () => {
  const where: [string, string][] = [["où farmer des crédits", "Credits"], ["wo bekomme ich platin", "Platinum"], ["dove ottenere crediti", "Credits"], ["где фармить кредиты", "Credits"], ["信用点在哪里刷", "Credits"], ["クレジットはどこで周回できますか", "Credits"], ["onde conseguir créditos", "Credits"]];
  for (const [q, mat] of where) it(`${q} asks where to get ${mat}`, () => { const u = understand(q); expect(u.intent?.kind, q).toBe("where"); expect(u.material, q).toBe(mat); });
  it("'I need X' in other languages", () => {
    for (const q of ["我需要信用点", "мне нужны кредиты", "j'ai besoin de crédits", "ich brauche credits", "mi servono crediti", "preciso de créditos"]) { const u = understand(q); expect(u.intent?.kind, q).toBe("where"); expect(u.material, q).toBe("Credits"); }
  });
  it("'what is X' and 'lore of X' in other languages", () => {
    for (const q of ["что такое хелминт", "was ist die helminth", "ヘルミンスとは"]) expect(understand(q).intent, q).toEqual({ kind: "what", subject: "helminth" });
    expect(understand("histoire de styanax").intent).toEqual({ kind: "lore", subject: "styanax" });
    expect(understand("styanax 背景故事").intent).toEqual({ kind: "lore", subject: "styanax" });
  });
  it("best place to farm, in French and German", () => {
    expect(understand("meilleur endroit pour farmer des crédits").intent?.kind).toBe("method");
    expect(understand("beste ort credits farmen").intent?.kind).toBe("method");
  });
});
describe("page names typed in any interface language find the page", () => {
  const pages: [string, string][] = [["/relics", "Relics"], ["/fissures", "Fissures"], ["/helminth", "Helminth"], ["/rotations", "Rotations"], ["/methods", "Farming Methods"], ["/patches", "Patch notes"]];
  const ix = buildIndex(pages.map(([to, title]) => ({ title, kind: "Page", to, alias: PAGE_WORDS[to] ?? "" })));
  const top = (q: string) => { const u = understand(q); return searchIndex(ix, u.text)[0]?.doc.to; };
  const want: [string, string][] = [["Reliquias", "/relics"], ["Reliques", "/relics"], ["Relikte", "/relics"], ["Reliquie", "/relics"], ["Relíquias", "/relics"], ["Реликвии", "/relics"], ["遗物", "/relics"], ["レリック", "/relics"],
    ["Fisuras", "/fissures"], ["Failles", "/fissures"], ["Risse", "/fissures"], ["Fenditure", "/fissures"], ["Разломы", "/fissures"], ["虚空裂缝", "/fissures"], ["フィッシャー", "/fissures"],
    ["Métodos de farmeo", "/methods"], ["Notas del parche", "/patches"], ["Rotazioni", "/rotations"], ["Ротации", "/rotations"], ["轮换", "/rotations"], ["ローテーション", "/rotations"]];
  for (const [q, to] of want) it(`${q} -> ${to}`, () => expect(top(q), q).toBe(to));
});
describe("Latin-script behaviour is unchanged", () => {
  it("normalize still strips accents and punctuation, and now keeps other scripts", () => {
    expect(normalize("Dónde, Farmeo-Kuva!")).toBe("donde farmeo kuva"); expect(normalize("Maße")).toBe("masse"); expect(normalize("Реликвии 遗物")).toBe("реликвии 遗物"); expect(normalize("Nikana Prime")).toBe("nikana prime");
  });
});
