import { useEffect, useState } from "react";
const files = import.meta.glob("./assets/npc/*.{png,webp,jpg,jpeg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const art: Record<string, string> = {};
for (const [p, u] of Object.entries(files)) art[(p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "").toLowerCase()] = u;
export const npcSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const KEY = "ff.npcimg", TTL = 7 * 864e5, mem = new Map<string, string | null>();
const rd = (): Record<string, { u: string | null; at: number }> => { try { const v: unknown = JSON.parse(localStorage.getItem(KEY) || "{}"); return v && typeof v === "object" ? (v as Record<string, { u: string | null; at: number }>) : {}; } catch { return {}; } };
/** Portrait from the Warframe wiki (MediaWiki pageimages API), used only when no bundled image exists. Failures are remembered so the wiki is not asked again every visit. */
export async function wikiPortrait(name: string): Promise<string | null> {
  const k = npcSlug(name); if (mem.has(k)) return mem.get(k) ?? null;
  const c = rd()[k]; if (c && Date.now() - c.at < TTL) { mem.set(k, c.u); return c.u; }
  let u: string | null = null;
  try {
    const r = await fetch(`https://wiki.warframe.com/api.php?action=query&titles=${encodeURIComponent(name.replace(/ /g, "_"))}&prop=pageimages&format=json&pithumbsize=240&redirects=1&origin=*`);
    if (r.ok) { const j = (await r.json()) as { query?: { pages?: Record<string, { thumbnail?: { source?: string } }> } }; const src = Object.values(j.query?.pages ?? {})[0]?.thumbnail?.source; if (typeof src === "string" && /^https:\/\//.test(src)) u = src; }
  } catch { /* offline or blocked: keep the silhouette */ }
  mem.set(k, u); try { localStorage.setItem(KEY, JSON.stringify({ ...rd(), [k]: { u, at: Date.now() } })); } catch { /* storage unavailable */ }
  return u;
}
/** A vendor or character: portrait on top, name underneath, so new players know who they are looking at. Without an image, a neutral silhouette. */
export default function Npc({ name, role, size = 72 }: { name: string; role?: string; size?: number }) {
  const own = art[npcSlug(name)], [wiki, setWiki] = useState<string | null>(mem.get(npcSlug(name)) ?? null), [bad, setBad] = useState(false);
  useEffect(() => { if (own) return; let dead = false; void wikiPortrait(name).then(u => { if (!dead) setWiki(u); }); return () => { dead = true; }; }, [name, own]);
  const src = own ?? (bad ? null : wiki);
  return (<figure className="npc" style={{ ["--s" as string]: size + "px" }}>
    {src ? <img src={src} alt={name} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBad(true)} />
      : <svg viewBox="0 0 64 64" role="img" aria-label={name}><circle cx="32" cy="24" r="11" fill="none" stroke="#8E9392" strokeWidth="2" /><path d="M10 62c2-14 12-20 22-20s20 6 22 20" fill="none" stroke="#8E9392" strokeWidth="2" /></svg>}
    <figcaption><b>{name}</b>{role && <span className="muted">{role}</span>}</figcaption>
  </figure>);
}
