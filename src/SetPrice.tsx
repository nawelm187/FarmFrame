import { useEffect, useState } from "react";
import type { Entity } from "./lib/catalog";
import { fetchStat, sumParts, type Stat } from "./lib/market";
import { Plat } from "./Money";
type St = "loading" | "error" | "none" | { st: Stat; at: number };
const memo = new Map<string, { st: Stat | null; at: number }>();
/** Price of the whole Prime set (live market), with an optional comparison against buying the parts one by one. */
export default function SetPrice({ e }: { e: Entity }) {
  const [set, setSet] = useState<St>("loading");
  const [parts, setParts] = useState<Record<string, number | null> | "loading" | "error" | null>(null);
  useEffect(() => {
    let dead = false; const hit = memo.get(e.name);
    if (hit) { setSet(hit.st ? { st: hit.st, at: hit.at } : "none"); return; }
    setSet("loading");
    fetchStat(`${e.name} Set`).then(st => { const at = Date.now(); memo.set(e.name, { st, at }); if (!dead) setSet(st ? { st, at } : "none"); }).catch(() => { if (!dead) setSet("error"); });
    return () => { dead = true; };
  }, [e.name]);
  const priced = e.components.filter(c => c.ducats != null);
  const run = async () => {
    setParts("loading"); const out: Record<string, number | null> = {};
    try { for (const c of priced) { const st = await fetchStat(`${e.name} ${c.name}`); out[c.name] = st ? st.median : null; await new Promise(r => setTimeout(r, 400)); } setParts(out); } catch { setParts("error"); }
  };
  const sp = parts && typeof parts === "object" ? sumParts(priced, parts) : null;
  const setMedian = typeof set === "object" ? set.st.median : null;
  return (<section className="panel" style={{ margin: ".5rem 0 1rem" }} aria-label="Set price">
    <div className="row"><h3>Full set price</h3><span className="tag UNAVAILABLE">Market, live</span></div>
    {set === "loading" && <div aria-hidden="true"><div className="sk" style={{ width: "40%" }} /></div>}
    {set === "error" && <p className="muted">Market data unavailable right now.</p>}
    {set === "none" && <p className="muted">This set is not listed on the market.</p>}
    {typeof set === "object" && <><div className="big"><b><Plat n={set.st.median} size={20} /></b> <span className="muted">median for the whole set</span></div>
      <div className="muted">Low {set.st.min} · high {set.st.max} · {set.st.volume} traded in the last bucket · warframe.market, fetched {new Date(set.at).toLocaleTimeString()}</div></>}
    {typeof set === "object" && priced.length > 0 && <div style={{ marginTop: ".5rem" }}>
      {(parts === null || parts === "error") && <button className="btn" onClick={() => void run()}>Compare with buying the parts</button>}
      {parts === "loading" && <span className="muted">Checking {priced.length} part prices…</span>}
      {parts === "error" && <div className="muted">Part prices unavailable right now.</div>}
      {sp && setMedian != null && <p className="muted">Parts bought separately: about <b><Plat n={sp.total} /></b> (sum of medians{sp.missing.length ? `; no price for ${sp.missing.join(", ")}, so this is incomplete` : ""}). {sp.missing.length ? "" : sp.total > setMedian ? <>The set is about <Plat n={+(sp.total - setMedian).toFixed(1)} /> cheaper.</> : sp.total < setMedian ? <>The parts are about <Plat n={+(setMedian - sp.total).toFixed(1)} /> cheaper.</> : "Both cost the same."} Market value, not a farming recommendation.</p>}
    </div>}
  </section>);
}
