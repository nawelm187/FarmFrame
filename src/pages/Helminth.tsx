import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pic } from "../ItemArt";
import { FEED, FEED_RULES, HELMINTH_SOURCE, INFUSE, INVIGORATION, LIMITS, METAMORPHOSIS, OWN_ABILITIES, OWN_NOTE, SECRETIONS, SECRETION_GAIN, SHARDS, SUBSUMABLE, SUBSUME, TIPS, UNLOCK, XP_SOURCES, type Cost } from "../data/helminth";
const fmt = (n: number) => n.toLocaleString();
const costText = (c: Cost | null) => (c ? c.map(([s, p]) => `${s} ${p}%`).join(", ") : "not listed");
/** The Helminth: what it does, how to feed it, how to subsume and infuse abilities, with the wiki's numbers. */
export default function Helminth() {
  const [q, setQ] = useState(""), dq = useDeferredValue(q.trim().toLowerCase()), [fq, setFq] = useState(""), df = useDeferredValue(fq.trim().toLowerCase()), [role, setRole] = useState(""), [sec, setSec] = useState("");
  const roles = useMemo(() => [...new Set(SUBSUMABLE.flatMap(r => r[2].split(", ")))].sort(), []);
  const rows = SUBSUMABLE.filter(r => (!dq || (r[0] + " " + r[1]).toLowerCase().includes(dq)) && (!role || r[2].split(", ").includes(role)) && (!sec || r[3].some(c => c[0] === sec) === false));
  const feed = df.length >= 2 ? SECRETIONS.flatMap(s => FEED[s].filter(f => f[1].toLowerCase().includes(df)).map(f => ({ s: s as string, f }))).concat((FEED["Sentient Appetite"]).filter(f => f[1].toLowerCase().includes(df)).map(f => ({ s: "Sentient Appetite", f }))) : [];
  return (<><h1>Helminth</h1>
    <p className="lead">The Helminth lives in your Orbiter and does the "biological functions" of your Warframes. Feed it resources and it makes Secretions; spend Secretions to take an ability from one Warframe and put it on another (Subsume and Infuse), to Invigorate a Warframe for a week, or to imbue Archon Shards. Everything below follows the Warframe Wiki.</p>
    <nav className="chips" aria-label="On this page">{[["unlock", "Unlock"], ["feeding", "Feeding"], ["subsume", "Subsume and infuse"], ["meta", "Metamorphosis"], ["table", "Ability table"], ["own", "Its own abilities"], ["invig", "Invigoration"], ["shards", "Archon Shards"]].map(([id, t]) => <a key={id} className="btn" href={`#${id}`} onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }}>{t}</a>)}</nav>
    <section id="unlock" className="gcard"><h2>How to unlock it</h2><ul><li>{UNLOCK.segment}</li><li>{UNLOCK.build}</li><li>{UNLOCK.after}</li><li className="muted">{UNLOCK.cyst}</li></ul></section>
    <section id="feeding" className="gcard"><h2>Feeding it: Secretions</h2>
      <p>Almost any resource can be fed. Each resource turns into one of six Secretions: {SECRETIONS.join(", ")}. The amount you get depends on whether the Helminth likes the resource right now.</p>
      <div className="wrap"><table><thead><tr><th>Appetite</th><th className="num">Secretion gained</th><th className="num">Metamorphosis xp</th></tr></thead><tbody>
        <tr><td>Liked (green arrow)</td><td className="num">up to {SECRETION_GAIN.liked}%</td><td className="num">200</td></tr><tr><td>Neutral (no arrow)</td><td className="num">{SECRETION_GAIN.neutral}%</td><td className="num">100</td></tr>
        <tr><td>Disliked</td><td className="num">{SECRETION_GAIN.disliked}%</td><td className="num">46</td></tr><tr><td>Hated (red arrow)</td><td className="num">{SECRETION_GAIN.hated}%</td><td className="num">20</td></tr></tbody></table></div>
      <ul>{FEED_RULES.map(r => <li key={r}>{r}</li>)}</ul>
      <h3>Which secretion does a resource make?</h3>
      <div className="bar"><input aria-label="Search a resource" placeholder="Type a resource, e.g. Plastids" value={fq} onChange={e => setFq(e.target.value)} /></div>
      {df.length >= 2 && (feed.length ? <ul className="list">{feed.map(({ s, f }) => <li key={f[1]}><span><Pic name={f[1]} size={24} /> <Link to={`/farm/${encodeURIComponent(f[1])}`}>{f[1]}</Link></span><span><b>{s}</b>{f[2] ? " (double)" : ""}</span><span className="muted">{fmt(f[0])}</span></li>)}</ul> : <p className="muted">That resource is not in the wiki's list.</p>)}
      {[...SECRETIONS, "Sentient Appetite" as const].map(s => <details key={s}><summary><b>{s}</b> <span className="muted">{FEED[s].length} resources</span></summary>
        <ul className="list">{FEED[s].map(f => <li key={f[1]}><span><Pic name={f[1]} size={22} /> <Link to={`/farm/${encodeURIComponent(f[1])}`}>{f[1]}</Link>{f[2] && <span className="tag FRESH"> double</span>}</span><span className="muted">{fmt(f[0])}</span></li>)}</ul></details>)}
      <p className="muted">The number is the amount consumed as the wiki lists it. Sentient Appetite resources (unlocked at Metamorphosis rank 8) restore the Helminth's interest in a disliked resource.</p></section>
    <section id="subsume" className="gcard"><h2>Subsume an ability, then use it better</h2>
      <h3>Subsume (take an ability)</h3><ul>{SUBSUME.map(s => <li key={s}>{s}</li>)}</ul>
      <h3>Infuse (put it on a Warframe)</h3><ul>{INFUSE.map(s => <li key={s}>{s}</li>)}</ul>
      <h3>Damage buff restrictions</h3><p>{LIMITS.text}</p><ul>{LIMITS.pairs.map(([w, a]) => <li key={w}>{w}: replaces only {a}</li>)}</ul><p className="muted">{LIMITS.note}</p>
      <h3>Tips from the wiki</h3><ul>{TIPS.map(s => <li key={s}>{s}</li>)}</ul></section>
    <section id="meta" className="gcard"><h2>Metamorphosis (the Helminth's rank)</h2>
      <p>Feeding it, subsuming and infusing all give Metamorphosis experience. Each rank unlocks something: a Helminth ability, more subsume slots, or Sentient Appetite.</p>
      <div className="wrap"><table><thead><tr><th>Rank</th><th className="num">From previous</th><th className="num">From rank 0</th><th>Unlocks</th></tr></thead><tbody>{METAMORPHOSIS.map(([r, a, b, u]) => <tr key={r}><td>{r}</td><td className="num">{fmt(a)}</td><td className="num">{fmt(b)}</td><td>{u}</td></tr>)}</tbody></table></div>
      <h3>Experience per action</h3><ul>{XP_SOURCES.map(([a, b]) => <li key={a}><b>{a}:</b> {b}</li>)}</ul></section>
    <section id="table" className="gcard"><h2>Which ability does each Warframe give?</h2>
      <p>Subsuming and injecting each cost three secretions, in percent. Lower is cheaper. Pick the ability by what it does for you.</p>
      <div className="bar"><input aria-label="Search a Warframe or ability" placeholder="Search a Warframe or ability" value={q} onChange={e => setQ(e.target.value)} />
        <label>Role <select value={role} onChange={e => setRole(e.target.value)}><option value="">Any</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
        <label>Avoid secretion <select value={sec} onChange={e => setSec(e.target.value)}><option value="">None</option>{SECRETIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></label></div>
      <div className="wrap"><table><thead><tr><th>Warframe</th><th>Ability</th><th>Role</th><th>To subsume</th><th>To infuse</th><th className="num">xp / injection</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r[0]}><td><Pic name={r[0]} size={22} /> {r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{costText(r[3])}</td><td>{costText(r[4])}</td><td className="num">{r[5] ?? "?"}</td></tr>)}{!rows.length && <tr><td colSpan={6} className="muted">No Warframe matches.</td></tr>}</tbody></table></div>
      <p className="muted">"Avoid secretion" hides abilities that need that secretion to subsume. Costs of 82.5 / 55 / 65 (subsume) and 19 / 19 / 60 (infuse) look like the wiki's default values for newer Warframes. A "?" means the wiki shows no value. This table was read from screenshots of the wiki, so check the wiki before relying on one number.</p></section>
    <section id="own" className="gcard"><h2>The Helminth's own abilities</h2><p>{OWN_NOTE}</p>
      <ul className="list">{OWN_ABILITIES.map(([n, e, d]) => <li key={n}><span><b>{n}</b><div className="muted">{d}</div></span><span className="muted">{e} energy</span></li>)}</ul></section>
    <section id="invig" className="gcard"><h2>Invigoration</h2><p>{INVIGORATION.unlock}</p><ul>{INVIGORATION.how.map(s => <li key={s}>{s}</li>)}</ul>
      <div className="wrap"><table><thead><tr><th>Offense</th><th>Utility</th></tr></thead><tbody><tr><td><ul>{INVIGORATION.offense.map(s => <li key={s}>{s}</li>)}</ul></td><td><ul>{INVIGORATION.utility.map(s => <li key={s}>{s}</li>)}</ul></td></tr></tbody></table></div>
      <p className="muted">{INVIGORATION.note}</p></section>
    <section id="shards" className="gcard"><h2>Archon Shards</h2><p>{SHARDS.unlock}</p>
      <h3>Removing a shard</h3><ul>{SHARDS.unsocket.map(([s, x]) => <li key={s}>{s} Archon Shard returns {x}</li>)}</ul><p className="muted">{SHARDS.unsocketNote}</p>
      <h3>Fusion</h3><ul>{SHARDS.fusion.map(s => <li key={s}>{s}</li>)}</ul>
      <h3>What each color gives</h3>{Object.entries(SHARDS.buffs).map(([c, b]) => <details key={c}><summary><b>{c}</b></summary><ul>{b.map(x => <li key={x}>{x}</li>)}</ul></details>)}
      <p className="muted">{SHARDS.buffNote}</p></section>
    <p className="muted">Source: <a href={HELMINTH_SOURCE.url} target="_blank" rel="noreferrer">{HELMINTH_SOURCE.label}</a>, typed in by hand from screenshots of the page on {HELMINTH_SOURCE.verified}. Game updates can change numbers. See also the <Link to="/mastery">Mastery checklist</Link>.</p></>);
}
