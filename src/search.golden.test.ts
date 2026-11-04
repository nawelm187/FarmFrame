import { expect, it } from "vitest";
import { methodsForQuery, understand } from "./understand";
/** Phrases people really type, in Spanish and English, with what the search must understand. Add a line here whenever a search fails in real use. */
type Want = { kind: "now" | "changed" | "method" | "where" | "what" | null; material?: string; method?: string };
const G: [string, Want][] = [
  // How do I get X
  ["how to get orokin cells", { kind: "where", material: "Orokin Cell", method: "orokin-cell" }], ["how do I get gallium", { kind: "where", material: "Gallium", method: "gallium-caches" }], ["where do i get nitain extract", { kind: "where", material: "Nitain Extract", method: "nitain-extract" }],
  ["where can I find vosfor", { kind: "where", material: "Vosfor", method: "vosfor-sources" }], ["how do I find tellurium", { kind: "where", material: "Tellurium", method: "tellurium-caches" }], ["how can i get void traces", { kind: "where", material: "Void Traces", method: "void-traces-reactant" }],
  ["como encuentro este material gallium", { kind: "where", material: "Gallium", method: "gallium-caches" }], ["como encuentro celulas orokin", { kind: "where", material: "Orokin Cell", method: "orokin-cell" }], ["como consigo vosfor", { kind: "where", material: "Vosfor", method: "vosfor-sources" }],
  ["donde farmear aya", { kind: "where", material: "Aya", method: "aya-" }], ["donde consigo nitain", { kind: "where", material: "Nitain Extract", method: "nitain-extract" }], ["donde conseguir forma", { kind: "where", material: "Forma", method: "forma-sources" }],
  ["como obtengo trazas del vacio", { kind: "where", material: "Void Traces", method: "void-traces-reactant" }], ["como consigo esencia de acero", { kind: "where", material: "Steel Essence", method: "steel-essence-routes" }], ["donde consigo cristales de argon", { kind: "where", material: "Argon Crystal", method: "argon-containers" }],
  ["where do i farm forma", { kind: "where", material: "Forma", method: "forma-sources" }], ["farm plastids", { kind: "where", material: "Plastids", method: "plastids-uranus" }], ["how do i get a forma", { kind: "where", material: "Forma", method: "forma-sources" }],
  // Best / fastest way
  ["fastest way to farm credits", { kind: "method", material: "Credits", method: "credits-" }], ["best way to get endo fast", { kind: "method", material: "Endo", method: "endo-" }], ["best way to farm steel essence", { kind: "method", material: "Steel Essence", method: "steel-essence-routes" }],
  ["mejor forma de farmear creditos", { kind: "method", material: "Credits", method: "credits-" }], ["mejor forma de farmear aya", { kind: "method", material: "Aya", method: "aya-" }], ["como conseguir creditos rapido", { kind: "method", material: "Credits", method: "credits-" }],
  ["formas de farmear endo", { kind: "method", material: "Endo", method: "endo-" }], ["la mejor forma de conseguir kuva", { kind: "method", material: "Kuva", method: "kuva-flood" }], ["fastest way to farm orokin cells", { kind: "method", material: "Orokin Cell", method: "orokin-cell" }],
  ["efficient way to get argon crystals", { kind: "method", material: "Argon Crystal", method: "argon-containers" }], ["best method to farm void traces", { kind: "method", material: "Void Traces", method: "void-traces-reactant" }],
  // Trick or strategy words
  ["credit farm xoris", { kind: "where", material: "Credits", method: "credits-index-xoris" }], ["index credits xoris farm", { kind: "where", material: "Credits", method: "credits-index-xoris" }],
  // What is X
  ["what is vosfor", { kind: "what", material: "Vosfor" }], ["que es vosfor", { kind: "what", material: "Vosfor" }], ["what is nitain extract", { kind: "what", material: "Nitain Extract" }], ["para que sirve el vosfor", { kind: "what", material: "Vosfor" }],
  ["que son los plastidos", { kind: "what", material: "Plastids" }], ["what are void traces", { kind: "what", material: "Void Traces" }], ["que es endo", { kind: "what", material: "Endo" }], ["que es la aya", { kind: "what", material: "Aya" }],
  // Short names and slang
  ["farm plat", { kind: "where", material: "Platinum" }], ["donde consigo plat", { kind: "where", material: "Platinum" }], ["como consigo platino", { kind: "where", material: "Platinum" }],
  // What to farm now, what changed
  ["what should I farm now", { kind: "now" }], ["que farmear ahora", { kind: "now" }], ["best thing to farm today", { kind: "now" }], ["qué conviene farmear hoy", { kind: "now" }], ["what changed in the latest update", { kind: "changed" }], ["cambios del parche", { kind: "changed" }],
  // Plain names must not turn into a question
  ["wisp prime", { kind: null }], ["ash prime", { kind: null }], ["lith a1", { kind: null }], ["forma", { kind: null }], ["wsip", { kind: null }], ["credits", { kind: null, material: "Credits" }], ["vosfor", { kind: null, material: "Vosfor" }], ["kuva lich", { kind: null, material: "Kuva" }],
];
it("understands every phrase in the golden list", () => {
  const bad: string[] = [];
  for (const [q, w] of G) {
    const u = understand(q), kind = u.intent?.kind ?? null, ms = methodsForQuery(u);
    if (kind !== w.kind) bad.push(`${q}: intent ${kind}, wanted ${w.kind}`);
    else if (w.material !== undefined && u.material !== w.material) bad.push(`${q}: material ${u.material}, wanted ${w.material}`);
    else if (w.method && !ms.some(m => m.id.startsWith(w.method!))) bad.push(`${q}: methods [${ms.map(m => m.id)}], wanted one starting with ${w.method}`);
    else if (w.method && ms[0] && !ms[0].id.startsWith(w.method) && w.method.length > 12) bad.push(`${q}: first method ${ms[0].id}, wanted ${w.method}`);
  }
  expect(bad).toEqual([]);
});
it("never leaves a material name in Spanish or short form un-translated", () => {
  for (const [q, m] of [["creditos", "credits"], ["plat", "platinum"], ["celulas orokin", "orokin cell"], ["trazas del vacio", "void traces"], ["esencia de acero", "steel essence"]]) expect(understand(q).text).toBe(m);
  // "forma" as the Spanish word for "way" is not the item Forma.
  expect(understand("mejor forma de farmear aya").material).toBe("Aya");
});
it("understands misspelt materials like the correct ones", () => {
  for (const [q, mat] of [["como consigo aia", "Aya"], ["donde farmear kuba", "Kuva"], ["como conseguir creditoz", "Credits"], ["que es bosfor", "Vosfor"], ["how do i get galium", "Gallium"], ["donde consigo selulas orokin", "Orokin Cell"], ["fastest way to farm tellurum", "Tellurium"]]) expect(understand(q).material).toBe(mat);
  // Question words must never be bent into a material: "sell" sounds like "cell".
  expect(understand("where do they sell vosfor").material).toBe("Vosfor"); expect(understand("who sells forma").material).toBe("Forma");
});
