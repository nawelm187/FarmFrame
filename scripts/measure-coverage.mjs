// Weapon catalog coverage (Riven disposition, duplicate names, Incarnon form).
//   node scripts/measure-coverage.mjs                       report mode, downloads WFCD warframe-items (needs internet)
//   node scripts/measure-coverage.mjs --dir ./snapshot      reads Primary.json, Secondary.json, Melee.json from a folder (no network)
//   node scripts/measure-coverage.mjs --dir D --expect scripts/coverage-expect.json    gate mode
//   add --json to print one JSON object instead of text. Nothing is written to the project.
// Exit codes: 0 = report printed / every expectation met; 1 = an expectation was violated (gate mode); 2 = a source file could not be read
// or the expectation file is invalid. A skipped file is never a success.
// Expectation file: { "minWithDisposition": {"Primary": 120, ...}, "maxMissingDisposition": {"Primary": 5, ...},
//   "allowMissing": [{"name": "X", "reason": "...", "reviewed": "YYYY-MM-DD"}], "allowDuplicates": [{"name": "X", "reason": "...", "reviewed": "YYYY-MM-DD"}], "minIncarnon": 10 }
// Counts in the expectation file must come from a real snapshot you reviewed; this repo does not ship invented ones.
import { readFileSync } from "node:fs";
const args = process.argv.slice(2), opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const DIR = opt("--dir"), EXPECT = opt("--expect"), JSON_OUT = args.includes("--json");
const BASE = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/", FILES = ["Primary", "Secondary", "Melee"];
// Same predicates as src/lib/coverage.ts (coverageScript.test.ts keeps the two in step on a fixture).
const num = d => typeof d === "number" && Number.isFinite(d) && d >= 1;
const incarnon = w => (Array.isArray(w.attacks) && w.attacks.some(a => a && typeof a.name === "string" && /incarnon/i.test(a.name))) || (Array.isArray(w.tags) && w.tags.some(t => typeof t === "string" && /incarnon/i.test(t)));
const out = { files: {}, unavailable: [], duplicates: [], incarnon: [], violations: [] }, all = [];
for (const f of FILES) {
  let items;
  try {
    if (DIR) items = JSON.parse(readFileSync(`${DIR}/${f}.json`, "utf8"));
    else { const r = await fetch(`${BASE}${f}.json`); if (!r.ok) throw new Error(`HTTP ${r.status}`); items = await r.json(); }
    if (!Array.isArray(items) || !items.length) throw new Error("empty or not an array");
  } catch (e) { out.unavailable.push(`${f}: ${e.message}`); continue; }
  const ws = items.filter(x => x && typeof x.name === "string"), noDis = ws.filter(w => !num(w.disposition)).map(w => w.name);
  out.files[f] = { entries: ws.length, withDisposition: ws.length - noDis.length, missingDisposition: noDis };
  all.push(...ws);
}
const seen = new Map(); for (const w of all) seen.set(w.name.toLowerCase(), (seen.get(w.name.toLowerCase()) ?? 0) + 1);
out.duplicates = [...seen].filter(([, c]) => c > 1).map(([n]) => n); out.incarnon = all.filter(incarnon).map(w => w.name);
let exit = out.unavailable.length ? 2 : 0;
if (EXPECT) {
  let ex; try { ex = JSON.parse(readFileSync(EXPECT, "utf8")); } catch (e) { out.violations.push(`expectation file unreadable: ${e.message}`); exit = 2; }
  if (ex) {
    const okName = (list, n) => (list ?? []).some(x => x && x.name === n && x.reason && /^\d{4}-\d{2}-\d{2}$/.test(x.reviewed ?? ""));
    for (const [f, n] of Object.entries(ex.minWithDisposition ?? {})) { const g = out.files[f]; if (!g) out.violations.push(`${f}: no data, cannot check minimum`); else if (g.withDisposition < n) out.violations.push(`${f}: ${g.withDisposition} with disposition, expected at least ${n}`); }
    for (const [f, g] of Object.entries(out.files)) { const unexpected = g.missingDisposition.filter(n => !okName(ex.allowMissing, n)); const max = ex.maxMissingDisposition?.[f]; if (max != null && unexpected.length > max) out.violations.push(`${f}: ${unexpected.length} weapons without disposition and not allow-listed (max ${max}): ${unexpected.slice(0, 20).join(", ")}`); }
    for (const n of out.duplicates) if (!okName(ex.allowDuplicates, n)) out.violations.push(`duplicate weapon name not allow-listed: ${n}`);
    if (ex.minIncarnon != null && out.incarnon.length < ex.minIncarnon) out.violations.push(`Incarnon form: ${out.incarnon.length} found, expected at least ${ex.minIncarnon}`);
    if (out.violations.length && exit === 0) exit = 1;
  }
}
if (JSON_OUT) console.log(JSON.stringify({ ...out, exit }));
else {
  for (const [f, g] of Object.entries(out.files)) { console.log(`${f}: ${g.entries} entries, ${g.withDisposition} with disposition, ${g.missingDisposition.length} without`); if (g.missingDisposition.length) console.log(`  without disposition: ${g.missingDisposition.slice(0, 40).join(", ")}${g.missingDisposition.length > 40 ? ", ..." : ""}`); }
  for (const u of out.unavailable) console.log(`SOURCE_UNAVAILABLE ${u}`);
  console.log(`Duplicate names across files: ${out.duplicates.join(", ") || "none"}`); console.log(`Incarnon form: ${out.incarnon.length} -> ${out.incarnon.join(", ")}`);
  for (const v of out.violations) console.log(`VIOLATION ${v}`);
  console.log(EXPECT ? (exit === 0 ? "GATE PASSED" : `GATE FAILED (exit ${exit})`) : `REPORT ONLY, no expectations checked (exit ${exit})`);
}
process.exit(exit);
