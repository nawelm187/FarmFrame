import { useEffect, useState } from "react";
import type { Entity } from "./lib/catalog";
import { fetchStat, sumParts, type Stat } from "./lib/market";
import { Plat } from "./Money";
import { useT } from "./i18n";
import { rich } from "./lib/rich";
type St = "loading" | "error" | "none" | { st: Stat; at: number };
const memo = new Map<string, { st: Stat | null; at: number }>();
/** Price of the whole Prime set (live market), with an optional comparison against buying the parts one by one. */
export default function SetPrice({ e }: { e: Entity }) {
  const t = useT();
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
  return (<section className="panel" style={{ margin: ".5rem 0 1rem" }} aria-label={t("mkSetAria")}>
    <div className="row"><h3>{t("mkSetTitle")}</h3><span className="tag UNAVAILABLE">{t("prtMarketLive")}</span></div>
    {set === "loading" && <div aria-hidden="true"><div className="sk" style={{ width: "40%" }} /></div>}
    {set === "error" && <p className="muted">{t("relMarketDown")}</p>}
    {set === "none" && <p className="muted">{t("mkSetNone")}</p>}
    {typeof set === "object" && <><div className="big"><b><Plat n={set.st.median} size={20} /></b> <span className="muted">{t("mkSetMedian")}</span></div>
      <div className="muted">{rich(t("mkSetStats", { vol: set.st.volume, time: new Date(set.at).toLocaleTimeString() }), { lo: <Plat n={set.st.min} />, hi: <Plat n={set.st.max} /> })}</div></>}
    {typeof set === "object" && priced.length > 0 && <div style={{ marginTop: ".5rem" }}>
      {(parts === null || parts === "error") && <button className="btn" onClick={() => void run()}>{t("mkCompare")}</button>}
      {parts === "loading" && <span className="muted">{t("mkChecking", { n: priced.length })}</span>}
      {parts === "error" && <div className="muted">{t("mkPartsDown")}</div>}
      {sp && setMedian != null && <p className="muted">{rich(t(sp.missing.length ? "mkPartsTotalMissing" : "mkPartsTotal", { list: sp.missing.join(", ") }), { total: <b><Plat n={sp.total} /></b> })} {sp.missing.length ? "" : sp.total > setMedian ? rich(t("mkSetCheaper"), { d: <Plat n={+(sp.total - setMedian).toFixed(1)} /> }) : sp.total < setMedian ? rich(t("mkPartsCheaper"), { d: <Plat n={+(setMedian - sp.total).toFixed(1)} /> }) : t("mkSame")} {t("mkNotRec")}</p>}
    </div>}
  </section>);
}
