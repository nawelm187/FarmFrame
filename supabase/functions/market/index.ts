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
    const r = await fetch(`https://api.warframe.market/v1/items/${slug}/statistics`, { headers: { Accept: "application/json", Platform: "pc", Language: "en", "User-Agent": "FarmFrame/1.0" } });
    return new Response(await r.text(), { status: r.status, headers: { ...CORS, "content-type": "application/json", "cache-control": "public, max-age=300" } });
  } catch {
    return json({ error: "upstream unreachable" }, 502);
  }
});
