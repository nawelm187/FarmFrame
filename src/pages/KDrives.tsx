import { useT } from "../i18n";
import { rich } from "../lib/rich";
import { useState } from "react";
import { Link } from "react-router-dom";
import ItemArt from "../ItemArt";
import SyndicateArt from "../SyndicateArt";
import { PageHead } from "../ui";
import { GUIDE_SOURCES, KDRIVE_HOW, KDRIVE_NOTES, KDRIVE_PARTS, VENTKIDS_RANKS, type KPart } from "../data/guides";
import { itemKey, readMastery, writeMastery } from "../lib/mastery";
const PARTS: KPart[] = ["Board", "Reactor", "Nose", "Jet"];
const PART_KEY = { Board: "kdBoards", Reactor: "kdReactors", Nose: "kdNoses", Jet: "kdJets" } as const;
/** K-Drives: how to unlock them, where each part comes from and what it costs. Boards double as a Mastery checklist. */
export default function KDrives() {
  const tr = useT(), [part, setPart] = useState<KPart>("Board"), [chk, setChk] = useState(readMastery);
  const toggle = (name: string) => { const s = new Set(chk), k = itemKey("k-drive", name); if (!s.delete(k)) s.add(k); setChk(s); writeMastery(s); };
  const rows = KDRIVE_PARTS.filter(p => p.part === part), src = [GUIDE_SOURCES.kdrive, GUIDE_SOURCES.kdriveSupport], n = KDRIVE_PARTS.filter(p => p.part === "Board" && chk.has(itemKey("k-drive", p.name))).length;
  return (<><PageHead title={tr("kdrives")} art={<SyndicateArt name="Ventkids" size={64} />}>{tr("kdLead")}</PageHead>
    <section className="gcard sec"><h2>{tr("kdHow")}</h2><ol className="steps">{KDRIVE_HOW.map(s => <li key={s} className="step"><span>{s}</span></li>)}</ol>{KDRIVE_NOTES.map(s => <p key={s} className="note">{s}</p>)}
      <p><Link to="/guides">{tr("mrHintLaunch")}</Link> · <Link to="/syndicates">{tr("syndicates")}</Link> · <Link to="/mastery">{tr("hlMasteryLink")}</Link></p></section>
    <div className="chips" role="group" aria-label={tr("parts")} style={{ marginBottom: ".8rem" }}>{PARTS.map(p => <button key={p} className={"btn" + (part === p ? " on" : "")} aria-pressed={part === p} onClick={() => setPart(p)}>{tr(PART_KEY[p])}</button>)}</div>
    <section className="gcard sec" aria-label={tr(PART_KEY[part])}><header className="sechead"><h2>{tr(PART_KEY[part])}</h2>{part === "Board" && <span className="muted">{tr("kdMaxed", { n, total: rows.length, pts: (6000).toLocaleString() })}</span>}</header>
      <div className="cgrid wide">{rows.map(p => { const on = chk.has(itemKey("k-drive", p.name));
        return (<article key={p.name} className={"minicard" + (on ? " tile on" : "")} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: ".4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}><ItemArt file={null} name={p.name} size={44} fallback={<span aria-hidden="true">◈</span>} /><b style={{ flex: 1 }}>{p.name}</b></div>
          <div><span className="tag">{p.standing == null ? tr("kdRace") : tr("drNoteStanding", { n: p.standing.toLocaleString() })}</span> <span className="tag">{tr("synRank", { n: p.rank })}{VENTKIDS_RANKS[p.rank] ? ` · ${VENTKIDS_RANKS[p.rank]}` : ""}</span></div>
          <span className="muted">{p.where}</span>
          {part === "Board" && <label className="tl" style={{ marginTop: ".2rem" }}><input type="checkbox" checked={on} onChange={() => toggle(p.name)} /><span className="tick" aria-hidden="true">✓</span><span>{tr("kdHave")}</span></label>}</article>); })}</div>
      <p className="muted">{tr("kdNote")}</p></section>
    <p className="srclist">{rich(tr("kdSources", { date: GUIDE_SOURCES.kdrive.verified, list: "{list}" }), { list: <>{src.map((s, i) => <span key={s.url}>{i ? " · " : ""}<a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></span>)}</> })}</p></>);
}
