import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../lib/useCatalog";
const STORY: [string, string][] = [
  ["The Orokin and the Old War", "Long ago the Orokin ruled the Origin System with enormous technological power, built on the Void, a strange dimension they learned to draw upon. Their golden age ended in a long war against the Sentients, machines that came from beyond the system."],
  ["The Zariman and the first Tenno", "The Zariman Ten Zero was an Orokin colony ship that was lost in the Void. The adults aboard were broken by what they found there, but the children survived with strange powers. Those children are the origin of the Tenno."],
  ["Warframes and the fall of the Orokin", "The Orokin put the Tenno to use as warriors who command Warframes, living biomechanical suits. The empire eventually collapsed, and the Tenno were left in a long sleep until a guiding voice known as the Lotus woke them centuries later."],
  ["The system today", "Three major powers now fight over the ruins. The Grineer are a militarised empire of clones. The Corpus are a profit-driven corporation. The Infested are a living plague that spreads through machines and flesh. The Sentients are also still out there."],
  ["Newer chapters", "The Duviri Paradox follows the Drifter in the strange land of Duviri. Warframe: 1999 is set in the town of Hollvania, following the Hex, a group of people turned into Protoframes."],
];
const COMICS: [string, string][] = [
  ["WARFRAME: Ghouls", "A five-issue comic published from 2017 that takes place before the events of the game. The Tenno, a blinded Ostron girl called Mitsuki and a Solaris United operative known as Little Duck fight Captain Vor's Grineer while trying to uncover the secrets of an ancient Orokin vault."],
  ["Warframe Fragments", "Short webcomics, What Remains, Rell and The Ascension, that tell the backstory of characters and quests in the game."],
  ["WARFRAME: 1999", "A 33-page webcomic written by Cam Rogers with art by Karu. It explores the origins of the Protoframes and their early search for the elusive Doktor Friday."],
];
export default function Lore() {
  const { items } = useCatalog("warframe"), [q, setQ] = useState(""), dq = useDeferredValue(q).trim().toLowerCase();
  const list = (items ?? []).filter(i => !i.isPrime && i.description && (!dq || i.name.toLowerCase().includes(dq) || i.description.toLowerCase().includes(dq)));
  return (<><h1>Lore</h1>
    <p className="lead">A short summary of the Warframe story, written for FarmFrame. Details change with every update, so it may not include the newest chapters.</p>
    {STORY.map(([t, d]) => <section key={t}><h2>{t}</h2><p>{d}</p></section>)}
    <h2>Comics</h2>
    <p className="muted">The comics belong to Digital Extremes and are not hosted here. These are summaries so you know what each one covers.</p>
    <ul className="abil">{COMICS.map(([t, d]) => <li key={t}><b>{t}</b><span className="muted">{d}</span></li>)}</ul>
    <h2>Codex: the Warframes</h2>
    <div className="bar"><input aria-label="Search the codex" placeholder="Search a Warframe or a word" value={q} onChange={e => setQ(e.target.value)} /></div>
    {!items ? <p className="muted">Loading the Warframes…</p> : !list.length ? <p className="muted">No Warframe matches.</p> :
      <ul className="abil">{list.slice(0, 40).map(i => <li key={i.slug}><Link to={`/warframe/${i.slug}`}><b>{i.name}</b></Link><span className="muted">{i.description}</span></li>)}</ul>}
    {list.length > 40 && <p className="muted">Showing 40 of {list.length}. Search to narrow it down.</p>}
  </>);
}
