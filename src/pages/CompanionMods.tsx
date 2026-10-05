import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../lib/useCatalog";
import ModCard from "../ModCard";
/** Mods that fit companions, shown under the companion list. Follows the same filter box as the list above. */
export default function CompanionMods({ q }: { q: string }) {
  const { items, status } = useCatalog("mod"), [more, setMore] = useState(1), l = q.trim().toLowerCase();
  if (!items) return <><h2>Companion mods</h2><p className="muted">{status === "LOADING" ? "Loading mods…" : "Mod data is unavailable right now."}</p></>;
  const all = items.filter(e => e.type === "Companion Mod" && (!l || e.name.toLowerCase().includes(l) || e.compat.toLowerCase().includes(l)));
  const shown = all.slice(0, 24 * more);
  return (<section aria-label="Companion mods"><h2>Companion mods <span className="muted">{all.length}</span></h2>
    {!all.length ? <p className="muted">No companion mods match "{q}".</p> : <div className="cards">{shown.map(e => <Link key={e.slug} to={`/mod/${e.slug}`} className="cardlink"><ModCard e={e} /></Link>)}</div>}
    {all.length > shown.length && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({all.length - shown.length} left)</button>}</section>);
}
