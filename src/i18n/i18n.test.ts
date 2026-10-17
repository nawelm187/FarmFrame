import { describe, expect, it } from "vitest";
import { en, type Key } from "./en";
import { LANGS, fill, pickLang, tp } from "./index";
const keys = Object.keys(en) as Key[], vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(",");
describe("dictionaries", () => {
  it("every language but English is a separate loadable file", () => {
    expect(LANGS[0].code).toBe("en"); expect(LANGS[0].load).toBeUndefined();
    for (const l of LANGS.slice(1)) expect(typeof l.load, l.code).toBe("function");
    expect(new Set(LANGS.map(l => l.code)).size).toBe(LANGS.length);
  });
  for (const l of LANGS.slice(1)) it(`${l.code} has exactly the English keys, none empty, with the same placeholders`, async () => {
    const d = (await l.load!()).default as Record<string, string>;
    const extra = (k: string) => /_(zero|two|few|many)$/.test(k); // extra plural forms a language may add
    expect(Object.keys(d).filter(k => !extra(k)).sort()).toEqual([...keys].sort());
    for (const k of Object.keys(d).filter(extra)) expect(keys.includes((k.replace(/_(zero|two|few|many)$/, "_other")) as Key), `${l.code}.${k} has no base key`).toBe(true);
    for (const k of [...keys, ...Object.keys(d).filter(extra)]) { expect(d[k].trim().length > 0, `${l.code}.${k} empty`).toBe(true); expect(vars(d[k]), `${l.code}.${k} placeholders`).toBe(vars(en[(k.replace(/_(zero|two|few|many)$/, "_other")) as Key])); }
  });
  it("English text has no leftover double spaces or edge spaces", () => { for (const k of keys) expect(en[k], k).toBe(en[k].trim().replace(/\s+/g, " ")); });
});
describe("pickLang", () => {
  it("saved choice first, then the browser's languages, then English", () => {
    expect(pickLang("de", ["es-AR"])).toBe("de");
    expect(pickLang(null, ["es-AR", "en-US"])).toBe("es"); expect(pickLang(null, ["pt-PT"])).toBe("pt"); expect(pickLang(null, ["zh-CN"])).toBe("zh");
    expect(pickLang(null, ["ko-KR", "fr-CA"])).toBe("fr"); expect(pickLang(null, ["ko-KR"])).toBe("en"); expect(pickLang(null, [])).toBe("en");
    expect(pickLang("xx", ["ja"])).toBe("ja");
  });
});
describe("fill", () => {
  it("replaces placeholders and leaves unknown ones visible", () => {
    expect(fill("Builds: {n}", { n: 3 })).toBe("Builds: 3"); expect(fill("Builds: {n}", {})).toBe("Builds: {n}"); expect(fill("No vars here")).toBe("No vars here");
  });
});

describe("tp: plural forms", () => {
  it("English picks one or other and fills {n}", () => { expect(tp("fisPlanRelics", 1)).toBe("★ 1 relic for your plan"); expect(tp("fisPlanRelics", 2)).toBe("★ 2 relics for your plan"); expect(tp("fisPlanRelics", 0)).toBe("★ 0 relics for your plan"); });
  it("Russian uses its one / few / many forms", async () => {
    const ru = (await LANGS.find(l => l.code === "ru")!.load!()).default as Record<string, string>;
    const rules = new Intl.PluralRules("ru"); const form = (n: number) => rules.select(n);
    expect([form(1), form(2), form(5), form(21), form(11)]).toEqual(["one", "few", "many", "one", "many"]);
    for (const f of ["one", "few", "many", "other"]) expect(ru[`fisPlanRelics_${f}`], f).toBeTruthy();
  });
});
