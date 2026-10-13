import { normalize } from "./smartSearch";
/** Materials and currencies the search recognises, with the other names players use for them (Spanish, short forms, singular/plural).
 *  A name found here is turned into its game name before searching, so "creditos", "plat" or "celulas orokin" mean the same as "Credits", "Platinum" or "Orokin Cell". */
export interface Material { name: string; aliases: string[] }
export const MATERIALS: Material[] = [
  { name: "Credits", aliases: ["credits", "credit", "creditos", "credito", "dinero", "money", "plata"] },
  { name: "Platinum", aliases: ["platinum", "plat", "platino"] },
  { name: "Endo", aliases: ["endo"] },
  { name: "Aya", aliases: ["aya"] },
  { name: "Kuva", aliases: ["kuva"] },
  { name: "Forma", aliases: ["forma blueprint", "forma bp", "forma"] },
  { name: "Orokin Cell", aliases: ["orokin cells", "orokin cell", "celulas orokin", "celula orokin", "cells", "cell", "celulas"] },
  { name: "Plastids", aliases: ["plastids", "plastid", "plastidos"] },
  { name: "Argon Crystal", aliases: ["argon crystals", "argon crystal", "cristales de argon", "cristal de argon", "cristales argon", "argon"] },
  { name: "Steel Essence", aliases: ["steel essence", "esencia de acero", "esencia acero"] },
  { name: "Void Traces", aliases: ["void traces", "void trace", "trazas del vacio", "trazas void", "trazas", "traces"] },
  { name: "Vosfor", aliases: ["vosfor"] },
  { name: "Gallium", aliases: ["gallium", "galio"] },
  { name: "Nitain Extract", aliases: ["nitain extract", "extracto de nitain", "nitain"] },
  { name: "Tellurium", aliases: ["tellurium", "telurio"] },
  { name: "Ayatan Star", aliases: ["ayatan stars", "ayatan star", "estrellas ayatan", "estrella ayatan", "ayatan"] },
  { name: "Neurodes", aliases: ["neurodes", "neurodo"] },
  { name: "Rubedo", aliases: ["rubedo"] },
  { name: "Detonite Ampule", aliases: ["detonite ampule", "detonite"] },
  { name: "Alloy Plate", aliases: ["alloy plate", "alloy plates", "placa de aleacion", "placas de aleacion"] },
  { name: "Ferrite", aliases: ["ferrite", "ferrita"] },
  { name: "Nano Spores", aliases: ["nano spores", "nano spore", "nanoesporas"] },
  { name: "Salvage", aliases: ["salvage"] },
  { name: "Polymer Bundle", aliases: ["polymer bundle", "polymer bundles", "polimero", "polimeros"] },
  { name: "Control Module", aliases: ["control module", "control modules", "modulo de control", "modulos de control"] },
  { name: "Morphics", aliases: ["morphics", "morphic"] },
  { name: "Neural Sensors", aliases: ["neural sensors", "neural sensor", "sensores neurales"] },
  { name: "Orokin Cell", aliases: [] },
];
const ALIAS = new Map<string, string>();
for (const m of MATERIALS) { for (const a of m.aliases) ALIAS.set(normalize(a), m.name); ALIAS.set(normalize(m.name), m.name); }
const MAXN = Math.max(...[...ALIAS.keys()].map(k => k.split(" ").length));
/** "mejor forma de farmear X" says "way", not the item Forma. */
const WAY = [[/\b(?:la |una |otra )?mejor(?:es)? formas? de\b/g, "best way to"], [/\bformas? (?:rapidas? |mas rapidas? )?de (farmear|conseguir|obtener|ganar)\b/g, "way to $1"]] as const;
export interface Canon { text: string; materials: string[] }
/** The query with every known material replaced by its game name. `materials` lists them in the order they appear. */
export function canon(q: string): Canon {
  let n = normalize(q); for (const [re, to] of WAY) n = n.replace(re, to);
  const ts = n ? n.split(" ") : [], out: string[] = [], mats: string[] = [];
  for (let i = 0; i < ts.length;) {
    let hit: string | null = null, len = 0;
    for (let k = Math.min(MAXN, ts.length - i); k >= 1; k--) { const m = ALIAS.get(ts.slice(i, i + k).join(" ")); if (m) { hit = m; len = k; break; } }
    if (hit) { out.push(normalize(hit)); if (!mats.includes(hit)) mats.push(hit); i += len; } else { out.push(ts[i]); i++; }
  }
  return { text: out.join(" "), materials: mats };
}
