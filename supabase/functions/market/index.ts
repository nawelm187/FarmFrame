// Supabase Edge Function: server-side proxy for warframe.market item statistics.
// The browser cannot call warframe.market directly; this runs on the server and adds CORS headers.
// Hardening: only the FarmFrame site may call it from a browser (add your domain with the ALLOWED_ORIGINS secret, comma separated),
// a fixed upstream host, a strict slug, a best-effort limit per address, fixed error messages, no logging of requests.
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
// warframe.market allows about 3 requests per second per address, and every visitor leaves through the same address here, so the limit that matters is the total.
// A 5 minute copy answers repeats without asking upstream, and a shared bucket (2 per second, best effort per instance) keeps the rest under their limit.
const cache = new Map<string, { at: number; text: string }>(), TTL = 5 * 60_000;
let tokens = 2, refilled = Date.now();
const takeUpstream = () => { const now = Date.now(); tokens = Math.min(2, tokens + (now - refilled) / 1000 * 2); refilled = now; if (tokens >= 1) { tokens -= 1; return true; } return false; };
const remember = (slug: string, text: string) => { cache.set(slug, { at: Date.now(), text }); if (cache.size > 500) cache.delete(cache.keys().next().value as string); };
const clientIp = (req: Request) => req.headers.get("cf-connecting-ip") ?? (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ?? "?";
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin"), cors = corsFor(origin), json = (o: unknown, status: number, extra: Record<string, string> = {}, code?: string) => new Response(JSON.stringify(status >= 400 && o && typeof o === "object" ? { ...(o as object), code: code ?? CODES[status] ?? "error" } : o), { status, headers: { ...cors, "content-type": "application/json", ...extra } });
  if (origin && !ORIGINS.includes(origin)) return json({ error: "origin not allowed" }, 403, {}, "origin_not_allowed");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "GET only" }, 405, { Allow: "GET, OPTIONS" });
  if (limited(clientIp(req) || "?")) return json({ error: "rate limited, try again later" }, 429, { "Retry-After": "60" });
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  // Only a plain item slug is accepted and the host is fixed, so this cannot be used to reach other addresses.
  if (!/^[a-z0-9_]{3,80}$/.test(slug)) return json({ error: "bad slug" }, 400, {}, "bad_slug");
  const hit = cache.get(slug), reply = (text: string) => new Response(text, { status: 200, headers: { ...cors, "content-type": "application/json", "cache-control": "public, max-age=300" } });
  if (hit && Date.now() - hit.at < TTL) return reply(hit.text);
  if (!takeUpstream()) return hit ? reply(hit.text) : json({ error: "busy, try again in a moment" }, 429, { "Retry-After": "2" });
  try {
    const r = await fetch(`https://api.warframe.market/v1/items/${slug}/statistics`, { headers: { Accept: "application/json", Platform: "pc", Language: "en", "User-Agent": "FarmFrame/1.0" }, signal: AbortSignal.timeout(8000) });
    // Upstream errors are mapped to short, fixed messages so no upstream page or trace reaches the browser.
    if (r.status === 404) return json({ error: "item not found" }, 404);
    if (r.status === 429) return json({ error: "rate limited, try again later" }, 429);
    if (!r.ok) return json({ error: "upstream error" }, 502);
    const text = await r.text();
    if (text.length > 2_000_000) return json({ error: "upstream sent too much data" }, 502);
    try { JSON.parse(text); } catch { return json({ error: "upstream sent invalid data" }, 502); }
    remember(slug, text); return reply(text);
  } catch (e) {
    return (e as Error)?.name === "TimeoutError" ? json({ error: "upstream took too long" }, 504) : json({ error: "upstream unreachable" }, 502, {}, "upstream_unreachable");
  }
});
