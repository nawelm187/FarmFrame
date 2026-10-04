import { useState } from "react";
import { imgUrl } from "./lib/catalog";
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
/** Small picture of an item, with an empty square of the same size while it is missing so rows stay aligned. */
export default function ItemArt({ file, size = 28 }: { file: string | null; size?: number }) {
  const [bad, setBad] = useState(false);
  return file && !bad ? <img className="itemart" src={file.startsWith("bundled:") ? file.slice(8) : imgUrl(file)} alt="" width={size} height={size} loading="lazy" decoding="async" onError={() => setBad(true)} /> : <span className="itemart empty" style={{ width: size, height: size }} aria-hidden="true" />;
}
/** Picture of an item by name, looked up in the shared index. Use before an item name anywhere in the app. */
export function Pic({ name, size = 28 }: { name: string; size?: number }) { const img = useImages(); return <ItemArt file={img(name)} size={size} />; }
