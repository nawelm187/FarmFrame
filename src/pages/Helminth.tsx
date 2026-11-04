import type React from "react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ItemArt, { Pic } from "../ItemArt";
import { PageHead, SectionTabs } from "../ui";
import { useT } from "../i18n";
import { rich } from "../lib/rich";
import { FEED, FEED_RULES, HELMINTH_SOURCE, INFUSE, INVIGORATION, LIMITS, METAMORPHOSIS, OWN_ABILITIES, OWN_NOTE, SECRETIONS, SECRETION_GAIN, SHARDS, SUBSUMABLE, SUBSUME, TIPS, UNLOCK, XP_SOURCES, type Cost } from "../data/helminth";
const fmt = (n: number) => n.toLocaleString();
const SC: Record<string, string> = { Bile: "#7aa84a", Biotics: "#d17aa3", Calx: "#c9a961", Oxides: "#5ea2ff", Pheromones: "#b98cf0", Synthetics: "#7fd0c9", "Sentient Appetite": "#ff9d97" };
const Cost3 = ({ label, c }: { label: string; c: Cost | null }) => { const tr = useT(); return <div className="cost"><small>{label}</small>{c ? c.map(([s, p]) => <span key={s} className={"secchip s-" + s}>{s} <i>{p}%</i></span>) : <span className="muted">{tr("hlNotListed")}</span>}</div>; };
/** The Helminth: what it does, how to feed it, how to subsume and infuse abilities, with the wiki's numbers. */
export default function Helminth() {
  const tr = useT(), tabs = [["unlock", tr("hlTabUnlock")], ["feeding", tr("hlTabFeeding")], ["subsume", tr("hlTabSubsume")], ["meta", tr("hlTabMeta")], ["table", tr("hlTabTable")], ["own", tr("hlTabOwn")], ["invig", "Invigoration"], ["shards", "Archon Shards"]] as const, srcLink = <a href={HELMINTH_SOURCE.url} target="_blank" rel="noreferrer">{HELMINTH_SOURCE.label}</a>, masteryLink = <Link to="/mastery">{tr("hlMasteryLink")}</Link>, [q, setQ] = useState(""), dq = useDeferredValue(q.trim().toLowerCase()), [fq, setFq] = useState(""), df = useDeferredValue(fq.trim().toLowerCase()), [role, setRole] = useState(""), [sec, setSec] = useState("");
  const roles = useMemo(() => [...new Set(SUBSUMABLE.flatMap(r => r[2].split(", ")))].sort(), []);
  const rows = SUBSUMABLE.filter(r => (!dq || (r[0] + " " + r[1]).toLowerCase().includes(dq)) && (!role || r[2].split(", ").includes(role)) && (!sec || r[3].some(c => c[0] === sec) === false));
  const feed = df.length >= 2 ? SECRETIONS.flatMap(s => FEED[s].filter(f => f[1].toLowerCase().includes(df)).map(f => ({ s: s as string, f }))).concat((FEED["Sentient Appetite"]).filter(f => f[1].toLowerCase().includes(df)).map(f => ({ s: "Sentient Appetite", f }))) : [];
  return (<><PageHead title={tr("helminth")} art={<ItemArt file={null} name="Helminth" size={64} fallback={<span aria-hidden="true">✦</span>} />}>{tr("hlLead")}</PageHead>
    <SectionTabs items={tabs} />
    <section id="unlock" className="gcard sec"><h2>{tr("hlUnlock")}</h2><div className="cols">
      <article className="minicard"><h4>{tr("hlStep1")}</h4><p>{UNLOCK.segment}</p></article><article className="minicard"><h4>{tr("hlStep2")}</h4><p>{UNLOCK.build}</p></article><article className="minicard"><h4>{tr("hlStep3")}</h4><p>{UNLOCK.after}</p></article></div>
      <p className="note">{UNLOCK.cyst}</p></section>
    <section id="feeding" className="gcard sec"><h2>{tr("hlFeedingH")}</h2>
      <p>{tr("hlFeedingP")}</p>
      <div className="facts"><div className="fact"><b>{tr("hlUpTo", { n: SECRETION_GAIN.liked })}</b><span>{tr("hlLiked")}</span></div><div className="fact"><b>{SECRETION_GAIN.neutral}%</b><span>{tr("hlNeutral")}</span></div><div className="fact"><b>{SECRETION_GAIN.disliked}%</b><span>{tr("hlDisliked")}</span></div><div className="fact"><b>{SECRETION_GAIN.hated}%</b><span>{tr("hlHated")}</span></div></div>
      <ul>{FEED_RULES.map(r => <li key={r}>{r}</li>)}</ul>
      <h3>{tr("hlWhich")}</h3>
      <div className="bar"><input aria-label={tr("hlSearchRes")} placeholder={tr("hlTypeRes")} value={fq} onChange={e => setFq(e.target.value)} /></div>
      {df.length >= 2 && (feed.length ? <div className="found">{feed.map(({ s, f }) => <div key={f[1]} className={"rel s-" + s}><Pic name={f[1]} size={30} /><span className="tn"><b><Link to={`/farm/${encodeURIComponent(f[1])}`}>{f[1]}</Link></b><small>{s}{f[2] ? ` (${tr("hlDouble")})` : ""} · {tr("hlPerFeed", { n: fmt(f[0]) })}</small></span></div>)}</div> : <p className="muted">{tr("hlNotInList")}</p>)}
      <h3>{tr("hlEvery")}</h3>
      <div className="sgrid">{[...SECRETIONS, "Sentient Appetite" as const].map(s => <div key={s} className="seccard"><h3><span className="sdot" style={{ "--sc": SC[s] } as React.CSSProperties} />{s}</h3><span className="muted">{tr("hlResN", { n: FEED[s].length })}</span>
        <div className="scrollbox"><ul className="rows">{FEED[s].map(f => <li key={f[1]}><Pic name={f[1]} size={24} /><Link className="grow" to={`/farm/${encodeURIComponent(f[1])}`}>{f[1]}</Link>{f[2] && <span className="tag FRESH">{tr("hlDouble")}</span>}<span className="muted">{fmt(f[0])}</span></li>)}</ul></div></div>)}</div>
      <p className="muted">{tr("hlFeedNote")}</p></section>
    <section id="subsume" className="gcard sec"><h2>{tr("hlSubsumeH")}</h2>
      <div className="cols"><article className="minicard"><h3>{tr("hlSubsumeTake")}</h3><ul>{SUBSUME.map(s => <li key={s}>{s}</li>)}</ul></article>
        <article className="minicard"><h3>{tr("hlInfusePut")}</h3><ul>{INFUSE.map(s => <li key={s}>{s}</li>)}</ul></article></div>
      <h3>{tr("hlDmgRestr")}</h3><p>{LIMITS.text}</p><div className="cgrid wide">{LIMITS.pairs.map(([w, a]) => <div key={w} className="rel"><Pic name={w} size={30} /><span className="tn"><b>{w}</b><small>{tr("hlReplacesOnly", { a })}</small></span></div>)}</div><p className="muted">{LIMITS.note}</p>
      <h3>{tr("hlTips")}</h3><ul>{TIPS.map(s => <li key={s}>{s}</li>)}</ul></section>
    <section id="meta" className="gcard sec"><h2>{tr("hlMetaH")}</h2>
      <p>{tr("hlMetaP")}</p>
      <div className="rungs">{METAMORPHOSIS.map(([r, a, b, u]) => <div key={r} className="rung"><span>{tr("synLblRank")}</span><b>{r}</b><span>{tr("hlFromPrev", { n: fmt(a) })}</span><span>{tr("hlTotal", { n: fmt(b) })}</span><span style={{ color: "var(--t2)", marginTop: ".2rem" }}>{u}</span></div>)}</div>
      <h3>{tr("hlXpPer")}</h3><ul>{XP_SOURCES.map(([a, b]) => <li key={a}><b>{a}:</b> {b}</li>)}</ul></section>
    <section id="table" className="gcard sec"><h2>{tr("hlTableH")}</h2>
      <p>{tr("hlTableP")}</p>
      <div className="bar"><input aria-label={tr("hlSearchWf")} placeholder={tr("hlSearchWf")} value={q} onChange={e => setQ(e.target.value)} />
        <label>{tr("hlRole")} <select value={role} onChange={e => setRole(e.target.value)}><option value="">{tr("hlAny")}</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
        <label>{tr("hlAvoid")} <select value={sec} onChange={e => setSec(e.target.value)}><option value="">{tr("hlNone")}</option>{SECRETIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></label><span className="muted">{tr("hlOfN", { n: rows.length, total: SUBSUMABLE.length })}</span></div>
      <div className="scrollbox"><div className="cgrid wide">{rows.map(r => <article key={r[0]} className="abcard"><div className="top"><Pic name={r[0]} size={40} /><div style={{ minWidth: 0 }}><b>{r[1]}</b><span className="muted">{r[0]}</span></div></div>
        <div>{r[2].split(", ").map(x => <span key={x} className="rolechip" style={{ marginRight: ".25rem" }}>{x}</span>)}</div>
        <Cost3 label={tr("hlSubsume")} c={r[3]} /><Cost3 label={tr("hlInfuse")} c={r[4]} /><span className="muted">{tr("hlXpInj", { n: r[5] ?? "?" })}</span></article>)}</div>
        {!rows.length && <p className="muted">{tr("hlNoWf")}</p>}</div>
      <p className="muted">{tr("hlTableNote")}</p></section>
    <section id="own" className="gcard sec"><h2>{tr("hlOwnH")}</h2><p>{OWN_NOTE}</p>
      <div className="cgrid wide">{OWN_ABILITIES.map(([n, e, d]) => <article key={n} className="minicard"><h4>{n}</h4><p className="muted" style={{ margin: 0 }}>{d}</p><span className="tag" style={{ marginTop: ".4rem", display: "inline-block" }}>{tr("hlEnergy", { n: e })}</span></article>)}</div></section>
    <section id="invig" className="gcard sec"><h2>Invigoration</h2><p>{INVIGORATION.unlock}</p><ul>{INVIGORATION.how.map(s => <li key={s}>{s}</li>)}</ul>
      <div className="cols"><article className="minicard"><h3>{tr("hlOffense")}</h3><ul>{INVIGORATION.offense.map(s => <li key={s}>{s}</li>)}</ul></article><article className="minicard"><h3>{tr("hlUtility")}</h3><ul>{INVIGORATION.utility.map(s => <li key={s}>{s}</li>)}</ul></article></div>
      <p className="muted">{INVIGORATION.note}</p></section>
    <section id="shards" className="gcard sec"><h2>Archon Shards</h2><p>{SHARDS.unlock}</p>
      <div className="cols"><article className="minicard"><h3>{tr("hlRemoving")}</h3><ul>{SHARDS.unsocket.map(([s, x]) => <li key={s}>{tr("hlShardReturns", { color: s, x })}</li>)}</ul><p className="muted">{SHARDS.unsocketNote}</p></article>
        <article className="minicard"><h3>{tr("hlFusion")}</h3><ul>{SHARDS.fusion.map(s => <li key={s}>{s}</li>)}</ul></article></div>
      <h3>{tr("hlWhatColor")}</h3><div className="sgrid">{Object.entries(SHARDS.buffs).map(([c, b]) => <div key={c} className="seccard"><h3>{c}</h3><ul>{b.map(x => <li key={x}>{x}</li>)}</ul></div>)}</div>
      <p className="muted">{SHARDS.buffNote}</p></section>
    <p className="srclist">{rich(tr("hlSource", { date: HELMINTH_SOURCE.verified }), { link: srcLink, mastery: masteryLink })}</p></>);
}
