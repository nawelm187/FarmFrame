import ItemArt from "../ItemArt";
import { PolIcon } from "../Icons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { allSlots, evaluate, KIND_LABEL, modFits, newBuild, readBuilds, requirements, specialFits, specialSlot, SPECIALS, writeBuilds, type ArcSlot, type Build, type Issue, type Kind, type Slot, type SpecialKey } from "../lib/build";
import { readTracked, writeTracked } from "../lib/track";
import { calc, LABEL } from "../lib/calc";
import { parseCatalog, type Cat, type Entity } from "../lib/catalog";
import { acquisition, fromBuild, readReqs, writeReqs } from "../lib/reqs";
import { useCatalogs } from "../lib/useCatalog";
import { useMany } from "../lib/data";
import { MARKET_ENABLED, fetchStat } from "../lib/market";
import ModCard from "../ModCard";
import DamageTest from "../DamageTest";
import ModPicker from "../ModPicker";
import BuildAI from "../BuildAI";
import { decodeBuild, encodeBuild } from "../lib/buildShare";
import { Plat } from "../Money";
import SetPrice from "../SetPrice";
import { Unavailable } from "./parts";
import { KIND_KEY } from "../lib/catLabel";
import { t as tt, useT, type Key } from "../i18n";
const ARC_URL = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Arcanes.json";
const ARC_ALT = "https://cdn.jsdelivr.net/gh/WFCD/warframe-items@master/data/json/Arcanes.json";
const ARC_SRC = "WFCD warframe-items on GitHub (community, unofficial)";
const POLS = ["madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "umbra", "any"];
/** Full-height sheet on phones, centered dialog on wide screens: holds the mod picker so the slot grid stays on screen. */
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const tr = useT(), box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.focus(); const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); const o = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", k); document.body.style.overflow = o; }; }, [onClose]);
  return (<div className="sheet" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="sheetin" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={box}>
    <div className="sheethd"><b>{title}</b><button className="btn" onClick={onClose}>{tr("close")}</button></div><div className="sheetbd">{children}</div></div></div>);
}
export function BuildList() {
  const [bs, setBs] = useState(readBuilds), nav = useNavigate(), [sp] = useSearchParams(), made = useRef(false), tr = useT();
  // Deep link from search ("build Rhino" -> /builds?new=warframe:rhino): create the build once and open it.
  useEffect(() => { const n = sp.get("new"); if (!n || made.current) return; const [kind, slug] = n.split(":");
    if (!(kind in KIND_LABEL) || !slug) return; made.current = true;
    const b = { ...newBuild(), kind: kind as Kind, frame: slug, name: sp.get("n") ? tt("bldFromName", { n: sp.get("n") ?? "" }) : tt("bldNew") }; const a = [...readBuilds(), b]; writeBuilds(a); nav(`/build/${b.id}`, { replace: true }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const commit = (a: Build[]) => { setBs(a); writeBuilds(a); };
  const add = () => { const b = newBuild(); commit([...bs, b]); nav(`/build/${b.id}`); };
  const [codeIn, setCodeIn] = useState(""), [codeBad, setCodeBad] = useState(false);
  const importCode = () => { const b = decodeBuild(codeIn); if (!b) { setCodeBad(true); return; } commit([...bs, b]); setCodeIn(""); nav(`/build/${b.id}`); };
  return (<><h1>{tr("builds")}</h1><p className="lead">{tr("bldLead")}</p>
    <div className="bar"><button className="btn" onClick={add}>{tr("bldNew")}</button></div>
    <details className="minicard" style={{ maxWidth: "44rem", margin: ".6rem 0" }}><summary>{tr("bldImportCode")}</summary>
      <textarea aria-label={tr("bldImportCode")} placeholder={tr("bldImportPh")} value={codeIn} onChange={e => { setCodeIn(e.target.value); setCodeBad(false); }} rows={3} style={{ width: "100%", boxSizing: "border-box", margin: ".5rem 0" }} />
      <div className="bar"><button className="btn" disabled={!codeIn.trim()} onClick={importCode}>{tr("bldImportBtn")}</button>{codeBad && <span className="ERROR" role="alert">{tr("bldCodeBad")}</span>}</div></details>
    {!bs.length ? <p className="muted">{tr("bldNoneYet")}</p> : <ul className="list comp">{bs.map(b => (<li key={b.id}><span><Link to={`/build/${b.id}`}>{b.name}</Link> <span className="muted">{tr(KIND_KEY[b.kind ?? "warframe"])}</span></span><button className="btn" onClick={() => commit(bs.filter(x => x.id !== b.id))}>{tr("del")}</button></li>))}</ul>}</>);
}
export function BuildEditor() {
  const { id } = useParams(), tr = useT(), [bs, setBs] = useState(readBuilds), [q, setQ] = useState(""), [active, setActive] = useState<number | null>(null), [activeSp, setActiveSp] = useState<SpecialKey | null>(null), [sheet, setSheet] = useState(false), [codeTxt, setCodeTxt] = useState(""), [copied, setCopied] = useState(false), [sent, setSent] = useState(false), [road, setRoad] = useState(false), [aq, setAq] = useState(["", ""]), [prices, setPrices] = useState<Record<string, number | null> | "loading" | "error" | null>(null);
  const b = bs.find(x => x.id === id), kind: Kind = b?.kind ?? "warframe";
  const catKey: Cat = kind === "warframe" ? "warframe" : kind === "companion" ? "companion" : kind === "archwing" ? "archwing" : "weapon";
  const both = useCatalogs([catKey, "mod"]), itemsC = both[catKey]!, modC = both.mod!;
  const ar = useMany([{ id: "arcane", file: "", url: ARC_URL, alt: ARC_ALT, src: ARC_SRC }])[0];
  if (!b) return <><h1>{tr("bldNotFound")}</h1><Link to="/builds">{tr("bldBack")}</Link></>;
  const all = itemsC.items ?? [];
  const isWeapon = kind === "primary" || kind === "secondary" || kind === "melee", aw = all.filter(e => /^archwing$/i.test(e.category) || /^archwing$/i.test(e.type));
  const frames = (isWeapon ? all.filter(e => e.category.toLowerCase() === kind) : kind === "archwing" && aw.length ? aw : all).slice().sort((x, y) => x.name.localeCompare(y.name));
  const mods = modC.items;
  if (!all.length || !mods) return <Unavailable title={tr("bldDataTitle")} status={!all.length ? itemsC.status : modC.status} why={tr("bldNeedCats")} rec={(!all.length ? itemsC : modC).rec} />;
  const save = (nb: Build) => { const a = bs.map(x => (x.id === nb.id ? nb : x)); setBs(a); writeBuilds(a); };
  const bySlug = new Map(mods.map(m => [m.slug, m])), fit = mods.filter(m => modFits(kind, m)), byName = new Map(fit.map(m => [m.name.toLowerCase(), m]));
  const frameEnt = frames.find(f => f.slug === b.frame), ev = evaluate(b, frameEnt, bySlug), st = calc(b, bySlug);
  const setSlot = (i: number, s: Slot) => save({ ...b, slots: b.slots.map((x, j) => (j === i ? s : x)) });
  const setSpecial = (k: SpecialKey, s: Slot) => save({ ...b, special: { ...b.special, [k]: s } });
  const slotName = (k: SpecialKey) => tr(k === "aura" ? "bldSlotAura" : k === "stance" ? "bldSlotStance" : "bldSlotExilus");
  const fitSp = activeSp ? mods.filter(m => specialFits(activeSp, kind, m) !== "no") : [];
  const selMain = (i: number) => { const open = active !== i; setActive(open ? i : null); setActiveSp(null); if (open && !b.slots[i].mod) setSheet(true); };
  const arcs = parseCatalog(ar.rec?.data, "mod"), arcBy = new Map((arcs ?? []).map(a => [a.slug, a])), arcByName = new Map((arcs ?? []).map(a => [a.name.toLowerCase(), a]));
  const arcSlot = (i: number): ArcSlot => b.arcanes?.[i] ?? { mod: null };
  const setArc = (i: number, v: ArcSlot) => { const a = [arcSlot(0), arcSlot(1)]; a[i] = v; save({ ...b, arcanes: a }); };
  const onArc = (i: number, v: string) => { const m = arcByName.get(v.trim().toLowerCase()); if (m) { setArc(i, { mod: m.slug, owned: false }); setAq(["", ""]); } else setAq(aq.map((x, j) => (j === i ? v : x))); };
  const rq = requirements(b, frames.find(f => f.slug === b.frame), bySlug, arcBy);
  const acqLine = (e?: Entity) => { const a = acquisition(e); return <div className="muted">{a.length ? tr("bldHowGet") + " " + a.join("; ") : tr("bldNoAcq")}</div>; };
  const addRoad = () => { writeReqs(fromBuild(b, rq, bySlug, arcBy, readReqs())); setRoad(true); };
  const send = () => { const a = readTracked(); const add = [...rq.missingMods, ...rq.missingArcanes].filter(m => !a.some(t => t.n === m.name)).map(m => ({ n: m.name, o: 0, t: 1, from: tr("bldFrom", { name: b.name }) }));
    if (rq.forma > 0 && !a.some(t => t.n === "Forma Blueprint")) add.push({ n: "Forma Blueprint", o: 0, t: rq.forma, from: tr("bldFrom", { name: b.name }) });
    if (rq.omni > 0 && !a.some(t => t.n === "Omni Forma Blueprint")) add.push({ n: "Omni Forma Blueprint", o: 0, t: rq.omni, from: tr("bldFrom", { name: b.name }) }); writeTracked([...a, ...add]); setSent(true); };
  const runPrices = async () => {
    setPrices("loading"); const out: Record<string, number | null> = {};
    try { for (const m of rq.missingMods) { if (bySlug.get(m.slug)?.tradable === false) { out[m.slug] = null; continue; } const st = await fetchStat(m.name, undefined, 0); out[m.slug] = st ? st.median : null; await new Promise(r => setTimeout(r, 400)); } setPrices(out); } catch { setPrices("error"); }
  };
  const priceTotal = prices && typeof prices === "object" ? +rq.missingMods.reduce((a, m) => a + (prices[m.slug] ?? 0), 0).toFixed(1) : null;
  const facts = {
    type: KIND_LABEL[kind] /* English on purpose: this goes to the AI helper */, item: frameEnt?.name ?? null, baseStats: frameEnt?.stats ?? [], capacity: { used: ev.total, max: ev.capacity },
    mods: [...ev.special.filter(r => r.m).map(r => ({ slot: r.key, slotPolarity: r.pol, mod: r.m!.name, rank: specialSlot(b, r.key).rank, capacityBonus: r.bonus, drain: r.d, effectsAtThisRank: r.m!.levelStats?.[Math.min(specialSlot(b, r.key).rank, Math.max((r.m!.levelStats?.length ?? 1) - 1, 0))] ?? [] })), ...ev.rows.filter(r => r.m).map(r => ({ slot: r.i + 1, slotPolarity: r.pol, mod: r.m!.name, rank: b.slots[r.i].rank, drain: r.d, effectsAtThisRank: r.m!.levelStats?.[Math.min(b.slots[r.i].rank, Math.max((r.m!.levelStats?.length ?? 1) - 1, 0))] ?? [] }))],
    totals: st.stats.map(s => ({ stat: s.label, bonusPercent: +s.pct.toFixed(1), from: s.parts })), notCalculated: st.unparsed, validation: ev.issues,
    forma: rq.forma, omniForma: rq.omni, arcanes: rq.arcanes.map(a => a.name), missingMods: rq.missingMods.map(m => m.name),
  };
  const pick = (m: Entity) => { if (activeSp) { setSpecial(activeSp, { ...specialSlot(b, activeSp), mod: m.slug, rank: m.maxRank ?? 0 }); setSheet(false); return; } const i = active != null && !b.slots[active].mod ? active : active != null ? active : b.slots.findIndex(s => !s.mod); if (i >= 0) { setSlot(i, { mod: m.slug, rank: m.maxRank ?? 0 }); setActive(i); setSheet(false); } };
  const onAdd = (v: string) => { setQ(v); const m = byName.get(v.trim().toLowerCase()), i = b.slots.findIndex(s => !s.mod); if (m && i >= 0) { setSlot(i, { mod: m.slug, rank: m.maxRank ?? 0 }); setQ(""); } };
  const cell = (id: string, cls: string, label: string, s: Slot, m: Entity | undefined, d: number | string | null, pol: string | null, sel: boolean, onSel: () => void, onSet: (v: Slot) => void, rankLabel: string, extra?: ReactNode) => (<div key={id} className={"bslot " + cls + (sel ? " sel" : "")}>
    {cls && <span className="bkind">{label}</span>}
    <div className="bwrap">{pol && <span className="bsp" title={pol}><PolIcon pol={pol} size={14} /></span>}<button className="bcard" aria-pressed={sel} aria-label={m ? m.name : label} onClick={onSel}>
      {m ? <ModCard e={m} rank={s.rank} drain={d} mini /> : <span className="bempty">{pol ? <PolIcon pol={pol} size={30} /> : <b>+</b>}<small>{label}</small></span>}
    </button></div>
    {m && <div className="brank"><button aria-label={rankLabel + " −"} disabled={s.rank <= 0} onClick={() => onSet({ ...s, rank: Math.max(0, s.rank - 1) })}>−</button><span title={tr("bldRankN", { r: s.rank })}>{s.rank}/{m.maxRank ?? 30}</span><button aria-label={rankLabel + " +"} disabled={s.rank >= (m.maxRank ?? 30)} onClick={() => onSet({ ...s, rank: Math.min(m.maxRank ?? 30, s.rank + 1) })}>+</button></div>}
    {extra}
  </div>);
  const shareCode = () => { const c = encodeBuild(b); setCodeTxt(c); setCopied(false); try { void navigator.clipboard.writeText(c).then(() => setCopied(true), () => setCopied(false)); } catch { /* clipboard unavailable: the code stays visible to copy by hand */ } };
  const issueText = (x: Issue) => { if (!x.key) return x.text; const a: Record<string, string | number> = {}; for (const [k, v] of Object.entries(x.args ?? {})) a[k] = k === "kind" ? tr(KIND_KEY[v as Kind]) : k === "slot" ? slotName(v as SpecialKey) : v == null ? "" : v; return tr(x.key as Key, a); };
  const over = ev.total > ev.capacity;
  const autoPol = () => save({ ...b, slots: b.slots.map(sl => { const m = sl.mod ? bySlug.get(sl.mod) : undefined; return m?.polarity && m.polarity !== sl.pol ? { ...sl, pol: m.polarity } : sl; }),
    special: Object.fromEntries(SPECIALS[kind].map(k => { const sl = specialSlot(b, k), m = sl.mod ? bySlug.get(sl.mod) : undefined; return [k, m?.polarity && m.polarity !== sl.pol ? { ...sl, pol: m.polarity } : sl]; })) });
  const resetPol = () => save({ ...b, slots: b.slots.map(({ pol: _p, ...sl }) => sl), special: Object.fromEntries(SPECIALS[kind].map(k => { const { pol: _p, ...sl } = specialSlot(b, k); return [k, sl]; })) });
  const panel = (() => {
    const spR = activeSp ? ev.special.find(x => x.key === activeSp) : undefined, mainR = !activeSp && active != null ? ev.rows[active] : undefined;
    if (!spR && !mainR) return <p className="muted bhint">{tr("bldPickSlot")}</p>;
    const label = spR ? slotName(spR.key) : tr("bldSlot", { n: mainR!.i + 1 }), s = spR ? specialSlot(b, spR.key) : b.slots[mainR!.i], m = spR ? spR.m : mainR!.m, d = spR ? (spR.bonus != null ? "+" + spR.bonus : spR.d) : mainR!.d;
    const set = (v: Slot) => (spR ? setSpecial(spR.key, v) : setSlot(mainR!.i, v));
    return (<section className="bpanel" aria-label={label}>
      <div className="bphead"><b>{label}</b>{m ? <span>{m.name}</span> : <span className="muted">{tr("bldEmpty")}</span>}{d != null && <span className="muted">{tr("bldDrain", { d })}</span>}</div>
      <div className="bpbody"><button className="btn" onClick={() => setSheet(true)}>{m ? tr("bldChangeMod") : tr("bldChooseMod")}</button><div className="polpick" role="group" aria-label={tr("bldPolLabel")}><span className="muted">{tr("bldPolLabel")}</span>
        <button className={"relicchip" + (!s.pol ? " own" : "")} aria-pressed={!s.pol} title={tr("bldNoPol")} onClick={() => set({ ...s, pol: undefined })}>{tr("bldPolNone")}</button>
        {POLS.map(x => <button key={x} className={"relicchip" + (s.pol === x ? " own" : "")} title={x === "any" ? tr("bldOmni") : x} aria-pressed={s.pol === x} onClick={() => set({ ...s, pol: s.pol === x ? undefined : x })}><PolIcon pol={x} size={18} /></button>)}</div>
        {m && <div className="bpact"><label className="muted"><input type="checkbox" checked={!!s.owned} onChange={e => set({ ...s, owned: e.target.checked })} /> {tr("trkOwned")}</label>
          <label className="muted">{tr("bldRank")} <input type="number" aria-label={tr("bldRank")} min={0} max={m.maxRank ?? 30} value={s.rank} style={{ width: "4rem" }} onChange={e => set({ ...s, rank: Math.min(m.maxRank ?? 30, Math.max(0, +e.target.value || 0)) })} /></label>
          <button className="btn" onClick={() => set({ ...s, mod: null, rank: 0, owned: false })}>{tr("remove")}</button></div>}</div>
    </section>);
  })();
  return (<><h1><input aria-label={tr("bldNameLabel")} value={b.name} onChange={e => save({ ...b, name: e.target.value })} style={{ fontSize: "1.2rem" }} /></h1>
    <div className="bar"><select aria-label={tr("bldTypeLabel")} value={kind} onChange={e => save({ ...b, kind: e.target.value as Kind, frame: "", haveFrame: false, slots: newBuild().slots, arcanes: undefined, special: undefined })}>{(Object.keys(KIND_LABEL) as Kind[]).map(k => <option key={k} value={k}>{tr(KIND_KEY[k])}</option>)}</select><select aria-label={tr("bldItemLabel")} value={b.frame} onChange={e => save({ ...b, frame: e.target.value })}><option value="">{tr("bldChoose", { kind: tr(KIND_KEY[kind]).toLowerCase() })}</option>{frames.map(f => <option key={f.slug} value={f.slug}>{f.name}</option>)}</select>
      <label className="muted"><input type="checkbox" checked={b.reactor} onChange={e => save({ ...b, reactor: e.target.checked })} /> {tr("bldReactor", { item: kind === "primary" || kind === "secondary" || kind === "melee" ? "Orokin Catalyst" : "Orokin Reactor" })}</label></div>
    {MARKET_ENABLED && frameEnt?.isPrime && <SetPrice key={frameEnt.slug} e={frameEnt} />}
    {frameEnt && (() => { const nat = frameEnt.slots?.filter(Boolean) ?? [], au = (Array.isArray(frameEnt.raw.aura) ? frameEnt.raw.aura : [frameEnt.raw.aura]).filter((x): x is string => typeof x === "string");
      return (<div className="natbox"><b>{tr("bldNative", { name: frameEnt.name })}</b>
        <div className="natrow">{nat.length ? nat.map((p, i) => <span key={i} className="polnat"><PolIcon pol={p} size={18} /> {p}</span>) : <span className="muted">{tr("bldNoneListed")}</span>}{au.map(x => <span key={"a" + x} className="polnat"><span className="muted">{tr("bldAuraSlot")}</span> <PolIcon pol={x} size={18} /> {x}</span>)}</div>
        <p className="muted">{tr("bldNativeNote")}</p></div>); })()}
    <div className="bar"><button className="btn" onClick={shareCode}>{tr("bldCopyCode")}</button>{copied && <span className="muted" role="status">{tr("bldCodeCopied")}</span>}</div>
    {codeTxt && <textarea readOnly aria-label={tr("bldCopyCode")} value={codeTxt} rows={3} onFocus={e => e.currentTarget.select()} style={{ width: "100%", maxWidth: "44rem", boxSizing: "border-box", margin: ".3rem 0 .6rem" }} />}
    <header className="bhdr"><div className="bcap"><span className="muted">{tr("bldCapacity")}</span> <b className={over ? "ERROR" : ""}>{ev.total} / {ev.capacity}</b><progress className={over ? "over" : ""} max={ev.capacity} value={Math.min(ev.total, ev.capacity)} aria-label={tr("bldCapacity")} /></div>
      <div className="bforma"><span className="muted">{tr("bldFormaCount")}</span> <b>{rq.forma}</b>{rq.omni > 0 && <span className="muted"> + {rq.omni} Omni</span>}</div>
      <div className="bhact"><button className="btn" onClick={autoPol}>{tr("bldAutoPol")}</button><button className="btn" onClick={resetPol}>{tr("bldResetPol")}</button></div></header>
    <div className="bar"><input aria-label={tr("bldAddMod")} list="modnames" placeholder={tr("bldAddModPh")} value={q} onChange={e => onAdd(e.target.value)} /><datalist id="modnames">{fit.map(m => <option key={m.slug} value={m.name} />)}</datalist></div>
    {SPECIALS[kind].length > 0 && <div className="bgrid">{ev.special.map(r => { const s = specialSlot(b, r.key), nm = slotName(r.key); return cell(r.key, "k-" + r.key, nm, s, r.m, r.bonus != null ? "+" + r.bonus : r.d, r.pol, activeSp === r.key, () => { const open = activeSp !== r.key; setActiveSp(open ? r.key : null); setActive(null); if (open && !r.m) setSheet(true); }, v => setSpecial(r.key, v), nm); })}</div>}
    <div className="bgrid">{ev.rows.map(r => cell(String(r.i), "", tr("bldSlot", { n: r.i + 1 }), b.slots[r.i], r.m, r.d, r.pol, active === r.i, () => selMain(r.i), v => setSlot(r.i, v), tr("bldSlotRank", { n: r.i + 1 })))}</div>
    {panel}
    {(kind === "primary" || kind === "secondary" || kind === "melee") && <DamageTest b={b} weaponEnt={frameEnt} mods={bySlug} />}
    {sheet && <Sheet title={activeSp ? slotName(activeSp) : active != null ? tr("bldSlot", { n: active + 1 }) : tr("mods")} onClose={() => setSheet(false)}><ModPicker mods={activeSp ? fitSp : fit} onPick={pick} taken={new Set(allSlots(b).map(x => x.mod).filter((x): x is string => !!x))} target={activeSp ? slotName(activeSp).toLowerCase() : active != null ? tr("bldSlot", { n: active + 1 }).toLowerCase() : tr("mpFirstEmpty")} /></Sheet>}
    {kind === "warframe" && <><h2>{tr("bldArcanes")}</h2>
    {!arcs ? <p className="muted">{ar.status === "LOADING" ? tr("bldArcLoading") : tr("bldArcNA")}</p> : <><datalist id="arcnames">{arcs.map(a => <option key={a.slug} value={a.name} />)}</datalist>
      <ul className="list comp">{[0, 1].map(i => { const s = arcSlot(i), a = s.mod ? arcBy.get(s.mod) : undefined; return (<li key={i}><span>{tr("bldArcSlot", { n: i + 1 })} · {a ? <b>{a.name}</b> : s.mod ? <span className="muted">{tr("bldNotLoaded")}</span> : <span className="muted">{tr("bldEmpty")}</span>}</span>
        <span>{s.mod ? <><label className="muted"><input type="checkbox" checked={!!s.owned} onChange={e => setArc(i, { ...s, owned: e.target.checked })} /> {tr("trkOwned")} </label><button className="btn" onClick={() => setArc(i, { mod: null })}>{tr("remove")}</button></> : <input aria-label={tr("bldArcSlot", { n: i + 1 })} list="arcnames" placeholder={tr("bldAddArc")} value={aq[i]} onChange={e => onArc(i, e.target.value)} />}</span></li>); })}</ul>
      {rq.arcDup && <p className="ERROR">{tr("bldArcDup")}</p>}</>}</>}
    {ev.issues.length > 0 ? <ul>{ev.issues.map((x, i) => <li key={i} className={x.level === "error" ? "ERROR" : "STALE"} style={{ border: 0 }}>{x.level === "error" ? tr("bldErr") : tr("bldNote")} {issueText(x)}</li>)}</ul> : <p className="gold">{tr("bldNoIssues")}</p>}
    {rq.frame && <><h2>{tr("bldReq")}</h2>
      <ul className="list comp"><li><span>{rq.frame.name}</span><label className="muted"><input type="checkbox" checked={!!b.haveFrame} onChange={e => save({ ...b, haveFrame: e.target.checked })} /> {tr("bldHaveIt")} {!rq.frame.have && (kind === "warframe" || kind === "primary" || kind === "secondary" || kind === "melee") && <Link to={`/${kind === "warframe" ? "warframe" : "weapon"}/${rq.frame.slug}`}>{tr("bldOpenPlan")}</Link>}</label></li>
        {rq.forma > 0 && <li><span>Forma <b>×{rq.forma}</b> <span className="muted">{tr("bldFormaFrom")}</span></span><Link to="/farm/Forma%20Blueprint">{tr("whereToFarm")}</Link></li>}
        {rq.omni > 0 && <li><span>Omni Forma <b>×{rq.omni}</b> <span className="muted">{tr("bldOmniFor")}</span></span><Link to="/farm/Omni%20Forma%20Blueprint">{tr("whereToFarm")}</Link></li>}
        {rq.mods.map(m => (<li key={m.slug}><span><ItemArt file={bySlug.get(m.slug)?.image ?? null} size={30} /> {m.name} <span className="muted">{tr("bldRankN", { r: m.rank })}{m.endo != null ? " · " + tr("bldAboutEndo", { n: m.endo }) : ""}</span>{prices && typeof prices === "object" && !m.owned && <span className="muted">{prices[m.slug] != null ? <> · {tr("bldAbout")} <Plat n={prices[m.slug] as number} /> {tr("bldRank0")}</> : bySlug.get(m.slug)?.tradable === false ? " · " + tr("bldNoTrade") : " · " + tr("bldNoMarket")}</span>}{!m.owned && acqLine(bySlug.get(m.slug))}</span>
          <span><span className={"tag " + (m.owned ? "FRESH" : "ERROR")}>{m.owned ? tr("bldHave") : tr("bldMissing")}</span> {!m.owned && <Link to={`/farm/${encodeURIComponent(m.name)}`}>{tr("whereToFarm")}</Link>}</span></li>))}
        {rq.arcanes.map(a => (<li key={a.slug}><span><ItemArt file={arcBy.get(a.slug)?.image ?? null} size={30} /> {a.name} <span className="muted">{tr("bldArcaneWord")}</span>{!a.owned && acqLine(arcBy.get(a.slug))}</span><span><span className={"tag " + (a.owned ? "FRESH" : "ERROR")}>{a.owned ? tr("bldHave") : tr("bldMissing")}</span> {!a.owned && <Link to={`/farm/${encodeURIComponent(a.name)}`}>{tr("whereToFarm")}</Link>}</span></li>))}</ul>
      <p className="muted">{tr("bldMissModsN", { n: rq.missingMods.length })}{rq.arcanes.length ? " " + tr("bldMissArcN", { n: rq.missingArcanes.length }) : ""}{rq.endoKnown && rq.endoTotal > 0 ? " " + tr("bldEndoTotal", { n: rq.endoTotal }) : ""} {tr("bldFormaNote")}</p>
      {MARKET_ENABLED && rq.missingMods.length > 0 && <div className="bar">{(prices === null || prices === "error") && <button className="btn" onClick={() => void runPrices()}>{tr("bldCheckPrices")}</button>}{prices === "loading" && <span className="muted">{tr("bldChecking", { n: rq.missingMods.length })}</span>}{prices === "error" && <span className="muted">{tr("relMarketDown")}</span>}{priceTotal != null && <span className="muted">{tr("bldBuyAllA")} <b><Plat n={priceTotal} /></b> {tr("bldBuyAllB")}</span>}</div>}
      <div className="bar"><button className="btn" onClick={send} disabled={(!rq.missingMods.length && !rq.missingArcanes.length && !rq.forma && !rq.omni) || sent}>{sent ? tr("bldSent") : tr("bldSend")}</button>
        <button className="btn" onClick={addRoad} disabled={!rq.missingMods.length && !rq.missingArcanes.length && !rq.forma && !rq.omni && !readReqs().some(r => r.build === b.id)}>{road || readReqs().some(r => r.build === b.id) ? tr("bldUpdateRoad") : tr("bldAddRoad")}</button></div>
      {road && <p className="muted">{tr("bldRoadDone")} <Link to="/roadmap">{tr("openRoadmap")}</Link></p>}
      {sent && <p className="muted">{tr("bldSentNote")}</p>}</>}
    {st.stats.length > 0 && <><h2>{tr("bldStats")}</h2>
      <ul className="list comp">{st.stats.map(s => { const base = ["health", "shield", "armor", "energy"].includes(s.key) ? frameEnt?.stats.find(([l]) => l === LABEL[s.key])?.[1] : undefined, sg = s.pct > 0 ? "+" : "";
        return (<li key={s.key}><span>{s.label} <b>{sg}{+s.pct.toFixed(1)}%</b>{base != null && <span className="muted"> · {tr("bldStatBase", { x: Math.round(base * (1 + s.pct / 100)), base })}</span>}</span>
          <details><summary>{tr("bldExplain")}</summary><ul className="sub">{s.parts.map((p, i) => <li key={i}>{p.mod} {p.pct > 0 ? "+" : ""}{p.pct}%</li>)}</ul>
            <p className="muted">{base != null ? tr("bldExpBase", { base, pct: +s.pct.toFixed(1), res: +(base * (1 + s.pct / 100)).toFixed(1) }) : ["strength", "duration", "efficiency", "range"].includes(s.key) ? tr("bldExpPct", { pct: +s.pct.toFixed(1), res: +(100 + s.pct).toFixed(1) }) : tr("bldExpSum", { pct: +s.pct.toFixed(1) })}</p></details></li>); })}</ul>
      <p className="muted">{tr("bldStatNote")}{st.unparsed.length > 0 && " " + (st.unparsed.length > 6 ? tr("bldNotCalcMore", { list: st.unparsed.slice(0, 6).join("; "), n: st.unparsed.length - 6 }) : tr("bldNotCalc", { list: st.unparsed.join("; ") }))}</p></>}
    {allSlots(b).some(s => s.mod) && <BuildAI facts={facts} />}
    <p className="muted">{tr("bldScope")}</p></>);
}
