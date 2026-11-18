import { useDeferredValue, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCatalog } from "../lib/useCatalog";
import { CATS, imgRetry, imgUrl, type Cat } from "../lib/catalog";
import ModCard from "../ModCard";
import { PolIcon } from "../Icons";
import { POLS, RAR, RAR_KEY } from "../ModPicker";
import ModCompare from "../ModCompare";
import CompanionMods from "./CompanionMods";
import RailjackParts from "./RailjackParts";
import RailjackWeapons from "./RailjackWeapons";
import { Badge, Prov, Unavailable } from "./parts";
import { tp, useT } from "../i18n";
import { CAT_MANY } from "../lib/catLabel";
/** Categories where an item can have a Prime version. Mods and Railjack do not. */
const PRIMEABLE: Cat[] = ["warframe", "weapon", "companion", "archwing"];
export default function Explore({ cat }: { cat: Cat }) {
  const t = useT(), c = CATS[cat], name = t(CAT_MANY[cat]), [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", [more, setMore] = useState(1), dq = useDeferredValue(q);
  const { items: raw, rec, status } = useCatalog(cat), all = raw && cat === "warframe" ? raw.filter(e => e.name !== "Helminth") : raw;
  if (!all) return <><h1>{name}</h1><Unavailable title={name} art={c.label} status={status} why={status === "LOADING" ? t("enLoading") : rec?.data ? t("exShape") : t("noVerified")} rec={rec} /></>;
  const nPrime = all.filter(e => e.isPrime).length, canSplit = PRIMEABLE.includes(cat) && nPrime > 0 && nPrime < all.length;
  const v = canSplit && (sp.get("v") === "prime" || sp.get("v") === "normal") ? (sp.get("v") as "prime" | "normal") : "all";
  const pool = v === "prime" ? all.filter(e => e.isPrime) : v === "normal" ? all.filter(e => !e.isPrime) : all;
  const isMod = cat === "mod", pol = isMod ? sp.get("pol") ?? "" : "", rar = isMod ? sp.get("rar") ?? "" : "", sort = isMod ? sp.get("s") ?? "name" : "name";
  const l = dq.trim().toLowerCase(), byText = l ? pool.filter(e => e.name.toLowerCase().includes(l)) : pool;
  const byAttr = isMod ? byText.filter(e => (!pol || e.polarity === pol) && (!rar || e.rarity.toLowerCase() === rar)) : byText;
  const m = isMod && sort !== "name" ? [...byAttr].sort((a, b) => ((a.baseDrain ?? 99) - (b.baseDrain ?? 99)) * (sort === "drain-asc" ? 1 : -1)) : byAttr, shown = m.slice(0, 60 * more);
  const cmpSlugs = isMod ? (sp.get("c") ?? "").split(",").filter(Boolean).slice(0, 3) : [], cmpMods = cmpSlugs.map(x => all.find(e => e.slug === x)).filter((e): e is NonNullable<typeof e> => !!e);
  const setC = (slugs: string[]) => { const n = new URLSearchParams(sp); if (slugs.length) n.set("c", slugs.join(",")); else n.delete("c"); setSp(n, { replace: true }); };
  const toggleC = (slug: string) => setC(cmpSlugs.includes(slug) ? cmpSlugs.filter(x => x !== slug) : cmpSlugs.length >= 3 ? cmpSlugs : [...cmpSlugs, slug]);
  const setP = (k: string, val: string) => { const n = new URLSearchParams(sp); if (val && !(k === "s" && val === "name")) n.set(k, val); else n.delete(k); setSp(n, { replace: true }); setMore(1); };
  const setV = (x: "all" | "prime" | "normal") => { const n = new URLSearchParams(sp); if (x === "all") n.delete("v"); else n.set("v", x); setSp(n, { replace: true }); setMore(1); };
  return (<><h1>{name}</h1><p className="lead">{t("exLead", { n: all.length })} <Badge s={status} />{cat === "warframe" && <> {t("exHelm")} <Link to="/helminth">{t("helminth")}</Link>.</>}</p>
    <div className="bar"><input aria-label={t("exFilter", { name })} placeholder={t("exFilter", { name: name.toLowerCase() })} value={q} onChange={e => { const n = new URLSearchParams(sp); if (e.target.value) n.set("q", e.target.value); else n.delete("q"); setSp(n, { replace: true }); setMore(1); }} /></div>
    {isMod && <><div className="bar"><select aria-label={t("mpSort")} value={sort} onChange={e => setP("s", e.target.value)}><option value="name">{t("mpName")}</option><option value="drain-asc">{t("mpDrainLow")}</option><option value="drain-desc">{t("mpDrainHigh")}</option></select><span className="muted" role="status">{tp("mpCount", m.length)}</span></div>
      <div className="chips" role="group" aria-label={t("mpPolarity")}><button className={"relicchip" + (!pol ? " own" : "")} aria-pressed={!pol} onClick={() => setP("pol", "")}>{t("mpAnyPol")}</button>{POLS.map(x => <button key={x} className={"relicchip" + (pol === x ? " own" : "")} aria-pressed={pol === x} title={x} onClick={() => setP("pol", pol === x ? "" : x)}><PolIcon pol={x} size={20} /></button>)}</div>
      <div className="chips" role="group" aria-label={t("mpRarity")}>{RAR.map(r => <button key={r} className={"relicchip" + (rar === r ? " own" : "")} aria-pressed={rar === r} onClick={() => setP("rar", rar === r ? "" : r)}>{t(RAR_KEY[r])}</button>)}</div></>}
    {isMod && (cmpMods.length >= 2 ? <ModCompare mods={cmpMods} cat={cat} onRemove={x => setC(cmpSlugs.filter(y => y !== x))} onClear={() => setC([])} /> : <p className="muted">{t("cmpHint")}</p>)}
    {canSplit && <div className="chips" role="group" aria-label={t("exPrimeOrNormal")}>{([["all", t("psAll"), all.length], ["prime", t("psPrime"), nPrime], ["normal", t("exNormal"), all.length - nPrime]] as const).map(([k, lab, n]) => <button key={k} className={"btn" + (v === k ? " on" : "")} aria-pressed={v === k} onClick={() => setV(k)}>{lab} <span className="muted">{n}</span></button>)}</div>}
    {cat === "mod" || cat === "railjack" ? <div className="cards mods">{shown.map(e => <div key={e.slug} className="cmpcell"><Link to={`/${cat}/${e.slug}`} className="cardlink"><ModCard e={e} /></Link>{isMod && <button className={"relicchip" + (cmpSlugs.includes(e.slug) ? " own" : "")} aria-pressed={cmpSlugs.includes(e.slug)} disabled={!cmpSlugs.includes(e.slug) && cmpSlugs.length >= 3} onClick={() => toggleC(e.slug)}>{cmpSlugs.includes(e.slug) ? t("cmpOn") : t("cmpAdd")}</button>}</div>)}{!m.length && <p className="muted">{t("exNoMQ", { name: name.toLowerCase(), q })}</p>}</div> : <ul className="list cat">{shown.map(e => (
      <li key={e.slug}><span className="thumb">{e.image && <img src={imgUrl(e.image)} alt="" loading="lazy" decoding="async" width={48} height={48} onError={ev => { if (!imgRetry(ev)) ev.currentTarget.style.display = "none"; }} />}</span>
        <Link to={`/${cat}/${e.slug}`}>{e.name}</Link><span className="muted">{e.type}{e.isPrime ? " · " : ""}{e.isPrime && <span className="gold">{t("psPrime")}</span>}</span></li>))}
      {!m.length && <li className="muted">{t(q ? (v !== "all" ? "exNoMQV" : "exNoMQ") : (v !== "all" ? "exNoMV" : "exNoM"), { name: name.toLowerCase(), q, kind: v === "prime" ? t("psPrime") : t("exNormalLc") })}</li>}</ul>}
    {m.length > shown.length && <button className="btn" onClick={() => setMore(more + 1)}>{t("psMore", { n: m.length - shown.length })}</button>}{cat === "companion" && <CompanionMods q={dq} />}{cat === "railjack" && <><RailjackParts q={dq} /><RailjackWeapons q={dq} /></>}<Prov rec={rec} /></>);
}
