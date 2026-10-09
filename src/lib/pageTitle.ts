const BASE = "FarmFrame";
/** Tab title from a page heading. */
export function titleFrom(h1: string | null | undefined) {
  const t = (h1 ?? "").replace(/\s+/g, " ").trim();
  return t && t.toLowerCase() !== BASE.toLowerCase() ? `${t} · ${BASE}` : BASE;
}
