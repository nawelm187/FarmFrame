import RarityMark from "../RarityMark";
import { useEffect, useState } from "react";
import { rich } from "../lib/rich";
import { useT } from "../i18n";
import { Link, Navigate, useParams } from "react-router-dom";
import RelicArt from "../RelicArt";
import SetPrice from "../SetPrice";
import { Credits, Plat } from "../Money";
import { imgRetry, imgUrl, type Cat } from "../lib/catalog";
import PartArt, { splitPart } from "../PartArt";
import { useMany } from "../lib/data";
import { FIND, collect, parseRelics, query } from "../lib/drops";
import { byValue, relicsForPart, relicsOf } from "../lib/exact";
import { goalId, readGoals, writeGoals } from "../lib/goals";
import { MARKET_ENABLED, fetchAny, type Stat } from "../lib/market";
import { LEVEL_KEY, LEVEL_TAG, difficulty, resolvePart, type PartRef } from "../lib/part";
import { partTradable, setTradable } from "../lib/trade";
import { readTracked, writeTracked } from "../lib/track";
import { useCatalogs } from "../lib/useCatalog";
import { VAULT_ALT, VAULT_SRC, VAULT_URL, parseVault } from "../lib/vault";
import { Skeleton } from "./parts";
const CATLIST: Cat[] = ["warframe", "weapon", "companion", "archwing", "mod"];
const ALL = FIND.map(f => ({ id: f.id, file: f.file }));
type S = "loading" | "error" | "none" | { st: Stat; at: number };
const memo = new Map<string, S>();
const REFS = [["Intact", "refIntact"], ["Exceptional", "refExceptional"], ["Flawless", "refFlawless"], ["Radiant", "refRadiant"]] as const;
/** Live market price of one item. Shown automatically; says plainly when there is none. */
function PartMarket({ names, tradable, label }: { names: string[]; tradable: boolean | null; label: string }) {
  const t = useT();
  const key = names.join("|"), [s, setS] = useState<S>(memo.get(key) ?? "loading");
  useEffect(() => {
    if (tradable === false || memo.has(key)) return; let dead = false; setS("loading");
    fetchAny(names).then(st => { const v: S = st ? { st, at: Date.now() } : "none"; memo.set(key, v); if (!dead) setS(v); }).catch(() => { if (!dead) setS("error"); });
    return () => { dead = true; };
  }, [key, tradable]); // eslint-disable-line react-hooks/exhaustive-deps
  return (<section className="panel" aria-label={label}><div className="row"><h3>{label}</h3><span className="tag UNAVAILABLE">{t("prtMarketLive")}</span></div>
    {tradable === false ? <p className="muted">{t("prtNoTrade")}</p>
      : s === "loading" ? <div aria-hidden="true"><div className="sk" style={{ width: "45%" }} /></div>
      : s === "error" ? <p className="muted">{t("relMarketDown")}</p>
      : s === "none" ? <p className="muted">{t("prtNotListed")}</p>
      : <><div className="big"><b><Plat n={s.st.median} size={20} /></b> <span className="muted">{t("prtMedian")}</span></div>
        <div className="muted">{rich(t("prtStats", { vol: s.st.volume, time: new Date(s.at).toLocaleTimeString() }), { lo: <Plat n={s.st.min} />, hi: <Plat n={s.st.max} /> })}</div></>}</section>);
}
function PartView({ r }: { r: PartRef }) {
  const t = useT();
  const { entity: e, comp: c } = r, cat = r.cat, [done, setDone] = useState(false), [goal, setGoal] = useState(false);
  const [rr, vr, ...tabs] = useMany([{ id: "relics", file: "relics.json" }, { id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }, ...ALL]);
  const relics = relicsOf(rr.rec?.data), vault = parseVault(vr.rec?.data);
  const opts = relics ? relicsForPart(relics, e.name, c, vault).sort(byValue) : [], other = c.drops.filter(d => !/\b(Lith|Meso|Neo|Axi|Requiem)\b/i.test(d.location));
  const { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: tabs[i].rec, status: tabs[i].status })));
  const names = [r.title, `${e.name} ${c.name}`], fromTables = ok ? query(rows, r.title).filter(x => names.some(n => n.toLowerCase() === x.item.toLowerCase())).slice(0, 6) : [];
  const dif = difficulty(opts, other.length + fromTables.length), lvl = t(LEVEL_KEY[dif.level]), tr = partTradable(e, c), img = c.image ?? e.image, raw = e.raw;
  const price = typeof raw.buildPrice === "number" ? raw.buildPrice : null, time = typeof raw.buildTime === "number" ? raw.buildTime : null;
  const track = () => { const a = readTracked(); if (!a.some(t => t.n === r.title)) writeTracked([...a, { n: r.title, o: 0, t: c.count, from: t("prtPartOf", { name: e.name }) }]); setDone(true); };
  const addGoal = () => { const a = readGoals(), id = goalId(cat, e.slug); if (!a.some(g => g.id === id)) writeGoals([...a, { id, cat, slug: e.slug, name: e.name }]); setGoal(true); };
  const sib = e.components.filter(x => x.name !== c.name);
  const timeTxt = time == null ? "" : time >= 3600 ? t("prtHrs", { n: +(time / 3600).toFixed(1) }) : t("prtMin", { n: Math.round(time / 60) });
  const built = e.components.length > 1 ? rich(t(price != null ? (time != null ? "prtBuiltCostTime" : "prtBuiltCost") : time != null ? "prtBuiltTime" : "prtBuilt", { name: e.name, n: e.components.length, time: timeTxt }), { price: price != null ? <Credits n={price} /> : null }) : null;
  return (<article className="entity">
    <div className="hero">
      <div className="art"><span className="ph" />{splitPart(r.title) ? <PartArt part={splitPart(r.title)!.part} prime={/\bprime$/i.test(splitPart(r.title)!.owner)} size={200} /> : img && <img src={imgUrl(img)} alt={r.title} width={320} height={320} onError={ev => { if (!imgRetry(ev)) ev.currentTarget.style.display = "none"; }} />}</div>
      <div><p className="muted">{rich(t(r.blueprint ? "prtBpOf" : "prtPartOf"), { name: <Link to={`/${cat}/${e.slug}`}>{e.name}</Link> })}{e.isPrime && <> · <span className="gold">PRIME</span></>}{e.vaulted === true && <> · <span className="tag STALE">{t("vaultVaulted")}</span></>}</p>
        <h1>{r.title}</h1>
        <p className="lead">{t(r.blueprint && norm(c.name) !== "blueprint" ? "prtLeadBpComp" : norm(c.name) === "blueprint" ? "prtLeadMain" : "prtLeadComp", { comp: c.name, name: e.name })}{built && <> {built}</>}</p>
        <dl className="stats">
          <div><dt>{t("prtDucats")}</dt><dd>{c.ducats != null ? c.ducats : "—"}</dd></div>
          <div><dt>{t("prtTrading")}</dt><dd>{tr == null ? t("prtUnknown") : tr ? t("prtTradable") : t("prtNotTradable")}</dd></div>
          <div><dt>{t("prtNeeded")}</dt><dd>{c.count > 1 ? `×${c.count}` : "×1"}</dd></div>
          <div><dt>{t("fisDifficulty")}</dt><dd><span className={"tag " + LEVEL_TAG[dif.level]}>{lvl}</span></dd></div></dl>
        <div className="bar"><Link className="btn" to={`/${cat}/${e.slug}`}>{t("prtOpen", { name: e.name })}</Link>
          <button className="btn" onClick={track} disabled={done}>{done ? t("prtTracked") : t("prtTrack")}</button>
          {(cat === "warframe" || cat === "weapon") && (goal ? <Link className="btn" to="/roadmap">{t("prtInRoadmap")}</Link> : <button className="btn" onClick={addGoal}>{t("prtAddGoal", { name: e.name })}</button>)}</div></div></div>
    <h2>{t("prtHowHard")}</h2>
    <p><span className={"tag " + LEVEL_TAG[dif.level]}>{lvl}</span> {dif.why}</p><p className="muted">{t("prtEstimate")}</p>
    <h2>{t("prtWhere")}</h2>
    {!relics && <p className="muted">{t(rr.status === "LOADING" ? "prtRelicsLoading" : "prtRelicsDown")}</p>}
    {opts.length > 0 && <ul className="list comp">{opts.map(o => (<li key={o.name}><span><RelicArt tier={o.tier} name={o.name} size={28} /> <Link to={`/relics?q=${encodeURIComponent(o.name)}`}><b>{o.name}</b></Link> <RarityMark r={o.rarity} />{o.vaulted === true && <span className="tag STALE"> {t("vaultVaulted")}</span>}{o.vaulted === false && <span className="tag FRESH"> {t("vaultAvailable")}</span>}
      <div className="muted">{t("prtChance")} {REFS.filter(([k]) => o.chance[k] != null).map(([k, lab]) => `${t(lab)} ${o.chance[k]}%`).join(" · ")}</div></span>
      <Link to={`/farm/${encodeURIComponent(o.name + " Relic")}`}>{t("prtHowRelic")}</Link></li>))}</ul>}
    {other.length > 0 && <><h3>{t("prtOtherSrc")}</h3><ul className="sub">{other.map((d, i) => <li key={i}>{d.location}{d.type ? ` (${d.type})` : ""}</li>)}</ul></>}
    {fromTables.length > 0 && <><h3>{t("prtDropTables")}</h3><ul className="sub">{fromTables.map((x, i) => <li key={i}>{x.where}{x.rot ? ` · ${t("prtRotation", { r: x.rot })}` : ""}{x.ch != null ? ` · ${x.ch}%` : ""}<span className="muted"> · {x.src}</span></li>)}</ul></>}
    {relics && !opts.length && !other.length && !fromTables.length && <p className="muted">{t("prtNoSource")} <Link to={`/finder?q=${encodeURIComponent(r.title)}`}>{t("prtSearchTables")}</Link></p>}
    <h2>{t("prtWorth")}</h2>
    <div className="grid">
      {MARKET_ENABLED && e.isPrime && <PartMarket label={t("prtPrice", { name: r.title })} names={names} tradable={tr} />}
      {MARKET_ENABLED && setTradable(e) && <SetPrice e={e} />}
    </div>
    {!e.isPrime && <p className="muted">{t("prtOnlyPrime")}</p>}
    {c.ducats != null && <p className="muted">{t("prtDucatSell", { n: c.ducats })}</p>}
    {sib.length > 0 && <><h2>{t("prtOtherParts", { name: e.name })}</h2><ul className="chips">{sib.map(x => <li key={x.name}><Link className="relicchip" to={`/item/${encodeURIComponent(x.name === "Blueprint" ? `${e.name} Blueprint` : `${e.name} ${x.name} Blueprint`)}`}>{x.name}{x.count > 1 ? ` ×${x.count}` : ""}</Link></li>)}</ul></>}
  </article>);
}
const norm = (t: string) => t.toLowerCase();
/** Anything else a player may search for (resources, Forma, items with no catalog entry): where it drops, which relics hold it, and its market price. */
function GenericView({ name }: { name: string }) {
  const t = useT();
  const [rr, ...tabs] = useMany([{ id: "relics", file: "relics.json" }, ...ALL]), relics = parseRelics(rr.rec?.data);
  const { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: tabs[i].rec, status: tabs[i].status }))), l = name.toLowerCase();
  const m = ok ? query(rows, l).filter(x => x.item.toLowerCase() === l).slice(0, 12) : [], holders = (relics ?? []).filter(x => (x.st.Intact ?? []).some(y => y.itemName.toLowerCase() === l)).slice(0, 12);
  return (<article className="entity"><h1>{name}</h1>
    <p className="lead">{t("prtGenLead")}</p>
    <h2>{t("prtWhere")}</h2>
    {holders.length > 0 && <div className="chips">{holders.map(x => <Link key={x.name} className="relicchip" to={`/relics?q=${encodeURIComponent(x.name)}`}><RelicArt tier={x.tier} name={x.name} size={22} /><span>{x.name}</span></Link>)}</div>}
    {m.length > 0 && <ul className="sub">{m.map((x, i) => <li key={i}>{x.where}{x.rot ? ` · ${t("prtRotation", { r: x.rot })}` : ""}{x.ch != null ? ` · ${x.ch}%` : ""}<span className="muted"> · {x.src}</span></li>)}</ul>}
    {!holders.length && !m.length && <p className="muted">{ok || relics ? t("prtGenNone") : t("prtTablesLoading")} <Link to={`/finder?q=${encodeURIComponent(name)}`}>{t("prtSearchFinder")}</Link></p>}
    <h2>{t("prtWorth")}</h2>{MARKET_ENABLED && <PartMarket label={t("prtPrice", { name })} names={[name]} tradable={null} />}
  </article>);
}
export default function Part() {
  const t = useT();
  const { name = "" } = useParams(), loaded = useCatalogs(CATLIST);
  const ents = CATLIST.flatMap(c => (loaded[c]?.items ?? []).map(e => ({ e, cat: c }))), pending = CATLIST.some(c => !loaded[c]?.items && loaded[c]?.status === "LOADING");
  const exact = ents.find(x => x.e.name.toLowerCase() === name.toLowerCase()), r = resolvePart(name, ents);
  if (exact) return <Navigate to={`/${exact.cat}/${exact.e.slug}`} replace />;
  if (r) return <PartView key={r.title} r={r} />;
  if (pending) return <><h1>{name}</h1><Skeleton /><p className="muted">{t("prtLooking")}</p></>;
  return <GenericView key={name} name={name} />;
}
