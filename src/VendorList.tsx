import type { VendorHit } from "./lib/vendorSources";
import { useT } from "./i18n";
/** "Sold by" rows shown next to (or instead of) drop sources. */
export default function VendorList({ hits, max = 4 }: { hits: VendorHit[]; max?: number }) {
  const t = useT();
  if (!hits.length) return null;
  return (<ul className="srcs">{hits.slice(0, max).map((h, i) => <li key={i}><b>{t("vlSold", { seller: h.seller })}</b><span className="fchips"><span className="fchip gold">{h.price}</span>{h.need && <span className="fchip">{h.need}</span>}<a className="fchip" href={h.url} target="_blank" rel="noreferrer" title={t("vlWiki", { date: h.dated })}>wiki</a></span></li>)}
    {hits.length > max && <li className="muted">{t("alMoreN", { n: hits.length - max })}</li>}</ul>);
}
