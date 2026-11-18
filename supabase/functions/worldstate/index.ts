// Supabase Edge Function: fallback for live fissures straight from Digital Extremes' public world state.
// Used only when the community API serves old data. Hosts are fixed; the browser sends no address, so it cannot be used to reach other sites.
const ORIGINS = ["https://nawelm187.github.io", "http://localhost:5173", "http://localhost:4173", ...(Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(x => x.trim()).filter(Boolean)];
// Error contract (docs/ERRORES.md): the HTTP status is the number, and "code" is a stable word the app can rely on. "error" is a short fixed message.
const CODES: Record<number, string> = { 400: "bad_request", 401: "login_required", 403: "forbidden", 404: "not_found", 405: "method_not_allowed", 413: "payload_too_large", 415: "unsupported_media_type", 422: "invalid_request", 429: "rate_limited", 502: "upstream_error", 503: "service_unavailable", 504: "upstream_timeout" };
const SAFE = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
const corsFor = (origin: string | null) => ({ "Access-Control-Allow-Origin": origin && ORIGINS.includes(origin) ? origin : ORIGINS[0], "Vary": "Origin", "Access-Control-Allow-Headers": "apikey, content-type, authorization", "Access-Control-Allow-Methods": "GET, OPTIONS", ...SAFE });
// Best-effort limiter: it lives in the memory of one instance, so it slows a flood down but is not a guarantee.
const hits = new Map<string, number[]>();
const limited = (ip: string, max = 60, windowMs = 60_000) => {
  const now = Date.now(), a = (hits.get(ip) ?? []).filter(t => now - t < windowMs); a.push(now); hits.set(ip, a);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
  return a.length > max;
};
const clientIp = (req: Request) => req.headers.get("cf-connecting-ip") ?? (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
const WS = "https://content.warframe.com/dynamic/worldState.php";
const NODES = "https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/master/data/solNodes.json";
const TIERS = ["Lith", "Meso", "Neo", "Axi", "Requiem", "Omnia"];
type O = Record<string, unknown>;
const isO = (x: unknown): x is O => !!x && typeof x === "object" && !Array.isArray(x);
const ms = (d: unknown): number | null => { const v = isO(d) && isO(d.$date) ? d.$date.$numberLong : null; const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN; return Number.isFinite(n) ? n : null; };
let nodes: Record<string, { value?: string; enemy?: string; type?: string }> | null = null, nodesAt = 0;
async function getNodes() {
  if (nodes && Date.now() - nodesAt < 6 * 3_600_000) return nodes;
  try { const r = await fetch(NODES, { signal: AbortSignal.timeout(8000) }); if (r.ok) { nodes = await r.json(); nodesAt = Date.now(); } } catch { /* keep the old copy if any */ }
  return nodes ?? {};
}
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin"), cors = corsFor(origin), json = (o: unknown, status = 200, extra: Record<string, string> = {}, code?: string) => new Response(JSON.stringify(status >= 400 && o && typeof o === "object" ? { ...(o as object), code: code ?? CODES[status] ?? "error" } : o), { status, headers: { ...cors, "content-type": "application/json", ...extra } });
  if (origin && !ORIGINS.includes(origin)) return json({ error: "origin not allowed" }, 403, {}, "origin_not_allowed");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "GET only" }, 405, { Allow: "GET, OPTIONS" });
  if (limited(clientIp(req) || "?")) return json({ error: "rate limited, try again later" }, 429, { "Retry-After": "60" });
  try {
    const [r, nd] = await Promise.all([fetch(WS, { headers: { "User-Agent": "FarmFrame/1.0", Accept: "application/json" }, signal: AbortSignal.timeout(8000) }), getNodes()]);
    if (!r.ok) return json({ error: "upstream error" }, 502);
    const ws = (await r.json()) as O, now = Date.now(), out: unknown[] = [];
    const push = (x: O, storm: boolean) => {
      const exp = ms(x.Expiry), act = ms(x.Activation), mod = String(storm ? x.ActiveMissionTier ?? "" : x.Modifier ?? ""), m = /^VoidT(\d)$/.exec(mod);
      if (!m || exp == null || exp <= now) return;
      const node = String(x.Node ?? ""), n = nd[node], tier = TIERS[Number(m[1]) - 1];
      if (!tier) return;
      out.push({ id: (isO(x._id) && String(x._id.$oid)) || node + exp, node: n?.value ?? node, missionType: n?.type ?? "Unknown", enemy: n?.enemy ?? "Unknown", tier, tierNum: Number(m[1]), isStorm: storm, isHard: x.Hard === true, activation: act ? new Date(act).toISOString() : null, expiry: new Date(exp).toISOString(), expired: false });
    };
    for (const x of Array.isArray(ws.ActiveMissions) ? ws.ActiveMissions : []) if (isO(x)) push(x, false);
    for (const x of Array.isArray(ws.VoidStorms) ? ws.VoidStorms : []) if (isO(x)) push(x, true);
    return json(out, 200, { "cache-control": "public, max-age=60" });
  } catch (e) {
    if ((e as Error)?.name === "TimeoutError") return json({ error: "upstream took too long" }, 504);
    return json({ error: "upstream unreachable" }, 502, {}, "upstream_unreachable");
  }
});
