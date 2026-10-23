import RarityMark from "../RarityMark";
import { Pic } from "../ItemArt";
import { useState } from "react";
import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import { useMany } from "../lib/data";
import { FIND, collect, query, type Row } from "../lib/drops";
import { GROUP_TITLE, groupOf, label, nextAction, refinement, RELIC_SOURCE_IDS, relicSources, STATES, type TierPlan } from "../lib/exact";
import { readRelics, writeRelics, type MyRelics } from "../lib/myrelics";
import { readReqs } from "../lib/reqs";
import { readTracked } from "../lib/track";
import { useExact } from "../lib/useExact";
import { Badge, Countdown, Skeleton } from "./parts";
import { Ring, StatTile, Stepper } from "../ui";
import VendorList from "../VendorList";
import { vendorSources } from "../lib/vendorSources";
import { ST } from "../lib/statusKey";
import { tp, useT } from "../i18n";
const ALL = FIND.map(f => ({ id: f.id, file: f.file }));
const SRC = FIND.filter(f => RELIC_SOURCE_IDS.includes(f.id)).map(f => ({ id: f.id, file: f.file }));
function Sources({ relic }: { relic: string }) {
  const tr = useT();
  const res = useMany(SRC), { rows, ok } = collect(FIND.filter(f => SRC.some(s => s.id === f.id)).map(f => { const i = SRC.findIndex(s => s.id === f.id); return { f, rec: res[i].rec, status: res[i].status }; }));
  if (!ok) return <p className="muted">{tr("saReadingDrops")}</p>;
  const s = relicSources(rows, relic);
  return s.length ? <ul className="sub">{s.map((r, i) => <li key={i}>{r.where}{r.rot ? " · " + tr("saRotation", { rot: r.rot }) : ""}{r.ch != null ? ` · ${r.ch}%` : ""}<span className="muted"> · {r.src}</span></li>)}</ul>
    : <p className="muted">{tr("fpNoSource")} <Link to={`/farm/${encodeURIComponent(relic + " Relic")}`}>{tr("fpCheckDrops")}</Link></p>;
}
/** The best verified sources for an item name, from the drop tables. Says so when there are none. */
function Where({ rows, ok, name, extra = [] }: { rows: Row[]; ok: boolean; name: string; extra?: string[] }) {
  const tr = useT();
  const q = name.trim().toLowerCase(), m = ok ? query(rows, q).filter(r => r.item.toLowerCase() === q || r.item.toLowerCase().startsWith(q + " ")).slice(0, 3) : [], sold = vendorSources(name);
  return (<div className="where">{sold.length > 0 && <VendorList hits={sold} />}{m.length
    ? <ul className="srcs">{m.map((r, i) => <li key={i}><b>{r.where}</b><span className="fchips">{r.rot ? <span className="fchip">{tr("rotRotationN", { k: r.rot })}</span> : null}{r.ch != null ? <span className="fchip gold">{r.ch}%</span> : null}<span className="fchip">{r.src}</span></span></li>)}</ul>
    : extra.length ? <p className="muted">{tr("fpFromData", { list: extra.join("; ") })}</p> : sold.length ? null : <p className="muted">{ok ? tr("fpNoDrop") : tr("fpTablesLoading")}</p>}
    <Link className="btn" to={`/farm/${encodeURIComponent(name)}`}>{tr("saSeeAll")}</Link></div>);
}
function Extras() {
  const tr = useT();
  const res = useMany(ALL), { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status })));
  const tracked = readTracked().filter(t => t.o < t.t), reqs = readReqs().filter(r => r.have < r.need);
  if (!tracked.length && !reqs.length) return null;
  return (<>
    {tracked.length > 0 && <><h2>{tr("fpTrackedTitle")}</h2><p className="muted">{tr("fpTrackedNote")}</p>
      <div className="rowcards">{tracked.map((t, i) => <article className="rowcard" key={i}><Pic name={t.n} size={44} /><div className="rcbody"><div className="rchead"><b>{t.n}</b><span className="fchip">{tr("fpHave", { o: t.o, t: t.t })}</span><span className="fchip gold">{tr("fpMissingN", { n: t.t - t.o })}</span></div><Where rows={rows} ok={ok > 0} name={t.n} /></div><Link className="btn" to="/tracking">{tr("fpEditTrk")}</Link></article>)}</div></>}
    {reqs.length > 0 && <><h2>{tr("fpReqTitle")}</h2><p className="muted">{tr("fpReqNote")}</p>
      <div className="rowcards">{reqs.map(r => <article className="rowcard" key={r.id}><Pic name={r.name} size={44} /><div className="rcbody"><div className="rchead"><b>{r.name}</b><span className="fchip">{r.kind === "mod" ? tr("catMod") : r.kind === "arcane" ? tr("bldArcaneWord") : r.kind === "omni" ? "Omni Forma" : "Forma"}</span><span className="fchip">{tr("fpFor", { name: r.buildName })}</span>{r.need > 1 && <span className="fchip gold">{tr("fpHave", { o: r.have, t: r.need })}</span>}</div>
        {r.kind === "forma" || r.kind === "omni" ? <p className="muted">{tr("fpFormaNote")}</p> : <Where rows={rows} ok={ok > 0} name={r.name} extra={r.src} />}</div>
        {r.slug && r.kind === "mod" ? <Link className="btn" to={`/mod/${r.slug}`}>{tr("fpOpenMod")}</Link> : <Link className="btn" to="/roadmap">{tr("openRoadmap")}</Link>}</article>)}</div></>}
  </>);
}
function TierBlock({ t, mine, set }: { t: TierPlan; mine: MyRelics; set: (n: string, v: number) => void }) {
  const tr = useT();
  const [open, setOpen] = useState<string | null>(null);
  return (<section className="gcard tierplan">
    <div className="ghead"><RelicArt tier={t.tier} size={56} /><div className="grow"><h3>{tr("fpTierRelics", { tier: t.tier })}</h3>
      <div className="muted">{t.fissures.length ? tp("fpFisActive", t.fissures.length) : tr("fpNoFis")}</div>{t.fissures.length > 0 && <div className="muted">{t.fissures.slice(0, 4).map(f => `${f.missionType} ${f.node}${f.isHard ? " (Steel Path)" : ""}${f.isStorm ? " (" + tr("fisStorm") + ")" : ""}`).join(" · ")}</div>}</div></div>
    <ul className="list comp">{t.relics.map(({ opt, parts }) => { const rf = refinement(opt), o = mine[opt.name] ?? 0;
      return (<li key={opt.name}><span><RelicArt tier={t.tier} name={opt.name} size={26} /> <b>{opt.name}</b> <RarityMark r={opt.rarity} />{opt.vaulted === true && <span className="tag STALE" title={tr("fpVaultTip")}> {tr("vaultVaulted")}</span>}
        <div className="muted">{tr("fpAdvances", { list: parts.map(label).join(", ") })}</div>
        <div className="muted">{tr("fpChance", { list: STATES.filter(s => opt.chance[s] != null).map(s => `${s} ${opt.chance[s]}%`).join(" · ") })}</div>
        {rf && <div className="muted">{tr(rf.better ? "fpRefineBetter" : "fpRefineSame", { best: rf.best, from: rf.from, to: rf.to })}</div>}
        <button className="btn" onClick={() => setOpen(open === opt.name ? null : opt.name)} aria-expanded={open === opt.name}>{tr("fpHowGetRelic")}</button>{open === opt.name && (opt.vaulted === true ? <p className="muted">{tr("fpVaultedNote")}</p> : <Sources relic={opt.name} />)}</span>
        <Stepper value={o} label={opt.name} onChange={v => set(opt.name, v)} /></li>); })}</ul></section>);
}
export default function FarmPlan() {
  const tr = useT(), ex = useExact(), [mine, setMine] = useState<MyRelics>(readRelics), set = (n: string, v: number) => { const m = { ...mine, [n]: v }; setMine(m); writeRelics(m); };
  const hasOther = readTracked().some(t => t.o < t.t) || readReqs().some(r => r.have < r.need);
  if (!ex.goals.length && !hasOther) return <><h1>{tr("farmPlan")}</h1><p className="lead">{tr("fpNothing")}</p><p className="muted">{tr("fpNothingNote")} <Link to="/warframes">{tr("browseWarframes")}</Link> · <Link to="/tracking">{tr("tracking")}</Link></p></>;
  const todo = ex.plans.filter(p => p.part.count > p.have);
  const cnt = { now: 0, next: 0, blocked: 0 }; for (const p of todo) cnt[groupOf(nextAction(p, ex.fis.data, mine, !!ex.relics))]++;
  const tot = ex.info.reduce((a, i) => ({ have: a.have + i.have, total: a.total + i.total }), { have: 0, total: 0 });
  return (<><h1>{tr("farmPlan")}</h1>
    <p className="lead">{tr("fpLead")}</p>
    <section className="hud" aria-label={tr("fpSummary")}>{tot.total > 0 ? <Ring pct={100 * tot.have / tot.total} size={96} /> : <Ring pct={0} size={96}>—</Ring>}
      <div><h2>{todo.length ? tp("fpToFarm", todo.length) : tr("fpNothingLeft")}</h2>
        <div className="muted">{tr("fissures")} <Badge s={ex.fis.status} /> · {ex.relics ? tr("fpTablesLoaded") : tr("fpTablesStatus", { status: tr(ST[ex.relicStatus]).toLowerCase() })}. {tr("fpMarkNote")}</div>
        <div className="stats"><StatTile n={cnt.now} label={tr("grpNow")} tone="gold" /><StatTile n={cnt.next} label={tr("grpNext")} tone="acc" /><StatTile n={cnt.blocked} label={tr("advTagBlocked")} /><StatTile n={`${tot.have}/${tot.total}`} label={tr("fpGoalParts")} /></div></div></section>
    {ex.pending && <Skeleton />}
    <h2>{tr("fpNextPer")}</h2>
    {ex.info.length > 0 && <p className="muted">{ex.info.map(i => i.parts ? tr("fpInfoParts", { goal: i.goal.name, have: i.have, total: i.total }) : tr("fpInfoNone", { goal: i.goal.name })).join(" · ")}</p>}
    {ex.lost.length > 0 && <p className="tag STALE" role="alert">{tr("fpLost", { list: ex.lost.map(g => g.name).join(", ") })}</p>}
    {!ex.goals.length ? <p className="muted">{tr("fpNoGoals")}</p> : !todo.length ? <p className="gold">{ex.pending ? tr("fpLoadingGoals") : ex.lost.length ? tr("fpNothingFound") : ex.info.length && ex.info.every(i => !i.parts) ? tr("fpNoPartsAll") : ex.info.some(i => !i.parts) ? tr("fpAllExcept", { list: ex.info.filter(i => !i.parts).map(i => i.goal.name).join(", ") }) : tr("fpAllDone")}</p> : <>{(["now", "next", "blocked"] as const).map(g => { const rows = todo.map(p => ({ p, n: nextAction(p, ex.fis.data, mine, !!ex.relics) })).filter(x => groupOf(x.n) === g); if (!rows.length) return null;
      return (<section key={g} aria-label={GROUP_TITLE[g]}><h3>{GROUP_TITLE[g]} <span className="muted">{rows.length}</span></h3><div className="acards">{rows.map(({ p, n }, i) => { const gi = ex.info.find(x => x.goal.id === p.goal.id), top = p.relics.filter(r => r.vaulted !== true)[0];
        return <div key={p.goal.id + p.part.name} className={"acard" + (g === "now" ? " now" : "")} style={{ animationDelay: i * 40 + "ms" }}><Pic name={`${p.entity} ${p.part.name}`} size={56} />
          <span className="tx"><span className={"kicker" + (g === "now" ? " now" : "")}>{tr("fpForGoal", { goal: p.goal.name })}</span><b>{label(p)}{p.left > 1 ? ` ×${p.left}` : ""}</b>
            <span className="muted">{tr("fpHaveOf", { have: p.have, need: p.part.count, left: p.left })}</span>
            <span className="muted">{n.text}</span>
            {top && g !== "blocked" && <Link className="relicchip" to={`/relics?q=${encodeURIComponent(top.name)}`}><RelicArt tier={top.tier} name={top.name} size={20} /><span>{top.name}</span><RarityMark r={top.rarity} /></Link>}
            {gi && gi.parts > 0 && <span className="muted">{gi.have < gi.total ? tr("fpGoalProgNext", { have: gi.have, total: gi.total, next: Math.min(gi.have + 1, gi.total) }) : tr("fpGoalProg", { have: gi.have, total: gi.total })}</span>}
            {n.to && <Link to={n.to}>{n.kind === "open" ? tr("fpOpenPlan") : tr("advFindSrc")}</Link>}</span></div>; })}</div></section>); })}</>}
    <Extras />
    {ex.tiers.length > 0 && <><h2>{tr("fpRelicsByTier")}</h2>{ex.tiers.map(t => <TierBlock key={t.tier} t={t} mine={mine} set={set} />)}</>}
    {todo.some(p => !p.relics.length && p.relicTiers.length > 0) && ex.relics && <p className="muted">{tr("fpNoExact", { list: todo.filter(p => !p.relics.length && p.relicTiers.length).map(label).join(", ") })}</p>}
    {ex.fis.data && ex.tiers.some(t => t.fissures.length) && <p className="muted">{tr("fpSoonest")} <Countdown exp={[...ex.tiers.flatMap(t => t.fissures)].sort((a, b) => Date.parse(a.expiry) - Date.parse(b.expiry))[0].expiry} /></p>}</>);
}
