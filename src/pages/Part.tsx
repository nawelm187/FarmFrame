import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import RelicArt from "../RelicArt";
import SetPrice from "../SetPrice";
import { Credits, Plat } from "../Money";
import { imgRetry, imgUrl, type Cat } from "../lib/catalog";
import { useMany } from "../lib/data";
import { FIND, collect, parseRelics, query } from "../lib/drops";
import { byValue, relicsForPart, relicsOf } from "../lib/exact";
import { goalId, readGoals, writeGoals } from "../lib/goals";
import { MARKET_ENABLED, fetchAny, type Stat } from "../lib/market";
import { difficulty, resolvePart, type PartRef } from "../lib/part";
import { partTradable, setTradable } from "../lib/trade";
import { readTracked, writeTracked } from "../lib/track";
import { useCatalogs } from "../lib/useCatalog";
import { VAULT_ALT, VAULT_SRC, VAULT_URL, parseVault } from "../lib/vault";
import { Skeleton } from "./parts";
const CATLIST: Cat[] = ["warframe", "weapon", "companion", "archwing", "mod"];
const ALL = FIND.map(f => ({ id: f.id, file: f.file }));
type S = "loading" | "error" | "none" | { st: Stat; at: number };
const memo = new Map<string, S>();
/** Live market price of one item. Shown automatically; says plainly when there is none. */
function PartMarket({ names, tradable, label }: { names: string[]; tradable: boolean | null; label: string }) {
  const key = names.join("|"), [s, setS] = useState<S>(memo.get(key) ?? "loading");
  useEffect(() => {
    if (tradable === false || memo.has(key)) return; let dead = false; setS("loading");
    fetchAny(names).then(st => { const v: S = st ? { st, at: Date.now() } : "none"; memo.set(key, v); if (!dead) setS(v); }).catch(() => { if (!dead) setS("error"); });
    return () => { dead = true; };
  }, [key, tradable]); // eslint-disable-line react-hooks/exhaustive-deps
  return (<section className="panel" aria-label={label}><div className="row"><h3>{label}</h3><span className="tag UNAVAILABLE">Market, live</span></div>
    {tradable === false ? <p className="muted">This cannot be traded between players, so it has no player price.</p>
      : s === "loading" ? <div aria-hidden="true"><div className="sk" style={{ width: "45%" }} /></div>
      : s === "error" ? <p className="muted">Market data unavailable right now.</p>
      : s === "none" ? <p className="muted">Not listed on the market.</p>
      : <><div className="big"><b><Plat n={s.st.median} size={20} /></b> <span className="muted">median</span></div>
        <div className="muted">Low <Plat n={s.st.min} /> · high <Plat n={s.st.max} /> · {s.st.volume} traded in the last bucket · warframe.market, fetched {new Date(s.at).toLocaleTimeString()}. Market value, not a farming value.</div></>}</section>);
}
const LEVEL: Record<string, string> = { Easy: "FRESH", Medium: "STALE", Hard: "STALE", "Very hard": "ERROR", Unknown: "UNAVAILABLE" };
function PartView({ r }: { r: PartRef }) {
  const { entity: e, comp: c } = r, cat = r.cat, [done, setDone] = useState(false), [goal, setGoal] = useState(false);
  const [rr, vr, ...tabs] = useMany([{ id: "relics", file: "relics.json" }, { id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }, ...ALL]);
  const relics = relicsOf(rr.rec?.data), vault = parseVault(vr.rec?.data);
  const opts = relics ? relicsForPart(relics, e.name, c, vault).sort(byValue) : [], other = c.drops.filter(d => !/\b(Lith|Meso|Neo|Axi|Requiem)\b/i.test(d.location));
  const { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: tabs[i].rec, status: tabs[i].status })));
  const names = [r.title, `${e.name} ${c.name}`], fromTables = ok ? query(rows, r.title).filter(x => names.some(n => n.toLowerCase() === x.item.toLowerCase())).slice(0, 6) : [];
  const dif = difficulty(opts, other.length + fromTables.length), tr = partTradable(e, c), img = c.image ?? e.image, raw = e.raw;
  const price = typeof raw.buildPrice === "number" ? raw.buildPrice : null, time = typeof raw.buildTime === "number" ? raw.buildTime : null;
  const track = () => { const a = readTracked(); if (!a.some(t => t.n === r.title)) writeTracked([...a, { n: r.title, o: 0, t: c.count, from: `Part of ${e.name}` }]); setDone(true); };
  const addGoal = () => { const a = readGoals(), id = goalId(cat, e.slug); if (!a.some(g => g.id === id)) writeGoals([...a, { id, cat, slug: e.slug, name: e.name }]); setGoal(true); };
  const sib = e.components.filter(x => x.name !== c.name);
  return (<article className="entity">
    <div className="hero">
      <div className="art"><span className="ph" />{img && <img src={imgUrl(img)} alt={r.title} width={320} height={320} onError={ev => { if (!imgRetry(ev)) ev.currentTarget.style.display = "none"; }} />}</div>
      <div><p className="muted">{r.blueprint ? "Blueprint" : "Part"} of <Link to={`/${cat}/${e.slug}`}>{e.name}</Link>{e.isPrime && <> · <span className="gold">PRIME</span></>}{e.vaulted === true && <> · <span className="tag STALE">Vaulted</span></>}</p>
        <h1>{r.title}</h1>
        <p className="lead">{r.blueprint && norm(c.name) !== "blueprint" ? `The blueprint for the ${c.name} component of ${e.name}. ` : norm(c.name) === "blueprint" ? `The main blueprint of ${e.name}. ` : `The ${c.name} component of ${e.name}. `}
          {e.components.length > 1 ? `${e.name} is built from ${e.components.length} components${price != null || time != null ? ", and building it costs" : ""}` : ""}{price != null && <> <Credits n={price} /></>}{time != null && ` and takes ${time >= 3600 ? +(time / 3600).toFixed(1) + " h" : Math.round(time / 60) + " min"}`}{e.components.length > 1 ? "." : ""}</p>
        <dl className="stats">
          <div><dt>Ducats</dt><dd>{c.ducats != null ? c.ducats : "—"}</dd></div>
          <div><dt>Trading</dt><dd>{tr == null ? "Unknown" : tr ? "Tradable" : "Not tradable"}</dd></div>
          <div><dt>Needed</dt><dd>{c.count > 1 ? `×${c.count}` : "×1"}</dd></div>
          <div><dt>Difficulty</dt><dd><span className={"tag " + LEVEL[dif.level]}>{dif.level}</span></dd></div></dl>
        <div className="bar"><Link className="btn" to={`/${cat}/${e.slug}`}>Open {e.name}</Link>
          <button className="btn" onClick={track} disabled={done}>{done ? "Tracked" : "Track this part"}</button>
          {(cat === "warframe" || cat === "weapon") && (goal ? <Link className="btn" to="/roadmap">In Roadmap</Link> : <button className="btn" onClick={addGoal}>Add {e.name} to Goals</button>)}</div></div></div>
    <h2>How hard is it?</h2>
    <p><span className={"tag " + LEVEL[dif.level]}>{dif.level}</span> {dif.why}</p><p className="muted">Calculated estimate from drop rarity and vault status, not an official rating.</p>
    <h2>Where to get it</h2>
    {!relics && <p className="muted">Relic tables are {rr.status === "LOADING" ? "loading…" : "unavailable right now."}</p>}
    {opts.length > 0 && <ul className="list comp">{opts.map(o => (<li key={o.name}><span><RelicArt tier={o.tier} name={o.name} size={28} /> <Link to={`/relics?q=${encodeURIComponent(o.name)}`}><b>{o.name}</b></Link> <span className={"rar " + o.rarity}>{o.rarity}</span>{o.vaulted === true && <span className="tag STALE"> Vaulted</span>}{o.vaulted === false && <span className="tag FRESH"> Available</span>}
      <div className="muted">Chance by refinement: {["Intact", "Exceptional", "Flawless", "Radiant"].filter(s => o.chance[s] != null).map(s => `${s} ${o.chance[s]}%`).join(" · ")}</div></span>
      <Link to={`/farm/${encodeURIComponent(o.name + " Relic")}`}>How to get this relic</Link></li>))}</ul>}
    {other.length > 0 && <><h3>Other sources in the item data</h3><ul className="sub">{other.map((d, i) => <li key={i}>{d.location}{d.type ? ` (${d.type})` : ""}</li>)}</ul></>}
    {fromTables.length > 0 && <><h3>Drop tables</h3><ul className="sub">{fromTables.map((x, i) => <li key={i}>{x.where}{x.rot ? ` · rotation ${x.rot}` : ""}{x.ch != null ? ` · ${x.ch}%` : ""}<span className="muted"> · {x.src}</span></li>)}</ul></>}
    {relics && !opts.length && !other.length && !fromTables.length && <p className="muted">No source for this exact item in the loaded data. <Link to={`/finder?q=${encodeURIComponent(r.title)}`}>Search the drop tables</Link></p>}
    <h2>What it is worth</h2>
    <div className="grid">
      {MARKET_ENABLED && e.isPrime && <PartMarket label={`${r.title}: price`} names={names} tradable={tr} />}
      {MARKET_ENABLED && setTradable(e) && <SetPrice e={e} />}
    </div>
    {!e.isPrime && <p className="muted">Only Prime parts are traded between players, so this one has no market price.</p>}
    {c.ducats != null && <p className="muted">Selling it to Baro Ki'Teer's ducat exchange gives {c.ducats} ducats. Platinum price and ducat value are different things; a part can be worth a lot of one and little of the other.</p>}
    {sib.length > 0 && <><h2>Other parts of {e.name}</h2><ul className="chips">{sib.map(x => <li key={x.name}><Link className="relicchip" to={`/item/${encodeURIComponent(x.name === "Blueprint" ? `${e.name} Blueprint` : `${e.name} ${x.name} Blueprint`)}`}>{x.name}{x.count > 1 ? ` ×${x.count}` : ""}</Link></li>)}</ul></>}
  </article>);
}
const norm = (t: string) => t.toLowerCase();
/** Anything else a player may search for (resources, Forma, items with no catalog entry): where it drops, which relics hold it, and its market price. */
function GenericView({ name }: { name: string }) {
  const [rr, ...tabs] = useMany([{ id: "relics", file: "relics.json" }, ...ALL]), relics = parseRelics(rr.rec?.data);
  const { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: tabs[i].rec, status: tabs[i].status }))), l = name.toLowerCase();
  const m = ok ? query(rows, l).filter(x => x.item.toLowerCase() === l).slice(0, 12) : [], holders = (relics ?? []).filter(x => (x.st.Intact ?? []).some(y => y.itemName.toLowerCase() === l)).slice(0, 12);
  return (<article className="entity"><h1>{name}</h1>
    <p className="lead">FarmFrame has no description or picture for this item in its data sources, so it shows only what the drop tables and the market say.</p>
    <h2>Where to get it</h2>
    {holders.length > 0 && <div className="chips">{holders.map(x => <Link key={x.name} className="relicchip" to={`/relics?q=${encodeURIComponent(x.name)}`}><RelicArt tier={x.tier} name={x.name} size={22} /><span>{x.name}</span></Link>)}</div>}
    {m.length > 0 && <ul className="sub">{m.map((x, i) => <li key={i}>{x.where}{x.rot ? ` · rotation ${x.rot}` : ""}{x.ch != null ? ` · ${x.ch}%` : ""}<span className="muted"> · {x.src}</span></li>)}</ul>}
    {!holders.length && !m.length && <p className="muted">{ok || relics ? "No drop for this exact name in the loaded tables. It may come from a vendor, crafting or trading." : "Drop tables are loading…"} <Link to={`/finder?q=${encodeURIComponent(name)}`}>Search the Finder</Link></p>}
    <h2>What it is worth</h2>{MARKET_ENABLED && <PartMarket label={`${name}: price`} names={[name]} tradable={null} />}
  </article>);
}
export default function Part() {
  const { name = "" } = useParams(), loaded = useCatalogs(CATLIST);
  const ents = CATLIST.flatMap(c => (loaded[c]?.items ?? []).map(e => ({ e, cat: c }))), pending = CATLIST.some(c => !loaded[c]?.items && loaded[c]?.status === "LOADING");
  const exact = ents.find(x => x.e.name.toLowerCase() === name.toLowerCase()), r = resolvePart(name, ents);
  if (exact) return <Navigate to={`/${exact.cat}/${exact.e.slug}`} replace />;
  if (r) return <PartView key={r.title} r={r} />;
  if (pending) return <><h1>{name}</h1><Skeleton /><p className="muted">Looking for this item in the catalogs…</p></>;
  return <GenericView key={name} name={name} />;
}
