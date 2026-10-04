import { SUPABASE_KEY, SUPABASE_URL } from "./config";
import { SLOW_MS, type Health } from "./health";
import { MARKET_URL } from "./market";
// Small live checks for sources that are not loaded through the shared data loader (wiki, image CDN, market function, account, world-state function).
// Each check is measured in this browser, once per request of the Sources page.
export interface Probe { ok: boolean; at: number; ms: number; http: number | null; note: string }
const probes = new Map<string, Probe>();
export const allProbes = () => probes;
export const PROBE_IDS = ["wiki", "wfcd-cdn", "warframe-market", "supabase", "de-worldstate"];
/** Health of one check: reachable and quick is healthy; HTTP 429 is rate limited, 401/403/451 blocked, anything else down. */
export function probeHealth(p: Probe | undefined): Health {
  if (!p) return "UNKNOWN";
  if (p.ok) return p.ms > SLOW_MS ? "DEGRADED" : "HEALTHY";
  return p.http === 429 ? "RATE_LIMITED" : p.http === 401 || p.http === 403 || p.http === 451 ? "BLOCKED" : "DOWN";
}
const withTimeout = async <T,>(f: (s: AbortSignal) => Promise<T>) => { const c = new AbortController(), t = setTimeout(() => c.abort(), 15_000); try { return await f(c.signal); } finally { clearTimeout(t); } };
async function run(id: string, f: (s: AbortSignal) => Promise<{ ok: boolean; http: number | null; note: string }>) {
  const t0 = Date.now();
  try { const r = await withTimeout(f); probes.set(id, { ...r, at: Date.now(), ms: Date.now() - t0 }); }
  catch (e) { probes.set(id, { ok: false, at: Date.now(), ms: Date.now() - t0, http: null, note: e instanceof Error && e.name === "AbortError" ? "timeout" : "network or CORS error" }); }
}
const imageLoads = (u: string) => new Promise<boolean>(res => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = u; });
export async function runProbes(imageUrl?: string) {
  await Promise.all([
    run("wiki", async s => { const r = await fetch("https://wiki.warframe.com/api.php?action=query&meta=siteinfo&format=json&origin=*", { signal: s }); return { ok: r.ok, http: r.status, note: "MediaWiki siteinfo" }; }),
    run("wfcd-cdn", async () => { const ok = await imageLoads(imageUrl ?? "https://cdn.warframestat.us/img/RelicAxiD.png"); return { ok, http: null, note: "sample image" }; }),
    // 404 from the function means it answered and the slug is simply unknown: the function itself is up.
    run("warframe-market", async s => { const r = await fetch(MARKET_URL("forma_blueprint"), { signal: s, headers: { apikey: SUPABASE_KEY } }); return { ok: r.ok || r.status === 404, http: r.status, note: "market function, sample item" }; }),
    run("supabase", async s => { const r = await fetch(`${SUPABASE_URL}/auth/v1/health`, { signal: s, headers: { apikey: SUPABASE_KEY } }); return { ok: r.ok, http: r.status, note: "auth health endpoint" }; }),
    run("de-worldstate", async s => { const r = await fetch(`${SUPABASE_URL}/functions/v1/worldstate`, { signal: s, headers: { apikey: SUPABASE_KEY } }); const j = r.ok ? ((await r.json()) as unknown) : null; return { ok: r.ok && Array.isArray(j), http: r.status, note: Array.isArray(j) ? `${j.length} live fissures from Digital Extremes` : r.status === 404 ? "function not deployed" : "function error" }; }),
  ]);
}
