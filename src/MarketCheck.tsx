import { useState } from "react";
import { MARKET_URL, parseStats, slugOf, type Stat } from "./lib/market";
type S = { st: Stat; at: number } | "loading" | "error" | "none" | null;
/** On-demand market lookup (dynamic data from warframe.market, community-run). Nothing is shown unless the response is complete. */
export default function MarketCheck({ name }: { name: string }) {
  const [s, setS] = useState<S>(null);
  const run = async () => {
    setS("loading"); const c = new AbortController(), t = setTimeout(() => c.abort(), 15_000);
    try { const r = await fetch(MARKET_URL(slugOf(name)), { signal: c.signal }); if (!r.ok) throw new Error(String(r.status)); const st = parseStats(await r.json()); setS(st ? { st, at: Date.now() } : "none"); }
    catch { setS("error"); } finally { clearTimeout(t); }
  };
  return (<div className="muted" style={{ marginTop: ".3rem" }}>
    {(s === null || s === "error" || s === "none") && <button className="btn" onClick={() => void run()}>Check market price</button>}
    {s === "loading" && <span>Checking market…</span>}
    {s === "error" && <div>Market data unavailable (the service may be down or blocked by the browser).</div>}
    {s === "none" && <div>No market data found for this item.</div>}
    {s && typeof s === "object" && <div><b>Market value</b> (dynamic): median {s.st.median} platinum · low {s.st.min} · high {s.st.max} · {s.st.volume} traded in the last bucket. warframe.market, fetched {new Date(s.at).toLocaleTimeString()}. This is not a farming value.</div>}
  </div>);
}
