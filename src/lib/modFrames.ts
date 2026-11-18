/** Optional official-looking card frames. Drop images into src/assets/modframes/ (see its LEEME.md); a quality with no image keeps the CSS frame. */
export interface FrameCfg { mode: "overlay" | "slice"; slice: number; width: number }
export const DEFAULT_CFG: FrameCfg = { mode: "overlay", slice: 40, width: 8 };
export const FRAME_KEYS = ["common", "uncommon", "rare", "legendary", "amalgam", "archon", "riven", "other"] as const;
const num = (v: unknown, lo: number, hi: number, d: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const one = (o: unknown, base: FrameCfg): FrameCfg => { const r = (o && typeof o === "object" ? o : {}) as Record<string, unknown>; return { mode: r.mode === "slice" ? "slice" : r.mode === "overlay" ? "overlay" : base.mode, slice: num(r.slice, 1, 500, base.slice), width: num(r.width, 0, 60, base.width) }; };
/** config.json: { "mode": "overlay" | "slice", "slice": 48, "width": 14, "tiers": { "rare": { "slice": 52 } } }. Anything invalid falls back to the default. */
export function parseConfig(raw: string | undefined): { base: FrameCfg; tiers: Record<string, FrameCfg> } {
  let j: Record<string, unknown> = {}; try { const v: unknown = raw ? JSON.parse(raw) : {}; if (v && typeof v === "object") j = v as Record<string, unknown>; } catch { /* a broken file means defaults */ }
  const base = one(j, DEFAULT_CFG), tiers: Record<string, FrameCfg> = {}, t = j.tiers && typeof j.tiers === "object" ? j.tiers as Record<string, unknown> : {};
  for (const k of [...FRAME_KEYS, "primed"]) if (k in t) tiers[k] = one(t[k], base);
  return { base, tiers };
}
/** File name to quality. "primed" wins, then the longest quality name found in the name (so "uncommon_frame.png" is uncommon, not common); "default" is the fallback for any quality without its own file. */
export function indexFrames(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, url] of Object.entries(files)) {
    const base = (path.split("/").pop() ?? "").replace(/\.[a-z0-9]+$/i, "").toLowerCase();
    const key = base.includes("primed") ? "primed" : /default|fallback/.test(base) ? "default" : [...FRAME_KEYS].sort((a, b) => b.length - a.length).find(k => base.includes(k));
    if (key && !out[key]) out[key] = url;
  }
  return out;
}
/** Which image frames this card: its own quality, a Primed image for Primed mods, then the default, else null (the CSS frame). */
export function frameFor(tier: string, primed: boolean, frames: Record<string, string>): { key: string; url: string } | null {
  for (const k of [primed ? "primed" : "", tier, "default"]) if (k && frames[k]) return { key: k, url: frames[k] };
  return null;
}
/** CSS classes a framed card gets. */
export const frameClass = (mode: FrameCfg["mode"]) => "has-frame fm-" + mode;
/** CSS custom properties for one card. The URL is quoted and escaped so a strange file name cannot break out of url(). */
export function frameVars(url: string, cfg: FrameCfg): Record<string, string> {
  return { "--frame": `url("${url.replace(/["\\\n\r]/g, c => encodeURIComponent(c))}")`, "--fw": `${cfg.width}px`, "--fs": String(cfg.slice) };
}
// The files themselves, read at build time. With none in the folder everything below is empty and nothing changes.
const imgs = import.meta.glob("../assets/modframes/*.{png,webp,svg,jpg,jpeg}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const cfgFile = Object.values(import.meta.glob("../assets/modframes/config.json", { eager: true, query: "?raw", import: "default" }) as Record<string, string>)[0];
export const FRAMES = indexFrames(imgs), FRAME_CFG = parseConfig(cfgFile);
export const cfgFor = (key: string): FrameCfg => FRAME_CFG.tiers[key] ?? FRAME_CFG.base;
