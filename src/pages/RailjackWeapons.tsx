import ItemArt from "../ItemArt";
import { GH_ALT, GH_RAW, parseCatalog } from "../lib/catalog";
import { useMany } from "../lib/data";
import { clean } from "../lib/text";
type O = Record<string, unknown>;
/** Railjack turrets and ordnance from the item data: what each does, its numbers and where it drops. Ship components (reactor, engines, plating...) are not in any source FarmFrame uses, so none are shown. */
export default function RailjackWeapons({ q }: { q: string }) {
  const [r] = useMany([{ id: "railjackw", file: "", url: GH_RAW + "Railjack.json", alt: GH_ALT + "Railjack.json", src: "WFCD warframe-items on GitHub (community, unofficial)", win: 6 * 3_600_000 }]);
  const l = q.trim().toLowerCase(), all = parseCatalog(r.rec?.data, "weapon") ?? [], list = all.filter(e => !l || e.name.toLowerCase().includes(l));
  if (!all.length) return <p className="muted">{r.status === "LOADING" ? "Loading Railjack weapons…" : "Railjack weapons are not available right now."}</p>;
  return (<><h2>Railjack weapons ({list.length})</h2>
    {list.slice(0, 60).map(e => { const raw = e.raw as O, drops = (Array.isArray(raw.drops) ? raw.drops : []) as O[];
      return (<details key={e.name} className="panel enemy"><summary><span className="row"><ItemArt file={e.image} size={40} /><b>{e.name}</b> <span className="muted">{e.type}</span></span></summary>
        {e.description && <p>{clean(e.description)}</p>}
        {e.stats.length > 0 && <dl className="dgrid">{e.stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{+v.toFixed(2)}</dd></div>)}</dl>}
        <div className="muted">{drops.length ? "Where to get it: " + drops.slice(0, 6).map(d => `${String(d.location ?? "")}${d.type ? " (" + String(d.type) + ")" : ""}`).join("; ") : "No acquisition data in this source (crafted in the Dry Dock or bought; not listed)."}</div>
      </details>); })}
    <p className="muted">Weapon data comes from a community copy of the game files. Ship components are in the section above.</p></>);
}
