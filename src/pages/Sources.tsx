import { imgUrl } from "../lib/catalog";
import { useEffect, useState } from "react";
import { allRecs, allStats, useWorld } from "../lib/data";
import { allProbes, PROBE_IDS, probeHealth, runProbes } from "../lib/probe";
import { datasetHealth, healthTag, worst, type Health } from "../lib/health";
import { CONFIDENCE, SOURCES, sourceFor } from "../lib/sources";
import { parseRelicImages } from "../lib/vault";
import { VERSION } from "../version";
const H = ({ h }: { h: Health }) => <span className={"tag " + healthTag(h)}>{h.replace("_", " ")}</span>;
export default function Sources() {
  useWorld("fissures", (_d): _d is unknown => true);
  const [, bump] = useState(0), recs = allRecs(), stats = allStats(), probes = allProbes();
  const check = () => void runProbes().then(() => bump(n => n + 1));
  useEffect(check, []); // eslint-disable-line react-hooks/exhaustive-deps
  const health = (hosts: string[], recIds?: string[]) => worst(recs.filter(([rid, r]) => recIds?.includes(rid) || (hosts.length > 0 && sourceFor(r.url)?.hosts.some(x => hosts.includes(x)))).map(([rid, r]) => datasetHealth(r, stats.get(rid))));
  return (
    <>
      <h1>Data Sources</h1>
      <p className="muted">App version {VERSION}</p>
      <p className="lead">Every source FarmFrame uses or plans to use, how far to trust it, and how it is behaving in this browser right now. A gap is shown instead of a guess.</p>
      <h2>Source registry</h2>
      <div className="bar"><button className="btn" onClick={check}>Check all now</button></div>
      <div className="wrap"><table><thead><tr><th>Source</th><th>Trust</th><th>Status</th><th>Health now</th><th>Provides</th></tr></thead><tbody>
        {SOURCES.map(s => <tr key={s.id}><td><b>{s.name}</b><div className="muted">{s.fallback ? `Fallback: ${s.fallback}` : "No fallback yet"}</div></td>
          <td title={CONFIDENCE[s.confidence]}>{s.confidence} <span className="muted">{CONFIDENCE[s.confidence]}</span></td>
          <td>{s.use === "active" ? "In use" : "Planned"}</td><td>{s.use === "active" ? <><H h={PROBE_IDS.includes(s.id) ? probeHealth(probes.get(s.id)) : health(s.hosts, s.recIds)} />{probes.get(s.id) && <div className="muted">{probes.get(s.id)!.note}{probes.get(s.id)!.ms ? ` · ${probes.get(s.id)!.ms} ms` : ""}{probes.get(s.id)!.http != null ? ` · HTTP ${probes.get(s.id)!.http}` : ""}</div>}</> : "—"}</td>
          <td>{s.provides}<div className="muted">{s.note}</div></td></tr>)}</tbody></table></div>
      {(() => { const vr = recs.find(([id]) => id === "relicsVault")?.[1], t = parseRelicImages(vr?.data)?.byTier.get("Axi"); return vr ? <p className="muted">Relic images: {t ? `sample ${imgUrl(t)}` : "no imageName found in the relic data"}</p> : null; })()}
      <h2>Datasets loaded in this session</h2>
      <ul className="list">
        {recs.map(([id, r]) => { const st = stats.get(id); return (
          <li key={id}><b>{id}</b><H h={datasetHealth(r, st)} /><span className="muted">{r.src} · {r.at ? new Date(r.at).toLocaleString() : "never"}{st?.ms != null ? ` · ${st.ms} ms` : ""}{st?.http != null ? ` · HTTP ${st.http}` : ""}{st?.count != null ? ` · ${st.count} records` : ""}{st && st.fails > 0 ? ` · ${st.fails} failed in a row` : ""}{st?.drift.length ? ` · ${st.drift.join(", ")}` : ""}{r.err ? " · " + r.err : ""}</span></li>); })}
      </ul>
    </>
  );
}
