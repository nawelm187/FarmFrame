import { placeKey } from "./lib/partImg";
const FILES = import.meta.glob("./assets/planets/*.webp", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const URLS = new Map(Object.entries(FILES).map(([k, v]) => [k.replace(/^.*\//, "").replace(/\.webp$/, ""), v]));
/** Planet picture from src/assets/planets; nothing is drawn when there is none for that name. */
export default function PlanetImg({ name, size = 36 }: { name: string; size?: number }) {
  const u = URLS.get(placeKey(name)); if (!u) return null;
  return <img src={u} alt="" width={size} height={size} loading="lazy" style={{ objectFit: "contain", flex: "none" }} />;
}
