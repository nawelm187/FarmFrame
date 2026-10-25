import { useDeferredValue, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCatalog } from "../lib/useCatalog";
import { CATS, imgRetry, imgUrl, type Cat } from "../lib/catalog";
import ModCard from "../ModCard";
import CompanionMods from "./CompanionMods";
import RailjackParts from "./RailjackParts";
import RailjackWeapons from "./RailjackWeapons";
import { Badge, Prov, Unavailable } from "./parts";
import { useT } from "../i18n";
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
  const l = dq.trim().toLowerCase(), m = l ? pool.filter(e => e.name.toLowerCase().includes(l)) : pool, shown = m.slice(0, 60 * more);
  const setV = (x: "all" | "prime" | "normal") => { const n = new URLSearchParams(sp); if (x === "all") n.delete("v"); else n.set("v", x); setSp(n, { replace: true }); setMore(1); };
  return (<><h1>{name}</h1><p className="lead">{t("exLead", { n: all.length })} <Badge s={status} />{cat === "warframe" && <> {t("exHelm")} <Link to="/helminth">{t("helminth")}</Link>.</>}</p>
    <div className="bar"><input aria-label={t("exFilter", { name })} placeholder={t("exFilter", { name: name.toLowerCase() })} value={q} onChange={e => { const n = new URLSearchParams(sp); if (e.target.value) n.set("q", e.target.value); else n.delete("q"); setSp(n, { replace: true }); setMore(1); }} /></div>
    {canSplit && <div className="chips" role="group" aria-label={t("exPrimeOrNormal")}>{([["all", t("psAll"), all.length], ["prime", t("psPrime"), nPrime], ["normal", t("exNormal"), all.length - nPrime]] as const).map(([k, lab, n]) => <button key={k} className={"btn" + (v === k ? " on" : "")} aria-pressed={v === k} onClick={() => setV(k)}>{lab} <span className="muted">{n}</span></button>)}</div>}
    {cat === "mod" || cat === "railjack" ? <div className="cards">{shown.map(e => <Link key={e.slug} to={`/${cat}/${e.slug}`} className="cardlink"><ModCard e={e} /></Link>)}{!m.length && <p className="muted">{t("exNoMQ", { name: name.toLowerCase(), q })}</p>}</div> : <ul className="list cat">{shown.map(e => (
      <li key={e.slug}><span className="thumb">{e.image && <img src={imgUrl(e.image)} alt="" loading="lazy" decoding="async" width={48} height={48} onError={ev => { if (!imgRetry(ev)) ev.currentTarget.style.display = "none"; }} />}</span>
        <Link to={`/${cat}/${e.slug}`}>{e.name}</Link><span className="muted">{e.type}{e.isPrime ? " · " : ""}{e.isPrime && <span className="gold">{t("psPrime")}</span>}</span></li>))}
      {!m.length && <li className="muted">{t(q ? (v !== "all" ? "exNoMQV" : "exNoMQ") : (v !== "all" ? "exNoMV" : "exNoM"), { name: name.toLowerCase(), q, kind: v === "prime" ? t("psPrime") : t("exNormalLc") })}</li>}</ul>}
    {m.length > shown.length && <button className="btn" onClick={() => setMore(more + 1)}>{t("psMore", { n: m.length - shown.length })}</button>}{cat === "companion" && <CompanionMods q={dq} />}{cat === "railjack" && <><RailjackParts q={dq} /><RailjackWeapons q={dq} /></>}<Prov rec={rec} /></>);
}
