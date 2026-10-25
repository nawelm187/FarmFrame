import { useEffect, useState } from "react";
import type { Entity } from "./lib/catalog";
import { fetchStat, type Stat } from "./lib/market";
import { Plat } from "./Money";
import { useT } from "./i18n";
import { rich } from "./lib/rich";
type V = { r0: Stat | null; rm: Stat | null; at: number } | "loading" | "error";
const line = (s: Stat, t: ReturnType<typeof useT>) => <>{rich(t("mkLine", { vol: s.volume }), { median: <Plat n={s.median} />, lo: <Plat n={s.min} />, hi: <Plat n={s.max} /> })}</>;
/** Live market price of a mod, unranked and at max rank when it has ranks. */
export default function ModPrice({ e }: { e: Entity }) {
  const t = useT(), [v, setV] = useState<V>("loading");
  useEffect(() => {
    if (e.tradable === false) return;
    let dead = false; setV("loading");
    void (async () => {
      try { const r0 = await fetchStat(e.name, undefined, 0); await new Promise(r => setTimeout(r, 400)); const rm = e.maxRank ? await fetchStat(e.name, undefined, e.maxRank) : null; if (!dead) setV({ r0, rm, at: Date.now() }); }
      catch { if (!dead) setV("error"); }
    })();
    return () => { dead = true; };
  }, [e.name, e.maxRank, e.tradable]);
  return (<section className="panel" style={{ margin: ".5rem 0 1rem" }} aria-label={t("mkModAria")}>
    <div className="row"><h3>{t("mkTitle")}</h3><span className="tag UNAVAILABLE">{t("prtMarketLive")}</span></div>
    {e.tradable === false && <p className="muted">{t("mkModNoTrade")}</p>}
    {e.tradable !== false && v === "loading" && <div aria-hidden="true"><div className="sk" style={{ width: "50%" }} /></div>}
    {e.tradable !== false && v === "error" && <p className="muted">{t("relMarketDown")}</p>}
    {e.tradable !== false && typeof v === "object" && !v.r0 && !v.rm && <p className="muted">{t("mkModNone")}</p>}
    {e.tradable !== false && typeof v === "object" && (v.r0 || v.rm) && <>
      {v.r0 && <div><b>{t("mkRank0")}</b> {line(v.r0, t)}</div>}{v.rm && e.maxRank ? <div><b>{t("mkMaxRank", { n: e.maxRank })}</b> {line(v.rm, t)}</div> : null}
      <div className="muted">{t("mkFetched", { time: new Date(v.at).toLocaleTimeString() })}</div></>}
  </section>);
}
