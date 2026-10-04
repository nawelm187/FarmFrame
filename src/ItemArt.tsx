import { useState } from "react";
import { imgUrl } from "./lib/catalog";
import { imageFor, buildImageIndex } from "./lib/images";
import { useCatalogs } from "./lib/useCatalog";
import { useMemo } from "react";
/** Shared name → picture lookup (warframes, weapons, companions, archwings and their parts). */
export function useImages() {
  const c = useCatalogs(["warframe", "weapon", "companion", "archwing"]);
  const idx = useMemo(() => buildImageIndex([c.warframe?.items, c.weapon?.items, c.companion?.items, c.archwing?.items]), [c.warframe?.items, c.weapon?.items, c.companion?.items, c.archwing?.items]);
  return (name: string) => imageFor(idx, name);
}
/** Small picture of an item, with an empty square of the same size while it is missing so rows stay aligned. */
export default function ItemArt({ file, size = 28 }: { file: string | null; size?: number }) {
  const [bad, setBad] = useState(false);
  return file && !bad ? <img className="itemart" src={imgUrl(file)} alt="" width={size} height={size} loading="lazy" decoding="async" onError={() => setBad(true)} /> : <span className="itemart empty" style={{ width: size, height: size }} aria-hidden="true" />;
}
