import { imgUrl } from "../lib/catalog";
import { useEffect, useState } from "react";
import { allRecs, allStats, useWorld } from "../lib/data";
import { allProbes, PROBE_IDS, probeHealth, runProbes } from "../lib/probe";
import { datasetHealth, healthTag, worst, type Health } from "../lib/health";
import { SOURCES, sourceById, sourceFor } from "../lib/sources";
import { useT } from "../i18n";
import { parseRelicImages } from "../lib/vault";
import { VERSION } from "../version";
const H = ({ h }: { h: Health }) => { const tr = useT(); return <span className={"tag " + healthTag(h)}>{tr(`hh${h}`)}</span>; };
export default function Sources() {
  useWorld("fissures", (_d): _d is unknown => true);
  const tr = useT(), [, bump] = useState(0), recs = allRecs(), stats = allStats(), probes = allProbes();
  const check = () => void runProbes().then(() => bump(n => n + 1));
  useEffect(check, []); // eslint-disable-line react-hooks/exhaustive-deps
  const health = (hosts: string[], recIds?: string[]) => worst(recs.filter(([rid, r]) => recIds?.includes(rid) || (hosts.length > 0 && sourceFor(r.url)?.hosts.some(x => hosts.includes(x)))).map(([rid, r]) => datasetHealth(r, stats.get(rid))));
  return (
    <>
      <h1>{tr("dataSources")}</h1>
      <p className="muted">{tr("srcVersion", { v: VERSION })}</p>
      <p className="lead">{tr("srcLead")}</p>
      <h2>{tr("srcRegistry")}</h2>
      <div className="bar"><button className="btn" onClick={check}>{tr("srcCheck")}</button></div>
      <div className="wrap"><table><thead><tr><th>{tr("srcThSource")}</th><th>{tr("srcThTrust")}</th><th>{tr("srcThStatus")}</th><th>{tr("srcThHealth")}</th><th>{tr("srcThProvides")}</th></tr></thead><tbody>
        {SOURCES.map(s => <tr key={s.id}><td><b>{s.name}</b><div className="muted">{s.fallback ? tr("srcFallback", { name: sourceById(s.fallback)?.name ?? s.fallback }) : tr("srcNoFallback")}{s.checked ? ` · ${tr("srcOpened", { date: s.checked })}` : ""}</div></td>
          <td title={tr(`srcConf${s.confidence}`)}>{s.confidence} <span className="muted">{tr(`srcConf${s.confidence}`)}</span></td>
          <td>{s.use === "active" ? tr("srcInUse") : tr("srcPlanned")}</td><td>{s.id.startsWith("manual") ? <span className="tag STALE">{tr("srcManual")}</span> : s.use === "active" ? <><H h={PROBE_IDS.includes(s.id) ? probeHealth(probes.get(s.id)) : health(s.hosts, s.recIds)} />{probes.get(s.id) && <div className="muted">{probes.get(s.id)!.note}{probes.get(s.id)!.ms ? ` · ${probes.get(s.id)!.ms} ms` : ""}{probes.get(s.id)!.http != null ? ` · HTTP ${probes.get(s.id)!.http}` : ""}</div>}</> : "—"}</td>
          <td>{s.provides}<div className="muted">{s.note}</div></td></tr>)}</tbody></table></div>
      {(() => { const vr = recs.find(([id]) => id === "relicsVault")?.[1], t = parseRelicImages(vr?.data)?.byTier.get("Axi"); return vr ? <p className="muted">{t ? tr("srcRelicSample", { url: imgUrl(t) }) : tr("srcRelicNone")}</p> : null; })()}
      <h2>{tr("srcLoaded")}</h2>
      <ul className="list">
        {recs.map(([id, r]) => { const st = stats.get(id); return (
          <li key={id}><b>{id}</b><H h={datasetHealth(r, st)} /><span className="muted">{r.src} · {r.at ? new Date(r.at).toLocaleString() : tr("srcNever")}{st?.ms != null ? ` · ${st.ms} ms` : ""}{st?.http != null ? ` · HTTP ${st.http}` : ""}{st?.count != null ? ` · ${tr("srcRecords", { n: st.count })}` : ""}{st && st.fails > 0 ? ` · ${tr("srcFailed", { n: st.fails })}` : ""}{st?.drift.length ? ` · ${st.drift.join(", ")}` : ""}{r.err ? " · " + r.err : ""}</span></li>); })}
      </ul>
    </>
  );
}
