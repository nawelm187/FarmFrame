import { clean } from "./text";
// Patch notes from WFCD/warframe-patchlogs (roadmap V5.16, phase 2). Community mirror of the official forum posts;
// every entry links to the original post. Nothing is summarized or invented here.
export const PATCH_URL = "https://raw.githubusercontent.com/WFCD/warframe-patchlogs/master/data/patchlogs.json";
export const PATCH_ALT = "https://cdn.jsdelivr.net/gh/WFCD/warframe-patchlogs@master/data/patchlogs.json";
export const PATCH_SRC = "WFCD warframe-patchlogs on GitHub (community mirror of official posts)";
export const PATCH_WINDOW = 6 * 3_600_000;
export interface Patch { name: string; url: string | null; date: number; type: string; img: string | null; additions: string; changes: string; fixes: string }
export interface PatchData { patches: Patch[]; /** Entries dropped because they lacked a name or a valid date. */ skipped: number }
const isO = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const str = (x: unknown) => (typeof x === "string" ? x : "");
/** Only plain https links are kept; anything else is shown as text without a link. */
export const safeUrl = (x: unknown): string | null => { const u = str(x).trim(); return /^https:\/\/[^\s]+$/.test(u) ? u : null; };
const cache = new WeakMap<object, PatchData | null>();
/** Newest first. Returns null when the payload is not an array (schema drift), so the page can say so instead of rendering nothing. */
export function parsePatches(d: unknown): PatchData | null {
  if (!Array.isArray(d)) return null;
  const hit = cache.get(d); if (hit !== undefined) return hit;
  const patches: Patch[] = []; let skipped = 0;
  for (const x of d) {
    if (!isO(x)) { skipped++; continue; }
    const name = str(x.name).trim(), date = Date.parse(str(x.date));
    if (!name || !Number.isFinite(date)) { skipped++; continue; }
    patches.push({ name, url: safeUrl(x.url), date, type: str(x.type).trim() || "Other", img: safeUrl(x.imgUrl), additions: clean(str(x.additions)), changes: clean(str(x.changes)), fixes: clean(str(x.fixes)) });
  }
  patches.sort((a, b) => b.date - a.date);
  const r = patches.length ? { patches, skipped } : null; cache.set(d, r); return r;
}
export const patchTypes = (ps: Patch[]) => [...new Set(ps.map(p => p.type))].sort();
/** Case-insensitive match over the title and all three sections. Empty query matches everything. */
export const matchPatch = (p: Patch, q: string) => { const t = q.trim().toLowerCase(); return !t || `${p.name}\n${p.additions}\n${p.changes}\n${p.fixes}`.toLowerCase().includes(t); };
/** The newest full update (type "Update"), falling back to the newest entry of any type. */
export const latestUpdate = (ps: Patch[]) => ps.find(p => p.type.toLowerCase() === "update") ?? ps[0] ?? null;
