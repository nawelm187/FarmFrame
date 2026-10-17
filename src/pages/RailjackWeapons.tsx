import ItemArt from "../ItemArt";
import { GH_ALT, GH_RAW, parseCatalog } from "../lib/catalog";
import { useMany } from "../lib/data";
import { clean } from "../lib/text";
import { useT } from "../i18n";
type O = Record<string, unknown>;
/** Railjack turrets and ordnance from the item data: what each does, its numbers and where it drops. Ship components (reactor, engines, plating...) are not in any source FarmFrame uses, so none are shown. */
export default function RailjackWeapons({ q }: { q: string }) {
  const tr = useT();
  const [r] = useMany([{ id: "railjackw", file: "", url: GH_RAW + "Railjack.json", alt: GH_ALT + "Railjack.json", src: "WFCD warframe-items on GitHub (community, unofficial)", win: 6 * 3_600_000 }]);
  const l = q.trim().toLowerCase(), all = parseCatalog(r.rec?.data, "weapon") ?? [], list = all.filter(e => !l || e.name.toLowerCase().includes(l));
  if (!all.length) return <p className="muted">{r.status === "LOADING" ? tr("rjLoading") : tr("rjNone")}</p>;
  return (<><h2>{tr("rjTitle", { n: list.length })}</h2>
    {list.slice(0, 60).map(e => { const raw = e.raw as O, drops = (Array.isArray(raw.drops) ? raw.drops : []) as O[];
      return (<details key={e.name} className="panel enemy"><summary><span className="row"><ItemArt file={e.image} size={40} /><b>{e.name}</b> <span className="muted">{e.type}</span></span></summary>
        {e.description && <p>{clean(e.description)}</p>}
        {e.stats.length > 0 && <dl className="dgrid">{e.stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{+v.toFixed(2)}</dd></div>)}</dl>}
        <div className="muted">{drops.length ? tr("whereGet") + " " + drops.slice(0, 6).map(d => `${String(d.location ?? "")}${d.type ? " (" + String(d.type) + ")" : ""}`).join("; ") : tr("rjNoAcq")}</div>
      </details>); })}
    <p className="muted">{tr("rjWeaponsNote")}</p></>);
}
