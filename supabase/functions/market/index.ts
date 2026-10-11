// Supabase Edge Function: server-side proxy for warframe.market item statistics.
// The browser cannot call warframe.market directly; this runs on the server and adds CORS headers.
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "apikey, content-type, authorization", "Access-Control-Allow-Methods": "GET, OPTIONS" };
const json = (o: unknown, status: number) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "content-type": "application/json" } });
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  // Only a plain item slug is accepted and the host is fixed, so this cannot be used to reach other addresses.
  if (!/^[a-z0-9_]{3,80}$/.test(slug)) return json({ error: "bad slug" }, 400);
  try {
    const r = await fetch(`https://api.warframe.market/v1/items/${slug}/statistics`, { headers: { Accept: "application/json", Platform: "pc", Language: "en", "User-Agent": "FarmFrame/1.0" }, signal: AbortSignal.timeout(8000) });
    // Upstream errors are mapped to short, fixed messages so no upstream page or trace reaches the browser.
    if (r.status === 404) return json({ error: "item not found" }, 404);
    if (r.status === 429) return json({ error: "rate limited, try again later" }, 429);
    if (!r.ok) return json({ error: "upstream error" }, 502);
    const text = await r.text();
    try { JSON.parse(text); } catch { return json({ error: "upstream sent invalid data" }, 502); }
    return new Response(text, { status: 200, headers: { ...CORS, "content-type": "application/json", "cache-control": "public, max-age=300" } });
  } catch {
    return json({ error: "upstream unreachable" }, 502);
  }
});
