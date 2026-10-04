import FactionArt from "../FactionArt";
import PageArt from "../PageArt";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useExact } from "../lib/useExact";
import RelicArt from "../RelicArt";
import { useWorld } from "../lib/data";
import { ts } from "../lib/format";
import { retry } from "../lib/data";
import { Badge, Countdown, Prov, Unavailable } from "./parts";
interface Fis { id: string; node: string; missionType: string; enemy: string; tier: string; tierNum: number; isStorm: boolean; isHard: boolean; expiry: string }
const isFis = (d: unknown): d is Fis[] => Array.isArray(d) && d.every(x => x && typeof x.tier === "string" && typeof x.expiry === "string");
const TIERS = ["Lith", "Meso", "Neo", "Axi", "Requiem", "Omnia"];
export default function Fissures() {
  const { data, status, rec } = useWorld("fissures", isFis), ex = useExact(), planTier = new Map(ex.tiers.map(t => [t.tier, t.relics.length]));
  const [tier, setTier] = useState(""), [sp, setSp] = useState(false), [kind, setKind] = useState("all"), [fac, setFac] = useState("");
  const rows = useMemo(() => (data ?? []).filter(f => ts(f.expiry) > Date.now() && (!tier || f.tier === tier) && (!sp || f.isHard) && (!fac || f.enemy === fac)
    && (kind === "all" || (kind === "storm") === f.isStorm)).sort((a, b) => a.tierNum - b.tierNum || ts(a.expiry) - ts(b.expiry)), [data, tier, sp, kind, fac]);
  const live = (data ?? []).filter(f => ts(f.expiry) > Date.now()).length;
  if (!data) return <><h1><PageArt name="Void Fissures" size={36} />Void Fissures</h1><Unavailable title="Void Fissures" status={status} why="No verified data." rec={rec} /></>;
  return (
    <>
      <h1><PageArt name="Void Fissures" size={36} />Void Fissures</h1>
      <div className="tierbar" role="group" aria-label="Filter by relic tier">{TIERS.map(t => { const n = data.filter(x => x.tier === t && ts(x.expiry) > Date.now()).length; return n || tier === t ? <button key={t} className="tierbtn" aria-pressed={tier === t} onClick={() => setTier(tier === t ? "" : t)}><RelicArt tier={t} size={34} /><span>{t}</span><b>{n}</b></button> : null; })}</div>
      <div className="bar">
        <select aria-label="Tier" value={tier} onChange={e => setTier(e.target.value)}><option value="">All tiers</option>{TIERS.map(t => <option key={t}>{t}</option>)}</select>
        <select aria-label="Kind" value={kind} onChange={e => setKind(e.target.value)}><option value="all">Star Chart and Railjack</option><option value="void">Star Chart only</option><option value="storm">Void Storms (Railjack)</option></select>
        <select aria-label="Faction" value={fac} onChange={e => setFac(e.target.value)}><option value="">All factions</option>{[...new Set((data ?? []).map(f => f.enemy).filter(Boolean))].sort().map(f => <option key={f}>{f}</option>)}</select>
        <label className="muted"><input type="checkbox" checked={sp} onChange={e => setSp(e.target.checked)} /> Steel Path only</label>
        <Badge s={status} />
      </div>
      <ul className="list">
        {rows.map(f => (
          <li key={f.id}>
            <span className="tier"><RelicArt tier={f.tier} size={34} />{f.tier}</span>
            <span className="what"><b>{f.missionType}</b> · {f.node}<span className="muted"> <FactionArt f={f.enemy} size={16} />{f.enemy}{f.isHard ? " · " : ""}{f.isHard && <span className="gold">Steel Path</span>}{f.isStorm ? " · Storm" : ""}</span></span>
            {(planTier.get(f.tier) ?? 0) > 0 && <Link className="tag STALE" to="/farm-plan" title="Relics of this tier that advance your goals">★ {planTier.get(f.tier)} relic{planTier.get(f.tier) === 1 ? "" : "s"} for your plan</Link>}<Countdown exp={f.expiry} />
          </li>
        ))}
        {!rows.length && <li className="muted">{live === 0 ? <>No active fissure in the data. {rec?.err ? <>The source is serving old data. </> : null}<button className="btn" onClick={() => retry("fissures")}>Check again</button></> : "No fissures match these filters."}</li>}
      </ul>
      <Prov rec={rec} />
    </>
  );
}
