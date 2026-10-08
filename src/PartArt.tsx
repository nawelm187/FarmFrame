import { partKey } from "./lib/partImg";
/** Original line icons for the kinds of part a blueprint is made of, so a Chassis does not borrow its Warframe's picture. */
const P: Record<string, string> = {
  Chassis: "M8 4h8l3 4-2 3v9H7v-9L5 8z", Neuroptics: "M6 13a6 6 0 0 1 12 0v5l-3 2H9l-3-2zM9 13h6", Systems: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  Barrel: "M3 9h13v6H3zM16 10h5v4h-5z", Receiver: "M4 8h12l4 3v5H8l-2 3H4z", Stock: "M4 9h7l9 3v4l-6 2H4z", Blade: "M5 19 19 5l-1 6-7 7zM4 20l3-1-2-2z", Handle: "M9 3h6v4l-1 14h-4L9 7z",
  Link: "M9 15a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1M15 9a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1", Carapace: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", Cerebrum: "M8 8a3 3 0 0 1 6-1 3 3 0 0 1 3 4 3 3 0 0 1-1 5 3 3 0 0 1-6 1 3 3 0 0 1-3-5 3 3 0 0 1 1-4z",
  Gauntlet: "M8 21v-8L6 9l2-1 2 3V4h2v7V3h2v8V5h2v8l2-2 1 2-3 6z", Glove: "M8 21v-8L6 9l2-1 2 3V4h2v7V3h2v8V5h2v8l2-2 1 2-3 6z", Grip: "M9 4h6l-1 6 2 4-2 6h-4l-2-6 2-4z", Guard: "M4 10h16v3H4zM10 13v7h4v-7", Hilt: "M6 9h12M12 9v11M10 20h4",
  Head: "M6 5h12v5l-3 2v7H9v-7L6 10z", String: "M6 4c8 3 8 13 0 16M6 4v16", "Lower Limb": "M6 4c10 2 10 14 0 16", "Upper Limb": "M18 4C8 6 8 18 18 20", Disc: "M12 4a8 8 0 1 0 .01 0M12 10a2 2 0 1 0 .01 0",
  Engine: "M4 12h4l2-4h4l2 4h4M8 12v5h8v-5", Ornament: "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z", Holster: "M7 4h8l2 6-2 10H9z", Stars: "M12 3l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z",
  Rivet: "M12 5a2 2 0 1 0 .01 0M12 7v12M8 19h8", Hook: "M12 3v10a4 4 0 1 1-4-4", Boot: "M8 4h6v9l5 3v4H6V13z", Chain: "M7 12h10M4 9a3 3 0 0 0 0 6M20 9a3 3 0 0 1 0 6", Heatsink: "M5 9h14M5 13h14M5 17h14M8 5v14M12 5v14M16 5v14",
  Motor: "M6 8h9v8H6zM15 10h4v4h-4zM9 4h3v4", Core: "M12 4a8 8 0 1 0 .01 0M12 8a4 4 0 1 0 .01 0", Aegis: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 8v8",
};
const DEFAULT = "M12 3l7 4v10l-7 4-7-4V7z";
/** Splits "Ash Prime Chassis" into the owner and the part kind, or returns null when the name does not end in a known part (a Blueprint keeps its owner's picture). */
export function splitPart(name: string): { owner: string; part: string } | null {
  const m = name.match(/^(.*?)\s*(Lower Limb|Upper Limb|Chassis|Neuroptics|Systems|Barrel|Receiver|Stock|Blade|Handle|Link|Carapace|Cerebrum|Gauntlet|Glove|Grip|Guard|Hilt|Head|String|Disc|Engine|Ornament|Holster|Stars|Rivet|Hook|Boot|Chain|Heatsink|Motor|Core|Aegis)$/);
  return m && m[1] ? { owner: m[1], part: m[2] } : null;
}
const FILES = import.meta.glob("./assets/parts/*.webp", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const URLS = new Map(Object.entries(FILES).map(([k, v]) => [k.replace(/^.*\//, "").replace(/\.webp$/, ""), v]));
export default function PartArt({ part, prime = false, size = 36 }: { part: string; prime?: boolean; size?: number }) {
  const c = prime ? "#C9A961" : "#00D6D6", u = URLS.get(partKey(part, prime));
  // The real icon when there is one; the drawn line icon otherwise (for example for a part with no picture yet), so nothing is left blank.
  if (u) return <img className="partart" src={u} width={size} height={size} alt={part} loading="lazy" style={{ objectFit: "contain" }} />;
  return (<svg className="partart" viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={part} style={{ color: c }}>
    <rect x="0.5" y="0.5" width="23" height="23" rx="5" fill="rgba(15,20,25,.85)" stroke={c} strokeOpacity=".35" />
    <path d={P[part] ?? DEFAULT} transform="translate(3.6 3.6) scale(.7)" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
