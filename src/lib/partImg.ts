/** Real part icons: file keys such as "neuroptics-prime". Companion parts use the same pictures as the Warframe parts they correspond to. */
const ALIAS: Record<string, string> = { cerebrum: "neuroptics", carapace: "chassis" };
export const partKey = (part: string, prime: boolean): string => { const k = part.trim().toLowerCase().replace(/\s+/g, "-"); return (ALIAS[k] ?? k) + (prime ? "-prime" : ""); };
/** "Höllvania" -> "hollvania", "Kuva Fortress" -> "kuva-fortress": the file name of a planet or place picture. */
export const placeKey = (name: string): string => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
/** The place a node belongs to: "Ceres, Gabii" or "Gabii (Ceres)" both give "Ceres". Null when the text has no recognisable planet. */
export function planetOf(node: string, known: Set<string>): string | null {
  const m = node.match(/\(([^)]+)\)\s*$/), cands = [m?.[1], ...node.split(",").map(s => s.trim())].filter((x): x is string => !!x);
  return cands.find(c => known.has(placeKey(c))) ?? null;
}
