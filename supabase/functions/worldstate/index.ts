// Supabase Edge Function: fallback for live fissures straight from Digital Extremes' public world state.
// Used only when the community API serves old data. Hosts are fixed; the browser sends no address, so it cannot be used to reach other sites.
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "apikey, content-type, authorization", "Access-Control-Allow-Methods": "GET, OPTIONS" };
const json = (o: unknown, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json", ...extra } });
const WS = "https://content.warframe.com/dynamic/worldState.php";
const NODES = "https://raw.githubusercontent.com/WFCD/warframe-worldstate-data/master/data/solNodes.json";
const TIERS = ["Lith", "Meso", "Neo", "Axi", "Requiem", "Omnia"];
type O = Record<string, unknown>;
const isO = (x: unknown): x is O => !!x && typeof x === "object" && !Array.isArray(x);
const ms = (d: unknown): number | null => { const v = isO(d) && isO(d.$date) ? d.$date.$numberLong : null; const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN; return Number.isFinite(n) ? n : null; };
let nodes: Record<string, { value?: string; enemy?: string; type?: string }> | null = null, nodesAt = 0;
async function getNodes() {
  if (nodes && Date.now() - nodesAt < 6 * 3_600_000) return nodes;
  try { const r = await fetch(NODES); if (r.ok) { nodes = await r.json(); nodesAt = Date.now(); } } catch { /* keep the old copy if any */ }
  return nodes ?? {};
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const [r, nd] = await Promise.all([fetch(WS, { headers: { "User-Agent": "FarmFrame/1.0", Accept: "application/json" } }), getNodes()]);
    if (!r.ok) return json({ error: "upstream " + r.status }, 502);
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
  } catch {
    return json({ error: "upstream unreachable" }, 502);
  }
});
