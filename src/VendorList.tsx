import type { VendorHit } from "./lib/vendorSources";
/** "Sold by" rows shown next to (or instead of) drop sources. */
export default function VendorList({ hits, max = 4 }: { hits: VendorHit[]; max?: number }) {
  if (!hits.length) return null;
  return (<ul className="srcs">{hits.slice(0, max).map((h, i) => <li key={i}><b>Sold by {h.seller}</b><span className="fchips"><span className="fchip gold">{h.price}</span>{h.need && <span className="fchip">{h.need}</span>}<a className="fchip" href={h.url} target="_blank" rel="noreferrer" title={`Warframe Wiki, typed in by hand on ${h.dated}`}>wiki</a></span></li>)}
    {hits.length > max && <li className="muted">and {hits.length - max} more</li>}</ul>);
}
