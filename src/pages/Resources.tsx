import { useDeferredValue, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ItemArt, { bundled } from "../ItemArt";
import PageArt from "../PageArt";
import { useMany } from "../lib/data";
import { aboutText, FILES, MANUAL, parseThings, pct, resAlt, resUrl, RES_SRC, whereFrom, type Thing } from "../lib/resources";
import { Badge, Prov, Unavailable } from "./parts";
import { tp, useT } from "../i18n";
const own = (t: Thing) => { const b = bundled(t.name); return b ? "bundled:" + b : t.image; };
function Card({ t }: { t: Thing }) {
  const tr = useT(), hint = whereFrom(t.description), about = aboutText(t.description), manual = MANUAL[t.name];
  const none = !t.drops.length && !hint.length && !manual;
  return (<details className="panel enemy"><summary><span className="row"><ItemArt file={own(t)} size={48} /><b>{t.name}</b> <span className="muted">{t.type}</span></span>
    <span className="muted stats">{t.drops.length ? tp("rsDrops", t.drops.length) : hint.length || manual ? tr("rsListed") : tr("rsNoSrc")}{t.tradable === false ? ` · ${tr("rsNotTradable")}` : ""}</span>
    {about && <span className="muted blurb">{about}</span>}
    {!t.drops.length && (hint[0] || manual) && <span className="blurb where1"><b>{tr("rsWhereLbl")}</b> {hint[0] || manual}</span>}</summary>
    {about && <p>{about}</p>}
    {t.drops.length > 0 ? <><h4>{tr("whereToFarm")}</h4><ul className="sub">{t.drops.slice(0, 12).map((d, i) => <li key={i}>{d.location} <span className="muted">{[d.type, d.rarity, pct(d.chance) != null ? pct(d.chance) + "%" : ""].filter(Boolean).join(" · ")}</span></li>)}</ul></>
      : hint.length || manual ? <><h4>{tr("prtWhere")}</h4><ul className="sub">{hint.map(h => <li key={h}>{h}</li>)}{manual && <li>{manual} <span className="muted">{tr("rsByHand")}</span></li>}</ul></>
      : <p className="muted">{none ? tr("rsNoDrops") : ""}</p>}
    <Link to={`/farm/${encodeURIComponent(t.name)}`}>{tr("rsSearchOfficial")}</Link>
  </details>);
}
/** Resources and items (Ferrite, Orokin Cell, Forma and so on): picture, what it is and where it drops. */
export default function Resources() {
  const tr = useT(), [sp, setSp] = useSearchParams(), tab = sp.get("t") === "items" ? "items" : "resources", q = sp.get("q") ?? "", kind = sp.get("k") ?? "", dq = useDeferredValue(q), [more, setMore] = useState(1);
  const f = FILES[tab], [r] = useMany([{ id: "things:" + tab, file: "", url: resUrl(f), alt: resAlt(f), src: RES_SRC, win: 6 * 3_600_000 }]);
  const all = parseThings(r.rec?.data), set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); if (k === "t") { n.delete("k"); } setSp(n, { replace: true }); setMore(1); };
  const head = <><h1><PageArt name="Resources" size={36} />{tr("rsTitle")}</h1>
    <div className="chips" role="tablist" aria-label={tr("rsKind")}><button role="tab" aria-selected={tab === "resources"} className={"relicchip" + (tab === "resources" ? " own" : "")} onClick={() => set("t", "")}>{tr("resources")}</button><button role="tab" aria-selected={tab === "items"} className={"relicchip" + (tab === "items" ? " own" : "")} onClick={() => set("t", "items")}>{tr("mrSecItems")}</button></div></>;
  if (!all) return <>{head}<Unavailable title={tr("resources")} art="Resources" status={r.status} why={r.status === "LOADING" ? tr("rsLoading") : tr("noVerified")} rec={r.rec} /></>;
  const l = dq.trim().toLowerCase(), kinds = [...new Set(all.map(t => t.type))].sort(), list = all.filter(t => (!kind || t.type === kind) && (!l || t.name.toLowerCase().includes(l))), shown = list.slice(0, 40 * more);
  return (<>{head}<p className="lead">{tr(tab === "items" ? "rsLeadItems" : "rsLeadRes", { n: all.length })} <Badge s={r.status} /></p>
    <div className="bar"><input aria-label={tr("psFilter")} placeholder={tr(tab === "items" ? "rsFilterItems" : "rsFilterRes")} value={q} onChange={e => set("q", e.target.value)} />
      <select aria-label={tr("fmType")} value={kind} onChange={e => set("k", e.target.value)}><option value="">{tr("rsAllTypes")}</option>{kinds.map(k => <option key={k}>{k}</option>)}</select></div>
    {shown.map(t => <Card key={t.name} t={t} />)}{!list.length && <p className="muted">{tr("rsNothing")}</p>}
    {list.length > shown.length && <button className="btn" onClick={() => setMore(more + 1)}>{tr("psMore", { n: list.length - shown.length })}</button>}
    <p className="muted">{tr("rsFoot")}</p><Prov rec={r.rec} /></>);
}
