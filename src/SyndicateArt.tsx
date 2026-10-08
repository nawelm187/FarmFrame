import { keyOf } from "./data/syndicateInfo";
const FILES = import.meta.glob("./assets/syndicates/*.webp", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const URLS = new Map(Object.entries(FILES).map(([p, u]) => [keyOf((p.split("/").pop() ?? "").replace(".webp", "").replace(/-/g, " ")), u]));
/** Syndicate emblem (cropped from the wiki's syndicate page); nothing is drawn when there is none for that name. */
export default function SyndicateArt({ name, size = 40 }: { name: string; size?: number }) {
  const u = URLS.get(keyOf(name)); if (!u) return null;
  return <img src={u} alt="" width={size} height={size} loading="lazy" style={{ borderRadius: 8, flex: "none" }} />;
}
