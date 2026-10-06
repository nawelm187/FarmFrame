// Builds src/lib/imgindex.json: item name -> picture file, for things the main catalogs do not cover
// (reward items, resources, mods, arcanes, plushies, glyphs). Run: node scripts/make-imgindex.mjs
import { writeFileSync } from "node:fs";
const BASE = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/";
const FILES = ["Misc", "Resources", "Gear", "Arcanes", "Mods", "Skins", "Glyphs", "Sigils", "Fish"];
const key = n => n.toLowerCase().replace(/\s+/g, " ").trim();
const out = {};
for (const f of FILES) {
  const res = await fetch(`${BASE}${f}.json`); if (!res.ok) { console.error(f, res.status); continue; }
  let n = 0;
  for (const x of await res.json()) {
    if (!x?.name || !x?.imageName) continue;
    const k = key(x.name); if (!(k in out)) { out[k] = x.imageName; n++; }
  }
  console.log(f, n);
}
writeFileSync(new URL("../src/lib/imgindex.json", import.meta.url), JSON.stringify(out));
console.log("entries:", Object.keys(out).length);
