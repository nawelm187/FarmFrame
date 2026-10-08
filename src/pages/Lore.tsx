import { placeKey } from "../lib/partImg";
import { useDeferredValue, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FactionArt from "../FactionArt";
import { Pic } from "../ItemArt";
import { useCatalog } from "../lib/useCatalog";
import { BEGAN, ERAS, FACTIONS, PLACES } from "../lib/lore";
const W = "https://www.warframe.com/en/media/comics/";
const COMICS: { t: string; d: string; links: [string, string][] }[] = [
  { t: "WARFRAME: Ghouls", d: "A five-issue comic published from 2017 that takes place before the events of the game. The Tenno, a blinded Ostron girl called Mitsuki and a Solaris United operative known as Little Duck fight Captain Vor's Grineer while trying to uncover the secrets of an ancient Orokin vault.",
    links: [1, 2, 3, 4, 5].map(n => [`Issue ${n}`, `${W}ghouls${n}`]) },
  { t: "Warframe Fragments", d: "Short webcomics that tell the backstory of characters and quests in the game.",
    links: [["What Remains", W + "what-remains"], ["Rell", W + "rell"], ["The Ascension", W + "ascension"]] },
  { t: "WARFRAME: 1999", d: "A 33-page webcomic written by Cam Rogers with art by Karu. It explores the origins of the Protoframes and their early search for the elusive Doktor Friday.",
    links: [["Read it", W + "warframe1999"], ["Tapas", "https://tapas.io/episode/3361175"], ["Webtoon", "https://www.webtoons.com/en/canvas/warframe-1999-one-shot/list?title_no=1007254"], ["Imgur", "https://imgur.com/gallery/warframe-1999-one-shot-webcomic-fmPRjzS"]] },
];
const TINT: Record<string, [string, string]> = { Grineer: ["#e8895a", "#5a2a1b"], Corpus: ["#6fb4ff", "#12324f"], Infested: ["#9be86a", "#1f4a16"], Orokin: ["#f1d27a", "#4b3a12"], Other: ["#b69cff", "#2c1f5a"] };
const hash = (n: string) => [...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
/** Original planet badge: a shaded orb tinted by faction, with bands that differ per place (and a ring for Saturn). No network needed. */
const PLANET_FILES = import.meta.glob("../assets/planets/*.webp", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const PLANET_URLS = new Map(Object.entries(PLANET_FILES).map(([k, v]) => [k.replace(/^.*\//, "").replace(/\.webp$/, ""), v]));
function PlanetArt({ name, faction, size = 56 }: { name: string; faction: string; size?: number }) {
  const url = PLANET_URLS.get(placeKey(name));
  if (url) return <img className="planet" src={url} width={size} height={size} alt={name} loading="lazy" style={{ objectFit: "contain" }} />;
  const [hi, lo] = TINT[faction] ?? TINT.Other, h = hash(name), id = "pl" + h, b1 = 18 + (h % 20), b2 = 34 + ((h >> 3) % 18), tilt = (h % 40) - 20;
  return (<svg className="planet" viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={name}>
    <defs><radialGradient id={id} cx="35%" cy="30%" r="80%"><stop offset="0" stopColor={hi} /><stop offset="1" stopColor={lo} /></radialGradient><clipPath id={id + "c"}><circle cx="32" cy="32" r="20" /></clipPath></defs>
    <circle cx="32" cy="32" r="20" fill={`url(#${id})`} /><g clipPath={`url(#${id}c)`} transform={`rotate(${tilt} 32 32)`} opacity=".28"><rect x="8" y={b1} width="48" height="5" fill="#000" /><rect x="8" y={b2} width="48" height="7" fill="#fff" opacity=".5" /></g>
    {name === "Saturn" && <ellipse cx="32" cy="32" rx="29" ry="7" fill="none" stroke={hi} strokeWidth="2" opacity=".8" transform="rotate(-18 32 32)" />}
    <circle cx="32" cy="32" r="20.5" fill="none" stroke={hi} strokeOpacity=".5" /></svg>);
}
const TABS = [["story", "Story"], ["began", "How it began"], ["factions", "Factions"], ["places", "Places"], ["warframes", "Warframes"], ["comics", "Comics"]] as const;
type Tab = (typeof TABS)[number][0];
function Story() {
  const [i, setI] = useState(0), e = ERAS[i];
  return (<section aria-label="Story timeline"><div className="era" role="tablist" aria-label="Eras">{ERAS.map((x, k) => <button key={x.id} role="tab" aria-selected={k === i} className={"btn" + (k === i ? " on" : "")} onClick={() => setI(k)}><span className="muted">{k + 1}</span> {x.title}</button>)}</div>
    <article className="gcard lorecard" key={e.id}><div className="ghead"><div className="grow"><span className="kicker">{e.when}</span><h2>{e.title}</h2></div></div><p>{e.text}</p><div className="chips">{e.terms.map(t => <Link key={t} className="btn" to={`/lore?t=places&q=${encodeURIComponent(t)}`}>{t}</Link>)}</div>
      <div className="bar"><button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>← Previous</button><button className="btn" disabled={i === ERAS.length - 1} onClick={() => setI(i + 1)}>Next →</button></div></article></section>);
}
const Began = () => (<ol className="mile" aria-label="How Warframe began">{BEGAN.map((m, i) => <li key={m.when} style={{ animationDelay: i * 50 + "ms" }}><b className="when">{m.when}</b><p>{m.text}</p></li>)}</ol>);
function Factions() {
  const [open, setOpen] = useState<string | null>(null);
  return (<div className="lgrid">{FACTIONS.map(f => { const on = open === f.name; return (<article key={f.name} className={"gcard lcard" + (on ? " open" : "")}>
    <button className="lhead" aria-expanded={on} onClick={() => setOpen(on ? null : f.name)}><FactionArt f={f.art} size={56} /><span className="grow"><b>{f.name}</b><span className="kicker">{f.tag}</span></span><span aria-hidden="true">{on ? "−" : "+"}</span></button>
    {on && <div className="lbody"><p>{f.text}</p><div className="chips">{f.places.map(p => <Link key={p} className="btn" to={`/lore?t=places&q=${encodeURIComponent(p)}`}>{p}</Link>)}</div></div>}</article>); })}</div>);
}
function Places({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  const [fac, setFac] = useState("All"), [open, setOpen] = useState<string | null>(null), l = q.trim().toLowerCase();
  const list = PLACES.filter(p => (fac === "All" || p.faction === fac) && (!l || p.name.toLowerCase().includes(l) || p.text.toLowerCase().includes(l) || p.faction.toLowerCase().includes(l)));
  return (<><div className="bar"><input aria-label="Search places" placeholder="Search a place or faction" value={q} onChange={e => setQ(e.target.value)} /></div>
    <div className="chips" role="group" aria-label="Faction">{["All", "Grineer", "Corpus", "Infested", "Orokin", "Other"].map(f => <button key={f} className={"btn" + (fac === f ? " on" : "")} aria-pressed={fac === f} onClick={() => setFac(f)}>{f}</button>)}</div>
    {!list.length ? <p className="muted">No place matches.</p> : <div className="lgrid">{list.map(p => { const on = open === p.name; return (<article key={p.name} className={"gcard lcard" + (on ? " open" : "")}>
      <button className="lhead" aria-expanded={on} onClick={() => setOpen(on ? null : p.name)}><PlanetArt name={p.name} faction={p.faction} size={56} /><span className="grow"><b>{p.name}</b><span className="kicker">{p.faction}</span></span><span aria-hidden="true">{on ? "−" : "+"}</span></button>
      {on && <div className="lbody"><p>{p.text}</p></div>}</article>); })}</div>}</>);
}
function Frames({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  const { items } = useCatalog("warframe"), dq = useDeferredValue(q).trim().toLowerCase(), [open, setOpen] = useState<string | null>(null), [more, setMore] = useState(1);
  const list = (items ?? []).filter(i => !i.isPrime && i.description && (!dq || i.name.toLowerCase().includes(dq) || i.description.toLowerCase().includes(dq)));
  return (<><div className="bar"><input aria-label="Search the codex" placeholder="Search a Warframe or a word" value={q} onChange={e => { setQ(e.target.value); setMore(1); }} /></div>
    {!items ? <p className="muted">Loading the Warframes…</p> : !list.length ? <p className="muted">No Warframe matches.</p> :
      <div className="lgrid">{list.slice(0, 24 * more).map(i => { const on = open === i.slug; return (<article key={i.slug} className={"gcard lcard" + (on ? " open" : "")}>
        <button className="lhead" aria-expanded={on} onClick={() => setOpen(on ? null : i.slug)}><Pic name={i.name} size={56} /><span className="grow"><b>{i.name}</b>{!on && <span className="muted clamp">{i.description}</span>}</span><span aria-hidden="true">{on ? "−" : "+"}</span></button>
        {on && <div className="lbody"><p>{i.description}</p><Link className="btn" to={`/warframe/${i.slug}`}>Open {i.name}</Link></div>}</article>); })}</div>}
    {list.length > 24 * more && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({list.length - 24 * more} left)</button>}</>);
}
const Comics = () => (<><p className="muted">The comics belong to Digital Extremes and are not hosted here. Each button opens that comic directly in a new tab, so this page stays open.</p>
  <ul className="comics">{COMICS.map(c => <li key={c.t}><b>{c.t}</b><br /><span className="muted">{c.d}</span><div className="links">{c.links.map(([l, u]) => <a key={l} className="btn" href={u} target="_blank" rel="noopener noreferrer">{l}</a>)}</div></li>)}</ul></>);
export default function Lore() {
  const [sp, setSp] = useSearchParams(), t = (TABS.find(x => x[0] === sp.get("t"))?.[0] ?? "story") as Tab, q = sp.get("q") ?? "";
  const go = (x: Tab) => setSp(x === "story" ? {} : { t: x }, { replace: true });
  const setQ = (v: string) => { const n = new URLSearchParams(sp); if (v) n.set("q", v); else n.delete("q"); setSp(n, { replace: true }); };
  return (<><h1>Lore</h1><p className="lead">The story of the Origin System, how the game was made, its factions, places and Warframes. Written for FarmFrame; details change with every update, so the newest chapters may be missing.</p>
    <div className="chips tabs" role="tablist" aria-label="Lore sections">{TABS.map(([k, n]) => <button key={k} role="tab" aria-selected={t === k} className={"btn" + (t === k ? " on" : "")} onClick={() => go(k)}>{n}</button>)}</div>
    {t === "story" && <Story />}{t === "began" && <Began />}{t === "factions" && <Factions />}{t === "places" && <Places q={q} setQ={setQ} />}{t === "warframes" && <Frames q={q} setQ={setQ} />}{t === "comics" && <Comics />}</>);
}
