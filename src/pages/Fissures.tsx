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
  const [tier, setTier] = useState(""), [mode, setMode] = useState<"all" | "normal" | "steel">("all"), [kind, setKind] = useState("all"), [fac, setFac] = useState("");
  const rows = useMemo(() => (data ?? []).filter(f => ts(f.expiry) > Date.now() && (!tier || f.tier === tier) && (!fac || f.enemy === fac)
    && (kind === "all" || (kind === "storm") === f.isStorm)).sort((a, b) => a.tierNum - b.tierNum || ts(a.expiry) - ts(b.expiry)), [data, tier, kind, fac]);
  const groups = [{ id: "steel", title: "Steel Path", list: rows.filter(f => !f.isStorm && f.isHard) }, { id: "normal", title: "Normal", list: rows.filter(f => !f.isStorm && !f.isHard) }, { id: "storm", title: "Void Storms (Railjack)", list: rows.filter(f => f.isStorm) }]
    .filter(g => (mode === "all" || g.id === mode || (g.id === "storm" && mode === "normal")) && g.list.length);
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
        <span className="chips" role="group" aria-label="Difficulty">{([["all", "All"], ["normal", "Normal"], ["steel", "Steel Path"]] as const).map(([k, t]) => <button key={k} className={"btn" + (mode === k ? " on" : "")} aria-pressed={mode === k} onClick={() => setMode(k)}>{t} <span className="muted">{k === "all" ? rows.length : k === "steel" ? rows.filter(f => !f.isStorm && f.isHard).length : rows.filter(f => f.isStorm || !f.isHard).length}</span></button>)}</span>
        <Badge s={status} />
      </div>
      {groups.map(g => (<section key={g.id} aria-label={g.title}><h2>{g.title} <span className="muted">{g.list.length}</span></h2>
        <ul className="fislist">{g.list.map(f => (<li key={f.id} className={"fis" + (f.isHard ? " steel" : "")}>
          <span className="tier"><RelicArt tier={f.tier} size={34} />{f.tier}</span>
          <span className="what"><b>{f.missionType}</b><span className="muted">{f.node}</span>
            <span className="fchips"><span className="fchip"><FactionArt f={f.enemy} size={16} />{f.enemy}</span>{f.isHard && <span className="fchip gold">Steel Path</span>}{f.isStorm && <span className="fchip">Storm</span>}
              {(planTier.get(f.tier) ?? 0) > 0 && <Link className="fchip star" to="/farm-plan" title="Relics of this tier that advance your goals">★ {planTier.get(f.tier)} relic{planTier.get(f.tier) === 1 ? "" : "s"} for your plan</Link>}</span></span>
          <span className="timer"><Countdown exp={f.expiry} /></span></li>))}</ul></section>))}
      {!groups.length && <p className="muted">{live === 0 ? <>No active fissure in the data. {rec?.err ? <>The source is serving old data. </> : null}<button className="btn" onClick={() => retry("fissures")}>Check again</button></> : "No fissures match these filters."}</p>}
      <Prov rec={rec} />
    </>
  );
}
