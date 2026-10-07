import { useEffect, useState, type ReactNode } from "react";
import { wikiImage } from "./lib/wikiImg";
import PartArt, { splitPart } from "./PartArt";
import { imgRetry, imgUrl } from "./lib/catalog";
import { imageFor, buildImageIndex } from "./lib/images";
import { useCatalogs } from "./lib/useCatalog";
const own = import.meta.glob("./assets/items/*.{png,webp,jpg,jpeg,svg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const mine: Record<string, string> = {};
const sl = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
for (const [p, u] of Object.entries(own)) mine[sl((p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, ""))] = u;
/** Your own picture from src/assets/items (file name = item name with dashes). Forma variants fall back to forma.png. */
export function bundled(name: string): string | null {
  const n = name.replace(/^\d+x\s+/i, "").replace(/^\d+x\s*/i, ""), base = n.replace(/\s+blueprint$/i, "");
  for (const c of [sl(name), sl(n), sl(base)]) if (mine[c]) return mine[c];
  if (/forma/i.test(base)) { const k = /umbra/i.test(base) ? "umbra-forma" : /aura/i.test(base) ? "aura-forma" : /stance/i.test(base) ? "stance-forma" : /omni/i.test(base) ? "omni-forma" : "forma"; return mine[k] ?? mine.forma ?? null; }
  return null;
}
/** Shared name → picture lookup (warframes, weapons, companions, archwings and their parts). */
let memo: { refs: unknown[]; idx: ReturnType<typeof buildImageIndex> } | null = null;
export function useImages() {
  const c = useCatalogs(["warframe", "weapon", "companion", "archwing"]);
  const refs = [c.warframe?.items, c.weapon?.items, c.companion?.items, c.archwing?.items];
  // One index shared by every picture on the page; rebuilt only when a catalog changes.
  if (!memo || memo.refs.some((r, i) => r !== refs[i])) memo = { refs, idx: buildImageIndex(refs) };
  const idx = memo.idx;
  return (name: string) => { const b = bundled(name); return b ? "bundled:" + b : imageFor(idx, name); };
}
/** Names the main catalogs do not cover (rewards, resources, mods, plushies...). The index is a separate chunk, fetched the first time a picture is missing. */
let extra: Promise<Record<string, string>> | null = null;
const extraFile = async (name: string): Promise<string | null> => {
  extra ??= import("./lib/imgindex.json").then(m => m.default as Record<string, string>).catch(() => ({}));
  const ix = await extra, k = name.toLowerCase().replace(/^\d[\d,]*x\s*/, "").replace(/\s+/g, " ").trim();
  return ix[k] ?? ix[k.replace(/ blueprint$/, "")] ?? null;
};
/** Small picture of an item, with an empty square of the same size while it is missing so rows stay aligned.
 *  Order: bundled file, catalog file, extra index, the repository copy then the CDN copy, the Warframe wiki, and last a neutral square. */
export default function ItemArt({ file, size = 28, name, fallback }: { file: string | null; size?: number; name?: string; fallback?: ReactNode }) {
  const [found, setFound] = useState<string | null>(null), [bad, setBad] = useState(false), [wiki, setWiki] = useState<string | null>(null), [wikiBad, setWikiBad] = useState(false);
  const own = file?.startsWith("bundled:") ? file.slice(8) : null, f = own ? null : file ?? found, missing = !own && (!f || bad);
  useEffect(() => { setBad(false); setWikiBad(false); }, [file, found]);
  // An exact catalog file is better than the owner's picture that useImages falls back to, so the extra index is asked whenever a name is known.
  useEffect(() => { if (own || !name) return; let dead = false; void extraFile(name).then(x => { if (!dead) setFound(x); }); return () => { dead = true; }; }, [own, name]);
  useEffect(() => { if (!missing || !name) return; let dead = false; void wikiImage(name).then(u => { if (!dead) setWiki(u); }); return () => { dead = true; }; }, [missing, name]);
  const exact = found && !own ? found : f, src = own ?? (exact && !bad ? imgUrl(exact) : wikiBad ? null : wiki);
  return src ? <img className="itemart" src={src} alt="" width={size} height={size} loading="lazy" decoding="async" referrerPolicy={own || !exact || bad ? "no-referrer" : undefined}
    onError={ev => { if (own) return; if (exact && !bad) { if (!imgRetry(ev)) setBad(true); } else setWikiBad(true); }} /> : <span className="itemart empty" style={{ width: size, height: size }} aria-hidden="true">{fallback}</span>;
}
/** Picture of an item by name, looked up in the shared index. Use before an item name anywhere in the app. */
export function Pic({ name, size = 28 }: { name: string; size?: number }) {
  const img = useImages(), sp = splitPart(name);
  if (sp) return <PartArt part={sp.part} prime={/\bprime$/i.test(sp.owner)} size={size} />;
  return <ItemArt file={img(name)} name={name} size={size} />;
}
