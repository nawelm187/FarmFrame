import { allRecs, statusOf, useWorld } from "../lib/data";
import { Badge } from "./parts";
export default function Sources() {
  useWorld("fissures", (d): d is unknown => true);
  return (
    <>
      <h1>Data Sources</h1>
      <p className="lead">Status comes from the last successful retrieval. World state comes from a community API, not directly from Digital Extremes. A gap is shown instead of a guess.</p>
      <ul className="list">
        {allRecs().map(([id, r]) => (
          <li key={id}><b>{id}</b><Badge s={statusOf(r, false)} /><span className="muted">{r.src} · {r.at ? new Date(r.at).toLocaleString() : "never"}{r.err ? " · " + r.err : ""}</span></li>
        ))}
      </ul>
    </>
  );
}
