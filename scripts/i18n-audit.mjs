// Finds user-visible English text written directly in the screens (not through t()). Usage: node scripts/i18n-audit.mjs [--files] [--json]
// It reads JSX text between tags and the attributes title, aria-label, placeholder and alt that hold a literal string. It cannot see sentences
// built in code (template strings, data files), so a clean result means "no hard-coded JSX text", not "every sentence is translated".
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.tsx$/.test(p) && !/\.test\.tsx$/.test(p) ? [p] : []; });
/** Names and key caps shown as in the game or on the keyboard: not translated on purpose. */
const KEEP = /^(FarmFrame|Ctrl K|Cetus \(Plains\)|Orb Vallis|Cambion Drift|Zariman|Void Fissures|Steel Path|Star Chart and Railjack|Star Chart only|Void Storms \(Railjack\)|Shield drain|Health drain|Energy drain|Steel Path Honors|Duviri|1999 Calendar|Prime Resurgence|Archimedea|Arbitration|Sanctuary|Sentient Anomaly|Kuva Siphons|Palladino|Acrithis|The Descendia|Teshin|Varzia|Darvo|Baro Ki'Teer|Cephalon Simaris|Forma Blueprint|Omni Forma Blueprint|Omni Forma|Orokin Catalyst|Orokin Reactor|WFCD warframe-items on GitHub[^|]*|Sortie|Archon Hunt|Nightwave|Nora Night)$/;
/** Text that is really code (generics, operators) caught by the simple tag pattern. */
const CODE = /\*\.\{|\*\.webp|translate\(|var\(--|updated_at|CloudProvider missing|Companion Mod|Lower Limb|Upper Limb|the murmur|^[\d.]+(rem|px|em|%)(\s|$)|Date\.now|application\/json|\?\? |^[:?]\s|\s[?:]\s*$|\bs\.mod\b|prefers-reduced-motion|crashed|[=;&|]|=>|useState|useRef|Record|\bnull\b|createRoot|\.length\b/;
/** Attributes and props whose string is code, a path, a picture name or a style, never text a person reads. */
const NOT_TEXT = /(className|to|href|key|role|type|id|name|art|src|style|rel|target|aria-pressed|aria-selected|aria-current|aria-live|htmlFor|loading|inputMode|autoComplete|pattern|viewBox|fill|stroke|d|k|f|s|c|on|tier|kind|mode|status|cat|slug|from|import)\s*[=:(]\s*\{?\s*$/;
export function findHardcoded(src) {
  const out = [], lines = src.split("\n"), seen = new Set(), add = (line, text) => { const k = line + "|" + text; if (!seen.has(k)) { seen.add(k); out.push({ line, text }); } };
  lines.forEach((ln, i) => {
    if (/^\s*(import |export \* |\/\/|\*|\/\*)/.test(ln)) return;
    for (const m of ln.matchAll(/>([^<>{}]*[A-Za-z]{3,}[^<>{}]*)</g)) { const t = m[1].trim(); if (/[A-Za-z]{3,}/.test(t) && !/^[\w./:-]+$/.test(t) && !KEEP.test(t) && !CODE.test(t)) add(i + 1, t); }
    for (const m of ln.matchAll(/\b(?:title|aria-label|placeholder|alt|why|note|label|pre)="([^"{}]*[A-Za-z]{3,}[^"{}]*)"/g)) if (!KEEP.test(m[1]) && !CODE.test(m[1])) add(i + 1, m[1]);
    // Sentence-like string literals and template strings anywhere in an expression ("Mark complete", `, ${n} still missing`).
    for (const m of ln.matchAll(/(["`])((?:\\.|(?!\1)[^\\\n])*)\1/g)) {
      const before = ln.slice(Math.max(0, m.index - 40), m.index), raw = m[2], text = raw.replace(/\$\{[^}]*\}/g, "").trim();
      if (NOT_TEXT.test(before) || /\b(?:t|tr)\($/.test(before) || KEEP.test(text) || CODE.test(text) || /^[\w./:#?&=%@-]+$/.test(text)) continue;
      const words = text.match(/[A-Za-z]{3,}/g) ?? [];
      if (words.length >= 2 || (words.length === 1 && /^[A-Z]/.test(text) && /[.!?:…✓★]/.test(text + before.slice(-2)))) { if (!/^(btn|tag|muted|chips|bar|list|wrap|panel|row|num|gold|lead)\b/.test(text)) add(i + 1, text); }
    }
  });
  return out;
}
export function audit(root = "src") { return walk(root).sort().map(f => ({ file: f.replace(/\\/g, "/"), found: findHardcoded(readFileSync(f, "utf8")) })); }
if (process.argv[1]?.endsWith("i18n-audit.mjs")) {
  const rows = audit(), total = rows.reduce((a, r) => a + r.found.length, 0);
  if (process.argv.includes("--json")) console.log(JSON.stringify(rows.filter(r => r.found.length)));
  else { for (const r of rows.filter(r => r.found.length).sort((a, b) => b.found.length - a.found.length)) { console.log(`${String(r.found.length).padStart(4)} ${r.file}`); if (process.argv.includes("--files")) r.found.forEach(x => console.log(`       ${x.line}: ${x.text.slice(0, 90)}`)); }
    console.log(`\n${rows.filter(r => !r.found.length).length} of ${rows.length} screens have no hard-coded text; ${total} hard-coded strings remain in ${rows.filter(r => r.found.length).length} screens`); }
}
