// Source registry (roadmap V5.43, V5.44, V5.56). Every integration is declared here, with its trust level, so the app
// never hides where a number came from. FarmFrame is built around exchangeable sources, not around one API.
export type Confidence = "A" | "B" | "C" | "D" | "E" | "F";
export const CONFIDENCE: Record<Confidence, string> = {
  A: "Official and current", B: "Official-derived, community-maintained", C: "Reputable community",
  D: "Community inference", E: "User-generated", F: "Unverified",
};
export type Reach = "browser" | "via-our-function" | "unverified";
export interface SourceDef {
  id: string; name: string; kind: "official" | "community" | "app"; confidence: Confidence;
  /** Hostnames whose responses count as this source in the health table (only for sources loaded through the shared loader). */
  hosts: string[]; /** Dataset ids (as in the loader) that belong to this source when its host is shared with another one. */ recIds?: string[]; provides: string; use: "active" | "planned"; reach: Reach;
  /** Which source takes over when this one fails, if one exists in the app today. */
  fallback?: string; note: string;
}
export const SOURCES: SourceDef[] = [
  { id: "warframestat", name: "WarframeStat API (WFCD)", kind: "community", confidence: "B", hosts: ["api.warframestat.us"], provides: "World state: fissures, invasions, cycles, sortie, Baro, Nightwave, Steel Path",
    use: "active", reach: "browser", fallback: "de-worldstate", note: "Parses the official world state. Today it is the only live world-state source, so there is no second source to fall back to yet." },
  { id: "wfcd-items", name: "WFCD warframe-items (GitHub, jsDelivr mirror)", kind: "community", confidence: "B", hosts: ["raw.githubusercontent.com", "cdn.jsdelivr.net"], provides: "Item catalogs: Warframes, weapons, mods, companions, Archwing, relics, arcanes, vault status",
    use: "active", reach: "browser", fallback: "jsDelivr mirror of the same files", note: "Derived from the game's public export. Each file is tried on GitHub first and on the jsDelivr mirror second." },
  { id: "wfcd-drops", name: "WFCD drop data", kind: "community", confidence: "B", hosts: ["drops.warframestat.us"], provides: "Drop tables: relic rewards, enemies, missions, bounties, vendors",
    use: "active", reach: "browser", fallback: "de-drops", note: "Mirror of the official drop tables, refreshed daily." },
  { id: "wfcd-patchlogs", name: "WFCD warframe-patchlogs (GitHub, jsDelivr mirror)", kind: "community", confidence: "B", hosts: [], recIds: ["patchlogs"], provides: "Patch notes: updates and hotfixes with links to the official forum posts",
    use: "active", reach: "browser", fallback: "jsDelivr mirror of the same file", note: "Each entry links to the original Digital Extremes post. The host is shared with the item catalogs, so its health row is the dataset named patchlogs." },
  { id: "wiki", name: "Warframe wiki (MediaWiki API)", kind: "community", confidence: "C", hosts: [], provides: "Portraits of vendors and characters when no bundled image exists",
    use: "active", reach: "unverified", note: "Asked only for characters without a bundled image and remembered for a week. A failure simply leaves the silhouette. Bundled images in src/assets/npc always win." },
  { id: "wfcd-cdn", name: "WarframeStat image CDN", kind: "community", confidence: "B", hosts: ["cdn.warframestat.us"], provides: "Item and relic images",
    use: "active", reach: "browser", note: "Checked by loading one sample image. A missing image shows a neutral placeholder." },
  { id: "warframe-market", name: "warframe.market (through our Supabase function)", kind: "community", confidence: "C", hosts: [], provides: "Platinum prices, checked on demand per item",
    use: "active", reach: "via-our-function", note: "Browsers cannot call it directly, so the request goes through supabase/functions/market. Prices are player-set market values, never fixed game values." },
  { id: "supabase", name: "Supabase (your account)", kind: "app", confidence: "E", hosts: [], provides: "Account, goals, builds and progress sync",
    use: "active", reach: "browser", note: "Your own data. Row level security means only you can read it." },
  { id: "de-worldstate", name: "Digital Extremes world state (through our Supabase function)", kind: "official", confidence: "A", hosts: [], provides: "Live fissures, used when the community API serves old data",
    use: "active", reach: "via-our-function", note: "supabase/functions/worldstate reads the official world state and the node names. Only fissures are read from it today; deploy the function to enable it. It is called only when the main source is stale." },
  { id: "de-publicexport", name: "Digital Extremes PublicExport", kind: "official", confidence: "A", hosts: ["origin.warframe.com", "content.warframe.com"], provides: "Primary item, relic, image and localization source in the roadmap",
    use: "planned", reach: "unverified", note: "Compressed index plus versioned manifests. Needs a server-side job to decode and normalize; not feasible directly from the page." },
  { id: "de-drops", name: "Digital Extremes official drop tables", kind: "official", confidence: "A", hosts: [], provides: "Primary drop source in the roadmap",
    use: "planned", reach: "unverified", note: "Replaces the WFCD mirror as primary once reachable; the mirror stays as fallback." },
];
export const sourceById = (id: string) => SOURCES.find(s => s.id === id);
/** The active source that served a URL, matched by hostname. Null when the URL is unknown or malformed. */
export function sourceFor(url: string): SourceDef | null {
  let h: string; try { h = new URL(url).hostname; } catch { return null; }
  return SOURCES.find(s => s.use === "active" && s.hosts.includes(h)) ?? null;
}
