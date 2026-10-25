import { useDeferredValue, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Pic } from "../ItemArt";
import PageArt from "../PageArt";
import type { Cat, Component, Entity } from "../lib/catalog";
import { partTradable } from "../lib/trade";
import { useCatalogs } from "../lib/useCatalog";
import { Unavailable } from "./parts";
import { useT } from "../i18n";
import { CAT_MANY } from "../lib/catLabel";
interface Row { title: string; owner: Entity; cat: Cat; c: Component; link: string; prime: boolean }
const KINDS: Cat[] = ["warframe", "weapon", "companion", "archwing"];
/** Search every part and blueprint of warframes, weapons, companions and archwings. Market prices are only offered for Prime parts. */
export default function Parts() {
  const t = useT(), cat = useCatalogs(["warframe", "weapon", "companion", "archwing"]), [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", kind = sp.get("k") ?? "", prime = sp.get("p") === "1", dq = useDeferredValue(q), [more, setMore] = useState(1);
  const rows = useMemo(() => { const out: Row[] = [];
    for (const k of KINDS) for (const e of cat[k]?.items ?? []) for (const c of e.components) {
      const bp = c.name === "Blueprint", title = bp ? `${e.name} Blueprint` : `${e.name} ${c.name}`;
      out.push({ title, owner: e, cat: k, c, link: `/item/${encodeURIComponent(bp ? title : title + " Blueprint")}`, prime: e.isPrime }); }
    return out; }, [cat.warframe?.items, cat.weapon?.items, cat.companion?.items, cat.archwing?.items]);
  const loading = KINDS.some(k => !cat[k]?.items) && !rows.length;
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); setMore(1); };
  const words = dq.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = rows.filter(r => (!kind || r.cat === kind) && (!prime || r.prime) && words.every(w => r.title.toLowerCase().includes(w)));
  if (loading) return <><h1><PageArt name="Parts" size={36} />{t("parts")}</h1><Unavailable title={t("parts")} art="Parts" status={cat.warframe?.status ?? "LOADING"} why={t("psLoading")} rec={cat.warframe?.rec} /></>;
  if (!rows.length) return <><h1><PageArt name="Parts" size={36} />{t("parts")}</h1><Unavailable title={t("parts")} art="Parts" status="ERROR" why={t("psEmpty")} rec={cat.warframe?.rec} /></>;
  return (<><h1><PageArt name="Parts" size={36} />{t("parts")}</h1><p className="lead">{t("psLead")}</p>
    <div className="bar"><input aria-label={t("psSearchAria")} placeholder={t("psSearchPh")} value={q} onChange={e => set("q", e.target.value)} /></div>
    <div className="chips" role="group" aria-label={t("psFilter")}><button className={"relicchip" + (!kind ? " own" : "")} onClick={() => set("k", "")}>{t("psAll")}</button>{KINDS.map(k => <button key={k} className={"relicchip" + (kind === k ? " own" : "")} onClick={() => set("k", kind === k ? "" : k)}>{t(CAT_MANY[k])}</button>)}
      <button className={"relicchip" + (prime ? " own" : "")} aria-pressed={prime} onClick={() => set("p", prime ? "" : "1")}>{t("psPrimeOnly")}</button></div>
    {!words.length && !kind && !prime ? <p className="muted">{t("psLoaded", { n: rows.length })}</p> : <>
      <div className="rowcards">{list.slice(0, 40 * more).map(r => { const trd = partTradable(r.owner, r.c);
        return (<article className="rowcard" key={r.link}><Pic name={r.title} size={48} />
          <div className="rcbody"><div className="rchead"><Link to={r.link}><b>{r.title}</b></Link>{r.prime && <span className="fchip gold">{t("psPrime")}</span>}{trd != null && r.prime && <span className={"tag " + (trd ? "FRESH" : "UNAVAILABLE")}>{trd ? t("prtTradable") : t("prtNotTradable")}</span>}</div>
            <div className="muted">{[r.c.ducats != null ? t("psDucats", { n: r.c.ducats }) : "", r.prime ? "" : t("psNoPrice")].filter(Boolean).join(" · ") || t("prtPartOf", { name: r.owner.name })}</div></div>
          <Link className="btn" to={`/farm/${encodeURIComponent(r.title)}`}>{t("psWhere")}</Link></article>); })}
        {!list.length && <p className="muted">{t("psNone")}</p>}</div>
      {list.length > 40 * more && <button className="btn" onClick={() => setMore(more + 1)}>{t("psMore", { n: list.length - 40 * more })}</button>}</>}
    <p className="muted">{t("psFoot")}</p></>);
}
