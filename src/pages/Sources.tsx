import { imgUrl } from "../lib/catalog";
import { allRecs, statusOf, useWorld } from "../lib/data";
import { parseRelicImages } from "../lib/vault";
import { VERSION } from "../version";
import { Badge } from "./parts";
export default function Sources() {
  useWorld("fissures", (_d): _d is unknown => true);
  return (
    <>
      <h1>Data Sources</h1>
      <p className="muted">App version {VERSION}</p>
      <p className="lead">Status comes from the last successful retrieval. World state comes from a community API, not directly from Digital Extremes. A gap is shown instead of a guess.</p>
      {(() => { const vr = allRecs().find(([id]) => id === "relicsVault")?.[1], t = parseRelicImages(vr?.data)?.byTier.get("Axi"); return vr ? <p className="muted">Relic images: {t ? `sample ${imgUrl(t)}` : "no imageName found in the relic data"}</p> : null; })()}
      <ul className="list">
        {allRecs().map(([id, r]) => (
          <li key={id}><b>{id}</b><Badge s={statusOf(r, false)} /><span className="muted">{r.src} · {r.at ? new Date(r.at).toLocaleString() : "never"}{r.err ? " · " + r.err : ""}</span></li>
        ))}
      </ul>
    </>
  );
}
