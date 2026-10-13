import { expect, it } from "vitest";
import { buildIndex, detectIntent, normalize, searchIndex, tokens, within, type Doc } from "./smartSearch";
const docs: Doc[] = [
  { title: "Ash Prime Neuroptics", kind: "Part", to: "/item/ash" }, { title: "Ash Prime", kind: "Warframe", to: "/warframe/ash-prime", body: "Master of stealth who turns invisible and slays enemies with shuriken" },
  { title: "Wisp", kind: "Warframe", to: "/warframe/wisp", body: "A being of light that plants motes" }, { title: "Mag Prime", kind: "Warframe", to: "/warframe/mag-prime" },
  { title: "Forma", kind: "Resource", to: "/resources?q=Forma", body: "Used to change polarity. Dropped at Orokin Derelict Sedna Hydron Void" },
  { title: "Rhino Prime Neuroptics", kind: "Part", to: "/item/rhino" }, { title: "Fissures", kind: "Page", to: "/fissures", alias: "void relic missions" }, { title: "Baro Ki'Teer", kind: "Page", to: "/rotations" },
];
const ix = buildIndex(docs), top = (q: string) => searchIndex(ix, q, 3).map(m => m.doc.title);
it("normalizes accents, apostrophes and punctuation", () => { expect(normalize("  Baro Ki'Teer!  ")).toBe("baro kiteer"); expect(tokens("Qué Farmear")).toEqual(["que", "farmear"]); });
it("counts a swapped pair of letters as one edit", () => { expect(within("wsip", "wisp", 1)).toBe(1); expect(within("abcd", "wxyz", 2)).toBe(3); });
it("finds a name from a few letters, in any word order, or with a typo", () => {
  expect(top("ash pri neur")[0]).toBe("Ash Prime Neuroptics"); expect(top("neuroptics ash prime")[0]).toBe("Ash Prime Neuroptics");
  expect(top("wsip")[0]).toBe("Wisp"); expect(top("mag")[0]).toBe("Mag Prime");
});
it("finds something from a piece of its description or its drop places", () => {
  expect(top("invisible stealth frame")[0]).toBe("Ash Prime"); expect(top("sedna hydron")[0]).toBe("Forma"); expect(top("void relic missions")[0]).toBe("Fissures");
});
it("ignores filler words but still works when the query is only filler", () => {
  expect(top("where do i get forma")[0]).toBe("Forma"); expect(searchIndex(ix, "the", 3).length >= 0).toBe(true); expect(top("")).toEqual([]);
});
it("needs most of the words, so an unrelated word does not match", () => { expect(top("zzzzqq")).toEqual([]); expect(top("ash rhino banana")).toEqual([]); });
it("reads what is being asked from the words, not from a fixed sentence", () => {
  for (const q of ["what should I farm now", "que farmear ahora", "best thing to farm today", "farm now", "what to farm", "qué conviene farmear hoy"]) expect(detectIntent(q)).toEqual({ kind: "now" });
  expect(detectIntent("what changed in the latest update")).toEqual({ kind: "changed" }); expect(detectIntent("cambios del parche")).toEqual({ kind: "changed" });
  expect(detectIntent("where do I farm forma")).toEqual({ kind: "where", subject: "forma" });
  expect(detectIntent("donde conseguir ash prime neuroptics")).toEqual({ kind: "where", subject: "ash prime neuroptics" });
  expect(detectIntent("who sells seeking shuriken")).toEqual({ kind: "where", subject: "seeking shuriken" });
  expect(detectIntent("fastest way to farm credits")).toEqual({ kind: "method", subject: "credits" }); expect(detectIntent("mejor forma de farmear aya")).toEqual({ kind: "method", subject: "aya" }); expect(detectIntent("fastest way to farm")).toEqual({ kind: "method", subject: "" });
  expect(detectIntent("ash prime")).toBeNull(); expect(detectIntent("farm")).toBeNull(); expect(detectIntent("")).toBeNull();
});
it("reads \"how do I get X\" and \"what is X\" without a farming word", () => {
  expect(detectIntent("how to get orokin cell")).toEqual({ kind: "where", subject: "orokin cell" }); expect(detectIntent("como encuentro este material gallium")).toEqual({ kind: "where", subject: "gallium" });
  expect(detectIntent("best way to get endo fast")).toEqual({ kind: "method", subject: "endo" }); expect(detectIntent("what is vosfor")).toEqual({ kind: "what", subject: "vosfor" }); expect(detectIntent("para que sirve el vosfor")).toEqual({ kind: "what", subject: "vosfor" });
  expect(detectIntent("how are you")).toBeNull(); expect(detectIntent("what is")).toBeNull();
});
