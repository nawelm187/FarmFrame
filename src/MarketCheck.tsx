import { useState } from "react";
import { fetchAny, type Stat } from "./lib/market";
import { Plat } from "./Money";
import { useT } from "./i18n";
import { rich } from "./lib/rich";
type S = { st: Stat; at: number } | "loading" | "error" | "none" | null;
/** On-demand market lookup (dynamic data from warframe.market, community-run). Nothing is shown unless the response is complete. */
export default function MarketCheck({ name, alt }: { name: string; alt?: string }) {
  const tr = useT(), [s, setS] = useState<S>(null);
  const run = async () => {
    setS("loading"); const c = new AbortController(), timer = setTimeout(() => c.abort(), 15_000);
    try { const st = await fetchAny(alt ? [name, alt] : [name], c.signal); setS(st ? { st, at: Date.now() } : "none"); }
    catch { setS("error"); } finally { clearTimeout(timer); }
  };
  return (<div className="muted" style={{ marginTop: ".3rem" }}>
    {(s === null || s === "error" || s === "none") && <button className="btn" onClick={() => void run()}>{tr("mkCheckBtn")}</button>}
    {s === "loading" && <span>{tr("mkCheckingMkt")}</span>}
    {s === "error" && <div>{tr("mkCheckErr")}</div>}
    {s === "none" && <div>{tr("mkCheckNone")}</div>}
    {s && typeof s === "object" && <div><b>{tr("mkMarketValue")}</b> {rich(tr("mkCheckRest", { vol: s.st.volume, time: new Date(s.at).toLocaleTimeString() }), { median: <Plat n={s.st.median} />, lo: <Plat n={s.st.min} />, hi: <Plat n={s.st.max} /> })}</div>}
  </div>);
}
