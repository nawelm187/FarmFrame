import { useDeferredValue } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMany } from "../lib/data";
import { FIND, collect, parseRelics, query } from "../lib/drops";
import ItemArt, { useImages } from "../ItemArt";
import RelicCard from "../RelicCard";
import { Unavailable } from "./parts";
import { useT } from "../i18n";
const items = [...FIND.map(f => ({ id: f.id, file: f.file })), { id: "relics", file: "relics.json" }];
export default function Finder() {
  const t = useT(), img = useImages();
  const [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", dq = useDeferredValue(q), l = dq.trim().toLowerCase();
  const res = useMany(items);
  const { rows, gaps, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status })));
  const relics = parseRelics(res[res.length - 1].rec?.data) ?? [];
  const m = l ? query(rows, l) : [], rl = l ? relics.filter(r => (r.st.Intact ?? []).some(x => x.itemName.toLowerCase().includes(l))).slice(0, 10) : [];
  return (<><h1>{t("resourceFinder")}</h1>
    <p className="lead">{t("fdLead")}</p>
    <div className="bar"><input aria-label={t("fdInputAria")} placeholder={t("fdInputPh")} value={q} onChange={e => setSp({ q: e.target.value }, { replace: true })} /></div>
    <p className="muted">{t("fdLoaded", { ok, total: FIND.length })}{gaps.length ? " · " + t("fdNotShown", { list: gaps.join("; ") }) : ""}</p>
    {l && ok > 0 && <p><Link to={`/farm/${encodeURIComponent(q.trim())}`}>{t("fdRanked", { q: q.trim() })}</Link></p>}
    {!ok && <Unavailable title={t("fmDropTables")} art="Drop tables" status={res.some(x => x.status === "LOADING") ? "LOADING" : "ERROR"} rec={res.find(x => x.rec?.err)?.rec} why={t("fdNoTables")} />}
    {!l && ok > 0 && <p className="muted">{t("fdPrompt")}</p>}
    {l && ok > 0 && !m.length && <p className="muted">{t("fdNoDrop", { q })}</p>}
    {rl.length > 0 && <><h2>{t("fdRelicsWith", { q: q.trim() })}</h2><p className="muted">{t("fdRelicsNote")}</p><div className="relgrid">{rl.map(r => <RelicCard key={r.name} r={r} mark={l} />)}</div></>}
    {m.length > 0 && <h2>{t("fdOther")}</h2>}
    {m.length > 0 && <div className="wrap"><table><thead><tr><th>{t("fdItem")}</th><th>{t("fdSource")}</th><th>{t("fdLocation")}</th><th>{t("fmRot")}</th><th>{t("fmChance")}</th><th>{t("fdRarity")}</th><th>{t("fdDetail")}</th></tr></thead><tbody>
      {m.map((r, i) => <tr key={i}><td><ItemArt file={img(r.item)} size={26} /> <Link to={`/item/${encodeURIComponent(r.item)}`}>{r.item}</Link></td><td>{r.src}</td><td>{r.where}{r.mode && r.mode !== r.src ? <span className="muted"> {r.mode}</span> : null}</td><td>{r.rot || "—"}</td><td>{r.ch == null ? "—" : r.ch + "%"}</td><td>{r.rar}</td><td className="muted">{r.note}</td></tr>)}</tbody></table></div>}
    {m.length > 0 && <p className="muted">{t("fdFoot")}</p>}
</>);
}
