// Supabase Edge Function: AI interpretation of a build. The Anthropic key lives only in Supabase secrets (ANTHROPIC_API_KEY).
// Only signed-in users may call it, and it only receives facts that the web app has already calculated.
// Only the FarmFrame site (and local dev) may call this from a browser. Add your own domain with the ALLOWED_ORIGINS secret (comma separated).
const ORIGINS = ["https://nawelm187.github.io", "http://localhost:5173", "http://localhost:4173", ...(Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(x => x.trim()).filter(Boolean)];
const corsFor = (origin: string | null) => ({ "Access-Control-Allow-Origin": origin && ORIGINS.includes(origin) ? origin : ORIGINS[0], "Vary": "Origin", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" });
let CORS = corsFor(null);
const json = (o: unknown, status: number) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json" } });
const SYSTEM = `You analyse a Warframe build for a player. You receive BUILD FACTS as JSON, already calculated by the application.
Rules, all mandatory:
- Use only the facts in the JSON. Never invent mods, stats, mechanics, weapons, drop rates or market prices.
- If the facts are not enough to judge something, say so plainly instead of guessing.
- Never contradict or recalculate the numbers given. Refer to them as they are.
- Everything you write is interpretation, not data. Do not claim certainty you do not have.
- Do not suggest specific mods, items or numbers that are not in the facts; you may say what kind of effect seems missing.
Write short plain text with these headings in capitals, skipping any you cannot support: STRENGTHS, WEAKNESSES, SURVIVABILITY, DAMAGE, ENERGY, SYNERGY, REDUNDANCY, IMPROVEMENT IDEAS. Keep it under 250 words.`;
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin"); CORS = corsFor(origin);
  if (origin && !ORIGINS.includes(origin)) return json({ error: "origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const auth = req.headers.get("authorization") ?? "", apikey = req.headers.get("apikey") ?? "";
  const who = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, { headers: { Authorization: auth, apikey }, signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!who || !who.ok) return json({ error: "login required" }, 401);
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "AI is not configured on the server" }, 503);
  if (Number(req.headers.get("content-length") ?? 0) > 40000) return json({ error: "bad request" }, 400);
  const body = await req.json().catch(() => null), facts = JSON.stringify(body?.build ?? null);
  if (!body?.build || facts.length > 20000) return json({ error: "bad request" }, 400);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, signal: AbortSignal.timeout(40000),
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 800, system: SYSTEM, messages: [{ role: "user", content: `BUILD FACTS (JSON):\n${facts}` }] }),
    });
    if (!r.ok) return json({ error: "AI service error" }, 502);
    const d = await r.json(), text = (d.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
    return json({ text }, 200);
  } catch { return json({ error: "AI service unreachable" }, 502); }
});
