import { imgUrl } from "../lib/catalog";
import { allRecs, statusOf, useWorld } from "../lib/data";
import { parseCurrency } from "../lib/currency";
import { parseRelicImages } from "../lib/vault";
import { VERSION } from "../version";
import { Badge } from "./parts";
export default function Sources() {
  useWorld("fissures", (d): d is unknown => true);
  return (
    <>
      <h1>Data Sources</h1>
      <p className="muted">App version {VERSION}</p>
      <p className="lead">Status comes from the last successful retrieval. World state comes from a community API, not directly from Digital Extremes. A gap is shown instead of a guess.</p>
      {(() => { const vr = allRecs().find(([id]) => id === "relicsVault")?.[1], t = parseRelicImages(vr?.data)?.byTier.get("Axi"); return vr ? <p className="muted">Relic images: {t ? `sample ${imgUrl(t)}` : "no imageName found in the relic data"}</p> : null; })()}
      {(() => { const mr = allRecs().find(([id]) => id === "f:Misc.json")?.[1], c = parseCurrency(mr?.data); return mr ? <p className="muted">Currency icons: platinum {c?.platinum ? imgUrl(c.platinum) : "not found in the data (fallback shown)"} · credits {c?.credits ? imgUrl(c.credits) : "not found in the data (fallback shown)"}</p> : null; })()}
      <ul className="list">
        {allRecs().map(([id, r]) => (
          <li key={id}><b>{id}</b><Badge s={statusOf(r, false)} /><span className="muted">{r.src} · {r.at ? new Date(r.at).toLocaleString() : "never"}{r.err ? " · " + r.err : ""}</span></li>
        ))}
      </ul>
    </>
  );
}
