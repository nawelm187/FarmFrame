// Run on a machine with internet: node scripts/measure-coverage.mjs
// Downloads the weapon files of WFCD warframe-items and prints real counts. Nothing is written to the project.
const BASE = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/";
const FILES = ["Primary", "Secondary", "Melee"];
const num = d => typeof d === "number" && Number.isFinite(d) && d >= 1;
const incarnon = w => (Array.isArray(w.attacks) && w.attacks.some(a => a && /incarnon/i.test(a.name ?? ""))) || (Array.isArray(w.tags) && w.tags.some(t => /incarnon/i.test(String(t))));
const all = [];
for (const f of FILES) {
  let items;
  try { const r = await fetch(`${BASE}${f}.json`); if (!r.ok) throw new Error(`HTTP ${r.status}`); items = await r.json(); }
  catch (e) { console.log(`${f}: SOURCE_UNAVAILABLE (${e.message})`); continue; }
  const ws = items.filter(x => x && typeof x.name === "string");
  const noDis = ws.filter(w => !num(w.disposition)).map(w => w.name);
  console.log(`${f}: ${ws.length} entries, ${ws.length - noDis.length} with disposition, ${noDis.length} without`);
  if (noDis.length) console.log(`  without disposition: ${noDis.slice(0, 40).join(", ")}${noDis.length > 40 ? ", ..." : ""}`);
  all.push(...ws.map(w => ({ ...w, _f: f })));
}
const names = new Map(); for (const w of all) names.set(w.name.toLowerCase(), (names.get(w.name.toLowerCase()) ?? 0) + 1);
console.log(`Duplicate names across files: ${[...names].filter(([, c]) => c > 1).map(([n]) => n).join(", ") || "none"}`);
const inc = all.filter(incarnon).map(w => w.name); console.log(`Incarnon form: ${inc.length} -> ${inc.join(", ")}`);
const fam = re => all.filter(w => re.test(w.name)).map(w => w.name);
console.log(`Kuva: ${fam(/^Kuva /).length}, Tenet: ${fam(/^Tenet /).length}, Prime: ${fam(/ Prime$/).length}, Prisma: ${fam(/^Prisma /).length}, Wraith: ${fam(/ Wraith$/).length}, Vandal: ${fam(/ Vandal$/).length}`);
console.log(`With patchlogs: ${all.filter(w => Array.isArray(w.patchlogs) && w.patchlogs.length).length} of ${all.length}`);
