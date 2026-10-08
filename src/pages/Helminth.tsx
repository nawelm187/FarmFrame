import type React from "react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ItemArt, { Pic } from "../ItemArt";
import { PageHead, SectionTabs } from "../ui";
import { FEED, FEED_RULES, HELMINTH_SOURCE, INFUSE, INVIGORATION, LIMITS, METAMORPHOSIS, OWN_ABILITIES, OWN_NOTE, SECRETIONS, SECRETION_GAIN, SHARDS, SUBSUMABLE, SUBSUME, TIPS, UNLOCK, XP_SOURCES, type Cost } from "../data/helminth";
const fmt = (n: number) => n.toLocaleString();
const SC: Record<string, string> = { Bile: "#7aa84a", Biotics: "#d17aa3", Calx: "#c9a961", Oxides: "#5ea2ff", Pheromones: "#b98cf0", Synthetics: "#7fd0c9", "Sentient Appetite": "#ff9d97" };
const TABS = [["unlock", "Unlock"], ["feeding", "Feeding"], ["subsume", "Subsume and infuse"], ["meta", "Metamorphosis"], ["table", "Ability table"], ["own", "Its own abilities"], ["invig", "Invigoration"], ["shards", "Archon Shards"]] as const;
const Cost3 = ({ label, c }: { label: string; c: Cost | null }) => <div className="cost"><small>{label}</small>{c ? c.map(([s, p]) => <span key={s} className={"secchip s-" + s}>{s} <i>{p}%</i></span>) : <span className="muted">not listed</span>}</div>;
/** The Helminth: what it does, how to feed it, how to subsume and infuse abilities, with the wiki's numbers. */
export default function Helminth() {
  const [q, setQ] = useState(""), dq = useDeferredValue(q.trim().toLowerCase()), [fq, setFq] = useState(""), df = useDeferredValue(fq.trim().toLowerCase()), [role, setRole] = useState(""), [sec, setSec] = useState("");
  const roles = useMemo(() => [...new Set(SUBSUMABLE.flatMap(r => r[2].split(", ")))].sort(), []);
  const rows = SUBSUMABLE.filter(r => (!dq || (r[0] + " " + r[1]).toLowerCase().includes(dq)) && (!role || r[2].split(", ").includes(role)) && (!sec || r[3].some(c => c[0] === sec) === false));
  const feed = df.length >= 2 ? SECRETIONS.flatMap(s => FEED[s].filter(f => f[1].toLowerCase().includes(df)).map(f => ({ s: s as string, f }))).concat((FEED["Sentient Appetite"]).filter(f => f[1].toLowerCase().includes(df)).map(f => ({ s: "Sentient Appetite", f }))) : [];
  return (<><PageHead title="Helminth" art={<ItemArt file={null} name="Helminth" size={64} fallback={<span aria-hidden="true">✦</span>} />}>The Helminth lives in your Orbiter and does the "biological functions" of your Warframes. Feed it resources and it makes Secretions; spend Secretions to take an ability from one Warframe and put it on another (Subsume and Infuse), to Invigorate a Warframe for a week, or to imbue Archon Shards. Everything below follows the Warframe Wiki.</PageHead>
    <SectionTabs items={TABS} />
    <section id="unlock" className="gcard sec"><h2>How to unlock it</h2><div className="cols">
      <div className="minicard"><h4>1. Get the segment</h4><p>{UNLOCK.segment}</p></div><div className="minicard"><h4>2. Build it</h4><p>{UNLOCK.build}</p></div><div className="minicard"><h4>3. Install it</h4><p>{UNLOCK.after}</p></div></div>
      <p className="note">{UNLOCK.cyst}</p></section>
    <section id="feeding" className="gcard sec"><h2>Feeding it: Secretions</h2>
      <p>Almost any resource can be fed. Each resource turns into one of six Secretions. The amount you get depends on whether the Helminth likes the resource right now.</p>
      <div className="facts"><div className="fact"><b>up to {SECRETION_GAIN.liked}%</b><span>Liked (green arrow) · 200 xp</span></div><div className="fact"><b>{SECRETION_GAIN.neutral}%</b><span>Neutral (no arrow) · 100 xp</span></div><div className="fact"><b>{SECRETION_GAIN.disliked}%</b><span>Disliked · 46 xp</span></div><div className="fact"><b>{SECRETION_GAIN.hated}%</b><span>Hated (red arrow) · 20 xp</span></div></div>
      <ul>{FEED_RULES.map(r => <li key={r}>{r}</li>)}</ul>
      <h3>Which secretion does a resource make?</h3>
      <div className="bar"><input aria-label="Search a resource" placeholder="Type a resource, e.g. Plastids" value={fq} onChange={e => setFq(e.target.value)} /></div>
      {df.length >= 2 && (feed.length ? <div className="found">{feed.map(({ s, f }) => <div key={f[1]} className={"rel s-" + s}><Pic name={f[1]} size={30} /><span className="tn"><b><Link to={`/farm/${encodeURIComponent(f[1])}`}>{f[1]}</Link></b><small>{s}{f[2] ? " (double)" : ""} · {fmt(f[0])} per feeding</small></span></div>)}</div> : <p className="muted">That resource is not in the wiki's list.</p>)}
      <h3>Every resource, by secretion</h3>
      <div className="sgrid">{[...SECRETIONS, "Sentient Appetite" as const].map(s => <div key={s} className="seccard"><h3><span className="sdot" style={{ "--sc": SC[s] } as React.CSSProperties} />{s}</h3><span className="muted">{FEED[s].length} resources</span>
        <div className="scrollbox"><ul className="rows">{FEED[s].map(f => <li key={f[1]}><Pic name={f[1]} size={24} /><Link className="grow" to={`/farm/${encodeURIComponent(f[1])}`}>{f[1]}</Link>{f[2] && <span className="tag FRESH">double</span>}<span className="muted">{fmt(f[0])}</span></li>)}</ul></div></div>)}</div>
      <p className="muted">The number is the amount consumed as the wiki lists it. Sentient Appetite resources (unlocked at Metamorphosis rank 8) restore the Helminth's interest in a disliked resource.</p></section>
    <section id="subsume" className="gcard sec"><h2>Subsume an ability, then use it better</h2>
      <div className="cols"><div className="minicard"><h3>Subsume (take an ability)</h3><ul>{SUBSUME.map(s => <li key={s}>{s}</li>)}</ul></div>
        <div className="minicard"><h3>Infuse (put it on a Warframe)</h3><ul>{INFUSE.map(s => <li key={s}>{s}</li>)}</ul></div></div>
      <h3>Damage buff restrictions</h3><p>{LIMITS.text}</p><div className="cgrid wide">{LIMITS.pairs.map(([w, a]) => <div key={w} className="rel"><Pic name={w} size={30} /><span className="tn"><b>{w}</b><small>replaces only {a}</small></span></div>)}</div><p className="muted">{LIMITS.note}</p>
      <h3>Tips from the wiki</h3><ul>{TIPS.map(s => <li key={s}>{s}</li>)}</ul></section>
    <section id="meta" className="gcard sec"><h2>Metamorphosis (the Helminth's rank)</h2>
      <p>Feeding it, subsuming and infusing all give Metamorphosis experience. Each rank unlocks something: a Helminth ability, more subsume slots, or Sentient Appetite.</p>
      <div className="rungs">{METAMORPHOSIS.map(([r, a, b, u]) => <div key={r} className="rung"><span>Rank</span><b>{r}</b><span>{fmt(a)} from previous</span><span>{fmt(b)} total</span><span style={{ color: "var(--t2)", marginTop: ".2rem" }}>{u}</span></div>)}</div>
      <h3>Experience per action</h3><ul>{XP_SOURCES.map(([a, b]) => <li key={a}><b>{a}:</b> {b}</li>)}</ul></section>
    <section id="table" className="gcard sec"><h2>Which ability does each Warframe give?</h2>
      <p>Subsuming and injecting each cost three secretions, in percent. Lower is cheaper. Pick the ability by what it does for you.</p>
      <div className="bar"><input aria-label="Search a Warframe or ability" placeholder="Search a Warframe or ability" value={q} onChange={e => setQ(e.target.value)} />
        <label>Role <select value={role} onChange={e => setRole(e.target.value)}><option value="">Any</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
        <label>Avoid secretion <select value={sec} onChange={e => setSec(e.target.value)}><option value="">None</option>{SECRETIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></label><span className="muted">{rows.length} of {SUBSUMABLE.length}</span></div>
      <div className="scrollbox"><div className="cgrid wide">{rows.map(r => <article key={r[0]} className="abcard"><div className="top"><Pic name={r[0]} size={40} /><div style={{ minWidth: 0 }}><b>{r[1]}</b><span className="muted">{r[0]}</span></div></div>
        <div>{r[2].split(", ").map(x => <span key={x} className="rolechip" style={{ marginRight: ".25rem" }}>{x}</span>)}</div>
        <Cost3 label="Subsume" c={r[3]} /><Cost3 label="Infuse" c={r[4]} /><span className="muted">{r[5] ?? "?"} xp per injection</span></article>)}</div>
        {!rows.length && <p className="muted">No Warframe matches.</p>}</div>
      <p className="muted">"Avoid secretion" hides abilities that need that secretion to subsume. Costs of 82.5 / 55 / 65 (subsume) and 19 / 19 / 60 (infuse) look like the wiki's default values for newer Warframes. A "?" means the wiki shows no value. This table was read from screenshots of the wiki, so check the wiki before relying on one number.</p></section>
    <section id="own" className="gcard sec"><h2>The Helminth's own abilities</h2><p>{OWN_NOTE}</p>
      <div className="cgrid wide">{OWN_ABILITIES.map(([n, e, d]) => <div key={n} className="minicard"><h4>{n}</h4><p className="muted" style={{ margin: 0 }}>{d}</p><span className="tag" style={{ marginTop: ".4rem", display: "inline-block" }}>{e} energy</span></div>)}</div></section>
    <section id="invig" className="gcard sec"><h2>Invigoration</h2><p>{INVIGORATION.unlock}</p><ul>{INVIGORATION.how.map(s => <li key={s}>{s}</li>)}</ul>
      <div className="cols"><div className="minicard"><h3>Offense</h3><ul>{INVIGORATION.offense.map(s => <li key={s}>{s}</li>)}</ul></div><div className="minicard"><h3>Utility</h3><ul>{INVIGORATION.utility.map(s => <li key={s}>{s}</li>)}</ul></div></div>
      <p className="muted">{INVIGORATION.note}</p></section>
    <section id="shards" className="gcard sec"><h2>Archon Shards</h2><p>{SHARDS.unlock}</p>
      <div className="cols"><div className="minicard"><h3>Removing a shard</h3><ul>{SHARDS.unsocket.map(([s, x]) => <li key={s}>{s} Archon Shard returns {x}</li>)}</ul><p className="muted">{SHARDS.unsocketNote}</p></div>
        <div className="minicard"><h3>Fusion</h3><ul>{SHARDS.fusion.map(s => <li key={s}>{s}</li>)}</ul></div></div>
      <h3>What each color gives</h3><div className="sgrid">{Object.entries(SHARDS.buffs).map(([c, b]) => <div key={c} className="seccard"><h3>{c}</h3><ul>{b.map(x => <li key={x}>{x}</li>)}</ul></div>)}</div>
      <p className="muted">{SHARDS.buffNote}</p></section>
    <p className="srclist">Source: <a href={HELMINTH_SOURCE.url} target="_blank" rel="noreferrer">{HELMINTH_SOURCE.label}</a>, typed in by hand from screenshots of the page on {HELMINTH_SOURCE.verified}. Game updates can change numbers. See also the <Link to="/mastery">Mastery checklist</Link>.</p></>);
}
