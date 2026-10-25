import { Link } from "react-router-dom";
import { COMPONENTS, HOUSES, HOW, NOT_COVERED, RAILJACK_SOURCE, TIERS } from "../data/railjack";
import { useT } from "../i18n";
import { rich } from "../lib/rich";
/** Ship components, from a hand-written source (not a live feed). Weapons below it come from the item data. */
export default function RailjackParts({ q }: { q: string }) {
  const t = useT(), l = q.trim().toLowerCase(), list = COMPONENTS.filter(c => !l || c.name.toLowerCase().includes(l));
  if (!list.length && l) return null;
  return (<section className="panel"><div className="row"><h2>{t("rjShipTitle")}</h2><span className="tag STALE" title={t("rjManualTip")}>{t("rjManual")}</span></div>
    <ul className="list comp">{list.map(c => <li key={c.name}><span><b>{c.name}</b><div className="muted">{c.does}</div></span><Link to={`/farm/${encodeURIComponent(c.name)}`}>{t("rjSearch")}</Link></li>)}</ul>
    <h3>{t("rjHouses")}</h3><p>{t("rjHousesText", { list: HOUSES.join(", ") })}</p>
    <h3>{t("rjTiers")}</h3><ul className="sub">{TIERS.map(x => <li key={x.tier}><b>{x.tier}</b> <span className="muted">{x.where}</span></li>)}</ul>
    <h3>{t("rjHow")}</h3><ul className="sub">{HOW.map((h, i) => <li key={i}>{h}</li>)}</ul>
    <p className="muted">{NOT_COVERED}</p>
    <p className="muted">{rich(t("rjSource", { date: RAILJACK_SOURCE.date }), { link: <a href={RAILJACK_SOURCE.url} target="_blank" rel="noopener noreferrer">{RAILJACK_SOURCE.name}</a> })}</p></section>);
}
