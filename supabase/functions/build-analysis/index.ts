// Supabase Edge Function: AI interpretation of a build. The Anthropic key lives only in Supabase secrets (ANTHROPIC_API_KEY).
// Only signed-in users may call it, and it only receives facts that the web app has already calculated.
// Only the FarmFrame site (and local dev) may call this from a browser. Add your own domain with the ALLOWED_ORIGINS secret (comma separated).
const ORIGINS = ["https://nawelm187.github.io", "http://localhost:5173", "http://localhost:4173", ...(Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(x => x.trim()).filter(Boolean)];
// Error contract (docs/ERRORES.md): the HTTP status is the number, and "code" is a stable word the app can rely on. "error" is a short fixed message.
const CODES: Record<number, string> = { 400: "bad_request", 401: "login_required", 403: "forbidden", 404: "not_found", 405: "method_not_allowed", 413: "payload_too_large", 415: "unsupported_media_type", 422: "invalid_request", 429: "rate_limited", 502: "upstream_error", 503: "service_unavailable", 504: "upstream_timeout" };
const SAFE = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" };
const corsFor = (origin: string | null) => ({ "Access-Control-Allow-Origin": origin && ORIGINS.includes(origin) ? origin : ORIGINS[0], "Vary": "Origin", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", ...SAFE });
// Daily quota (see public.ai_take in supabase/schema.sql). Both limits can be changed with secrets. If the quota cannot be checked the call is refused, never allowed.
const PER_USER = Number(Deno.env.get("AI_DAILY_PER_USER") ?? 10), GLOBAL = Number(Deno.env.get("AI_DAILY_GLOBAL") ?? 200);
// Reads the body without trusting content-length, and stops as soon as it is too big.
async function readLimited(req: Request, max: number): Promise<string | null> {
  const reader = req.body?.getReader(); if (!reader) return "";
  const dec = new TextDecoder(); let out = "", n = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; n += value.length; if (n > max) { await reader.cancel().catch(() => {}); return null; } out += dec.decode(value, { stream: true }); }
  return out + dec.decode();
}
// Languages the app can ask for. Anything else falls back to English, so the name that reaches the prompt is never free text from the client.
const LANGS: Record<string, string> = { en: "English", es: "Spanish", pt: "Portuguese", fr: "French", de: "German", it: "Italian", ru: "Russian", zh: "Simplified Chinese", ja: "Japanese" };
const SYSTEM = `You analyse a Warframe build for a player. You receive BUILD FACTS as JSON, already calculated by the application.
Rules, all mandatory:
- Use only the facts in the JSON. Never invent mods, stats, mechanics, weapons, drop rates or market prices.
- If the facts are not enough to judge something, say so plainly instead of guessing.
- Never contradict or recalculate the numbers given. Refer to them as they are.
- Everything you write is interpretation, not data. Do not claim certainty you do not have.
- Do not suggest specific mods, items or numbers that are not in the facts; you may say what kind of effect seems missing.
Write short plain text with these headings in capitals, skipping any you cannot support: STRENGTHS, WEAKNESSES, SURVIVABILITY, DAMAGE, ENERGY, SYNERGY, REDUNDANCY, IMPROVEMENT IDEAS. Keep it under 250 words.`;
const systemFor = (lang: string) => lang === "en" ? SYSTEM : `${SYSTEM}\nWrite the whole answer in ${LANGS[lang]}, translating the headings too. Keep item, mod, weapon and ability names exactly as the facts give them.`;
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin"), cors = corsFor(origin), json = (o: unknown, status: number, extra: Record<string, string> = {}, code?: string) => new Response(JSON.stringify(status >= 400 && o && typeof o === "object" ? { ...(o as object), code: code ?? CODES[status] ?? "error" } : o), { status, headers: { ...cors, "content-type": "application/json", ...extra } });
  if (origin && !ORIGINS.includes(origin)) return json({ error: "origin not allowed" }, 403, {}, "origin_not_allowed");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405, { Allow: "POST, OPTIONS" });
  const auth = req.headers.get("authorization") ?? "", apikey = req.headers.get("apikey") ?? "", base = Deno.env.get("SUPABASE_URL");
  const who = await fetch(`${base}/auth/v1/user`, { headers: { Authorization: auth, apikey }, signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!who || !who.ok) return json({ error: "login required" }, 401);
  const user = await who.json().catch(() => null) as { id?: string; is_anonymous?: boolean } | null;
  if (!user?.id || user.is_anonymous) return json({ error: "login required" }, 401);
  const key = Deno.env.get("ANTHROPIC_API_KEY"), service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) return json({ error: "AI is not configured on the server" }, 503);
  if (!service) return json({ error: "quota service unavailable" }, 503);
  // 415 before reading anything: the body must be declared as JSON. 413 as soon as it passes the cap.
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return json({ error: "send application/json" }, 415);
  const raw = await readLimited(req, 40000); if (raw === null) return json({ error: "request too large" }, 413);
  let body: { build?: unknown; lang?: unknown } | null = null; try { body = JSON.parse(raw); } catch { return json({ error: "body is not valid JSON" }, 400); }
  const facts = JSON.stringify(body?.build ?? null), lang = typeof body?.lang === "string" && Object.prototype.hasOwnProperty.call(LANGS, body.lang) ? body.lang as string : "en";
  if (facts.length > 20000) return json({ error: "request too large" }, 413);
  if (!body?.build || typeof body.build !== "object" || Array.isArray(body.build)) return json({ error: "build must be a JSON object" }, 422, {}, "invalid_build");
  // The quota is spent only for a valid request, and before the paid call.
  const q = await fetch(`${base}/rest/v1/rpc/ai_take`, { method: "POST", headers: { apikey: service, Authorization: `Bearer ${service}`, "content-type": "application/json" }, body: JSON.stringify({ p_user: user.id, p_user_max: PER_USER, p_global_max: GLOBAL }), signal: AbortSignal.timeout(8000) }).catch(() => null);
  if (!q || !q.ok) return json({ error: "quota service unavailable" }, 503);
  if ((await q.json().catch(() => false)) !== true) return json({ error: "daily limit reached, try again tomorrow" }, 429, { "Retry-After": "3600" }, "daily_limit_reached");
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, signal: AbortSignal.timeout(40000),
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 800, system: systemFor(lang), messages: [{ role: "user", content: `BUILD FACTS (JSON):\n${facts}` }] }),
    });
    if (!r.ok) return json({ error: "AI service error" }, 502);
    const d = await r.json(), text = (d.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
    return json({ text }, 200);
  } catch (e) { return (e as Error)?.name === "TimeoutError" ? json({ error: "AI service took too long" }, 504) : json({ error: "AI service unreachable" }, 502, {}, "upstream_unreachable"); }
});
