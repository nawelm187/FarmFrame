import { useEffect, useState } from "react";
import type { Entity } from "./lib/catalog";
import { fetchStat, type Stat } from "./lib/market";
import { Plat } from "./Money";
type V = { r0: Stat | null; rm: Stat | null; at: number } | "loading" | "error";
const line = (s: Stat) => <><Plat n={s.median} /> median (low <Plat n={s.min} />, high <Plat n={s.max} />, {s.volume} traded)</>;
/** Live market price of a mod, unranked and at max rank when it has ranks. */
export default function ModPrice({ e }: { e: Entity }) {
  const [v, setV] = useState<V>("loading");
  useEffect(() => {
    let dead = false; setV("loading");
    void (async () => {
      try { const r0 = await fetchStat(e.name, undefined, 0); await new Promise(r => setTimeout(r, 400)); const rm = e.maxRank ? await fetchStat(e.name, undefined, e.maxRank) : null; if (!dead) setV({ r0, rm, at: Date.now() }); }
      catch { if (!dead) setV("error"); }
    })();
    return () => { dead = true; };
  }, [e.name, e.maxRank]);
  return (<section className="panel" style={{ margin: ".5rem 0 1rem" }} aria-label="Mod market price">
    <div className="row"><h3>Market price</h3><span className="tag UNAVAILABLE">Market, live</span></div>
    {v === "loading" && <div aria-hidden="true"><div className="sk" style={{ width: "50%" }} /></div>}
    {v === "error" && <p className="muted">Market data unavailable right now.</p>}
    {typeof v === "object" && !v.r0 && !v.rm && <p className="muted">This mod is not listed on the market.</p>}
    {typeof v === "object" && (v.r0 || v.rm) && <>
      {v.r0 && <div><b>Rank 0:</b> {line(v.r0)}</div>}{v.rm && e.maxRank ? <div><b>Max rank ({e.maxRank}):</b> {line(v.rm)}</div> : null}
      <div className="muted">warframe.market, fetched {new Date(v.at).toLocaleTimeString()}. Market value, not a farming recommendation.</div></>}
  </section>);
}
