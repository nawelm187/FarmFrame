#!/usr/bin/env node
// Reads the REAL community data and writes reporte-datos.txt with the facts FarmFrame depends on (field names, types, value sets).
// Usage (project root, with network): node tools/check-data.mjs          Or offline: node tools/check-data.mjs --dir path/to/folder-with-the-json-files
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const BASE = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/", dir = process.argv.includes("--dir") ? process.argv[process.argv.indexOf("--dir") + 1] : null;
const load = async f => { try { return JSON.parse(dir ? readFileSync(join(dir, f), "utf8") : await (await fetch(BASE + f)).text()); } catch (e) { return `could not load ${f}: ${e.message}`; } };
const kind = v => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v), tally = (items, key) => { const m = {}; for (const e of items) { const k = kind(e[key]); m[k] = (m[k] ?? 0) + 1; } return Object.entries(m).map(([k, n]) => `${k}:${n}`).join(" ") || "absent"; };
const vals = (items, f) => [...new Set(items.flatMap(e => [].concat(f(e) ?? [])).map(String))].sort().slice(0, 40).join(", ");
const out = [`FarmFrame data report ${new Date().toISOString()}`, ""];
for (const [file, keys] of [["Warframes.json", ["aura", "polarities", "components", "imageName", "isPrime", "vaulted", "masteryReq"]], ["Melee.json", ["stancePolarity", "polarities", "components", "imageName"]], ["Primary.json", ["polarities", "components", "imageName"]], ["Mods.json", ["polarity", "rarity", "baseDrain", "fusionLimit", "compatName", "type", "levelStats", "description", "imageName", "isUtility"]]]) {
  const d = await load(file); if (typeof d === "string") { out.push(`## ${file}: ${d}`, ""); continue; }
  const items = Array.isArray(d) ? d : Object.values(d); out.push(`## ${file}: ${items.length} items`);
  for (const k of keys) out.push(`   ${k.padEnd(14)} ${tally(items, k)}`);
  if (file === "Warframes.json") out.push(`   aura values    ${vals(items, e => e.aura)}`, `   frames with a LIST as aura: ${items.filter(e => Array.isArray(e.aura)).map(e => e.name).slice(0, 8).join(", ") || "none"}`);
  if (file === "Melee.json") out.push(`   stancePolarity values ${vals(items, e => e.stancePolarity)}`);
  if (file === "Mods.json") out.push(`   polarity values ${vals(items, e => e.polarity)}`, `   rarity values   ${vals(items, e => e.rarity)}`, `   compatName      ${vals(items, e => e.compatName)}`, `   type values     ${vals(items, e => e.type)}`);
  out.push("");
}
writeFileSync("reporte-datos.txt", out.join("\n")); console.log(out.join("\n") + "\nWritten: reporte-datos.txt  (send me that file)");
