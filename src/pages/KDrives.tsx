import { useState } from "react";
import { Link } from "react-router-dom";
import ItemArt from "../ItemArt";
import SyndicateArt from "../SyndicateArt";
import { PageHead } from "../ui";
import { GUIDE_SOURCES, KDRIVE_HOW, KDRIVE_NOTES, KDRIVE_PARTS, VENTKIDS_RANKS, type KPart } from "../data/guides";
import { itemKey, readMastery, writeMastery } from "../lib/mastery";
const PARTS: KPart[] = ["Board", "Reactor", "Nose", "Jet"];
/** K-Drives: how to unlock them, where each part comes from and what it costs. Boards double as a Mastery checklist. */
export default function KDrives() {
  const [part, setPart] = useState<KPart>("Board"), [chk, setChk] = useState(readMastery);
  const toggle = (name: string) => { const s = new Set(chk), k = itemKey("k-drive", name); if (!s.delete(k)) s.add(k); setChk(s); writeMastery(s); };
  const rows = KDRIVE_PARTS.filter(p => p.part === part), src = [GUIDE_SOURCES.kdrive, GUIDE_SOURCES.kdriveSupport], n = KDRIVE_PARTS.filter(p => p.part === "Board" && chk.has(itemKey("k-drive", p.name))).length;
  return (<><PageHead title="K-Drives" art={<SyndicateArt name="Ventkids" size={64} />}>K-Drives are hoverboards for the open worlds. The Board of each custom K-Drive gives Mastery Points, so they matter for your Mastery Rank. Here is how to get the launcher, how to build one and what every part costs.</PageHead>
    <section className="gcard sec"><h2>How to get one</h2><ol className="steps">{KDRIVE_HOW.map(s => <li key={s} className="step"><span>{s}</span></li>)}</ol>{KDRIVE_NOTES.map(s => <p key={s} className="note">{s}</p>)}
      <p><Link to="/guides">Launcher guides</Link> · <Link to="/syndicates">Syndicates</Link> · <Link to="/mastery">Mastery checklist</Link></p></section>
    <div className="chips" role="group" aria-label="Part" style={{ marginBottom: ".8rem" }}>{PARTS.map(p => <button key={p} className={"btn" + (part === p ? " on" : "")} aria-pressed={part === p} onClick={() => setPart(p)}>{p}s</button>)}</div>
    <section className="gcard sec" aria-label={part}><div className="sechead"><h2>{part}s</h2>{part === "Board" && <span className="muted">{n}/{rows.length} maxed · 6,000 Mastery Points each</span>}</div>
      <div className="cgrid wide">{rows.map(p => { const on = chk.has(itemKey("k-drive", p.name));
        return (<article key={p.name} className={"minicard" + (on ? " tile on" : "")} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: ".4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}><ItemArt file={null} name={p.name} size={44} fallback={<span aria-hidden="true">◈</span>} /><b style={{ flex: 1 }}>{p.name}</b></div>
          <div><span className="tag">{p.standing == null ? "Race reward" : `${p.standing.toLocaleString()} standing`}</span> <span className="tag">Rank {p.rank}{VENTKIDS_RANKS[p.rank] ? ` · ${VENTKIDS_RANKS[p.rank]}` : ""}</span></div>
          <span className="muted">{p.where}</span>
          {part === "Board" && <label className="tl" style={{ marginTop: ".2rem" }}><input type="checkbox" checked={on} onChange={() => toggle(p.name)} /><span className="tick" aria-hidden="true">✓</span><span>I have it maxed</span></label>}</article>); })}</div>
      <p className="muted">Rank numbers are the Ventkids ranks. Only the rank names the wiki gives are shown.</p></section>
    <p className="srclist">Sources: {src.map((s, i) => <span key={s.url}>{i ? " · " : ""}<a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></span>)}. Read on {GUIDE_SOURCES.kdrive.verified} and entered by hand; game updates can change prices and ranks.</p></>);
}
