import { Pic } from "../ItemArt";
import { Link, useParams } from "react-router-dom";
import { useT } from "../i18n";
import { useMany } from "../lib/data";
import { FIND, collect, query } from "../lib/drops";
import { rank, stackIndex } from "../lib/farm";
import { useNeeded } from "../lib/useNeeded";
import { useCatalogs } from "../lib/useCatalog";
import type { Cat, Entity } from "../lib/catalog";
import SetFarm from "./SetFarm";
import { Unavailable } from "./parts";
import VendorList from "../VendorList";
import { vendorSources } from "../lib/vendorSources";
const BUILT: Cat[] = ["warframe", "weapon", "companion", "archwing"];
const items = FIND.map(f => ({ id: f.id, file: f.file }));
export default function Farm() {
  const t = useT(), { item = "" } = useParams();
  const res = useMany(items), needed = useNeeded(), cats = useCatalogs(BUILT);
  const built = BUILT.flatMap(c => (cats[c]?.items ?? []).filter(x => x.components.length > 0 && x.name.toLowerCase() === item.trim().toLowerCase()).map(x => ({ c, x: x as Entity })))[0];
  const { rows, gaps, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status })));
  if (built) return <><h1><Pic name={item} size={44} /> {t("fmTitle", { item })}</h1><SetFarm e={built.x} cat={built.c} /></>;
  if (!ok) return <><h1>{item}</h1><VendorList hits={vendorSources(item)} max={20} /><Unavailable title={t("fmDropTables")} art="Drop tables" status={res[0].status} why={t("fmNoData")} /></>;
  const list = rank(query(rows, item), stackIndex(rows, needed), item), sold = vendorSources(item);
  return (<><h1><Pic name={item} size={44} /> {t("fmTitle", { item })}</h1>
    <p className="lead">{t("fmLead")}</p>
    <p className="muted"><b>{t("fmFactLabel")}</b> {t("fmFactText")} <b>{t("fmEstLabel")}</b> {t("fmEstText")}</p>
    {gaps.length > 0 && <p className="muted">{t("fmNotIncl", { list: gaps.join("; ") })}</p>}
    {sold.length > 0 && <section className="gcard sec"><h2>{t("fmWhereBuy")}</h2><VendorList hits={sold} max={20} /><p className="muted">{t("fmVendorNote")}</p></section>}
    {!list.length ? <p className="muted">{t("fmNoDrop", { item })}{sold.length ? "" : " " + t("fmNoDropMore")} <Link to={`/finder?q=${encodeURIComponent(item)}`}>{t("prtSearchFinder")}</Link></p> :
      <div className="wrap"><table><thead><tr><th>{t("fmWhere")}</th><th>{t("fmType")}</th><th>{t("fmRot")}</th><th>{t("fmChance")}</th><th>{t("fmRolls")}</th><th>{t("fmAlso")}</th></tr></thead><tbody>
        {list.map((o, i) => (<tr key={i}><td>{o.row.item !== item && <span className="muted"><Pic name={o.row.item} size={22} /> {o.row.item} · </span>}{o.row.where}
          {o.tags.map(t => <div key={t}><span className="tag STALE">{t}</span></div>)}
          <details><summary>{t("fmWhy")}</summary><ul><li>{t("fmSource", { src: o.row.src })}</li><li>{o.row.ch == null ? t("fmNoChance") : t("fmDropChance", { ch: o.row.ch })}{o.row.note ? ` (${o.row.note})` : ""}</li>
            {o.stacked.length > 0 && <li>{t("fmStacked", { list: o.stacked.join(", ") })}</li>}</ul></details></td>
          <td>{o.row.mode || o.row.src}</td><td>{o.row.rot || "—"}</td><td>{o.row.ch == null ? "—" : o.row.ch + "%"}</td><td>{o.rolls ?? "—"}</td>
          <td className="muted">{o.stacked.length ? o.stacked.slice(0, 3).join(", ") : "—"}</td></tr>))}</tbody></table></div>}</>);
}
