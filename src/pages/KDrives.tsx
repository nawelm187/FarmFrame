import { useState } from "react";
import { Link } from "react-router-dom";
import { GUIDE_SOURCES, KDRIVE_HOW, KDRIVE_NOTES, KDRIVE_PARTS, VENTKIDS_RANKS, type KPart } from "../data/guides";
import { itemKey, readMastery, writeMastery } from "../lib/mastery";
const PARTS: KPart[] = ["Board", "Reactor", "Nose", "Jet"];
/** K-Drives: how to unlock them, where each part comes from and what it costs. Boards double as a Mastery checklist. */
export default function KDrives() {
  const [part, setPart] = useState<KPart>("Board"), [chk, setChk] = useState(readMastery);
  const toggle = (name: string) => { const s = new Set(chk), k = itemKey("k-drive", name); if (!s.delete(k)) s.add(k); setChk(s); writeMastery(s); };
  const rows = KDRIVE_PARTS.filter(p => p.part === part), src = [GUIDE_SOURCES.kdrive, GUIDE_SOURCES.kdriveSupport];
  return (<><h1>K-Drives</h1>
    <p className="lead">K-Drives are hoverboards for the open worlds. The Board of each custom K-Drive gives Mastery Points, so they matter for your Mastery Rank. Here is how to get the launcher, how to build one and what every part costs.</p>
    <section className="gcard"><h2>How to get one</h2><ol>{KDRIVE_HOW.map(s => <li key={s}>{s}</li>)}</ol><ul>{KDRIVE_NOTES.map(s => <li key={s} className="muted">{s}</li>)}</ul>
      <p><Link to="/guides">Launcher guides</Link> · <Link to="/syndicates">Syndicates</Link> · <Link to="/mastery">Mastery checklist</Link></p></section>
    <div className="chips" role="group" aria-label="Part">{PARTS.map(p => <button key={p} className={"btn" + (part === p ? " on" : "")} aria-pressed={part === p} onClick={() => setPart(p)}>{p}</button>)}</div>
    <section className="gcard" aria-label={part}><h2>{part}s</h2>
      <div className="wrap"><table><thead><tr><th>{part}</th><th className="num">Ventkids Standing</th><th>Ventkids rank</th><th>Where</th>{part === "Board" && <th>Mastery (6,000)</th>}</tr></thead>
        <tbody>{rows.map(p => <tr key={p.name}><td><b>{p.name}</b></td><td className="num">{p.standing == null ? "Race reward" : p.standing.toLocaleString()}</td><td>{p.rank}{VENTKIDS_RANKS[p.rank] ? ` (${VENTKIDS_RANKS[p.rank]})` : ""}</td><td>{p.where}</td>
          {part === "Board" && <td><label><input type="checkbox" checked={chk.has(itemKey("k-drive", p.name))} onChange={() => toggle(p.name)} /> I have it maxed</label></td>}</tr>)}</tbody></table></div>
      <p className="muted">Rank numbers are the Ventkids ranks. Only the rank names the wiki gives are shown.</p></section>
    <p className="muted">Sources: {src.map((s, i) => <span key={s.url}>{i ? " · " : ""}<a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></span>)}. Read on {GUIDE_SOURCES.kdrive.verified} and entered by hand; game updates can change prices and ranks.</p></>);
}
