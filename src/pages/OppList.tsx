import RarityMark from "../RarityMark";
import { Pic } from "../ItemArt";
import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import type { Opp } from "../lib/farmNow";
import { value } from "../lib/farmNow";
import type { Status } from "../lib/data";
import { Badge } from "./parts";
import { READY_LABEL, readiness } from "../lib/unlock";
import { useT } from "../i18n";
import { rich } from "../lib/rich";
/** "What can I farm now" cards: what to run, which exact relics, which goal moves, and why. Shared by Home and Roadmap. */
export default function OppList({ opps, fisStatus, invStatus }: { opps: Opp[]; fisStatus: Status; invStatus: Status }) {
  const t = useT(), fisBadge = <Badge s={fisStatus} />, invBadge = <Badge s={invStatus} />;
  /** Only says the top pick is easier than the rest when the data shows it: it has a relic you own and no other option does. */
  const easier = (o: Opp, i: number) => i === 0 && opps.length > 1 && !!o.relics?.some(r => r.owned > 0) && opps.slice(1).every(x => !x.relics?.some(r => r.owned > 0));
  return (<ol className="opps">{opps.map((o, i) => (<li key={o.key}>
    {i === 0 && readiness(o.blocks) === "ready" && <span className="tag FRESH">{t("opRecommended")}</span>}<span className={"tag " + (readiness(o.blocks) === "ready" ? "FRESH" : readiness(o.blocks) === "check" ? "STALE" : "ERROR")}>{READY_LABEL[readiness(o.blocks)]}</span>
    <div className="row"><b className="oppt">{o.tier && <RelicArt tier={o.tier} size={32} />}{o.title}</b><Link className="btn" to={o.kind === "fissure" ? "/fissures" : "/invasions"}>{o.kind === "fissure" ? t("opOpenFis") : t("opOpenInv")}</Link></div>
    {o.plays && o.plays.length > 0 && <ul className="plays" aria-label={t("opWhatOpen")}>{o.plays.map(p => <li key={p.relic}>{rich(t("opAt", { mission: p.mission, node: p.node }), { open: <b>{t("opOpenRelic", { relic: p.relic })}</b> })} <span className="muted">{p.parts.length > 2 ? t("opForMore", { list: p.parts.slice(0, 2).join(", "), n: p.parts.length - 2 }) : t("opFor", { list: p.parts.join(", ") })}</span></li>)}</ul>}
    {o.relics && o.relics.length > 0 && <div className="chips" aria-label={t("opExactAria")}>{o.relics.slice(0, 5).map(r => <Link key={r.relic} className={"relicchip" + (r.owned > 0 ? " own" : "")} to={`/relics?q=${encodeURIComponent(r.relic)}`}><RelicArt tier={o.tier ?? ""} name={r.relic} size={22} /><span>{r.relic}</span><RarityMark r={r.rarity} />{r.parts.length > 1 && <span className="muted">{t("opPartsN", { n: r.parts.length })}</span>}{r.owned > 0 && <span className="tag FRESH">{t("trkOwned")}</span>}</Link>)}</div>}
    {o.nodes && o.nodes.length > 1 && <details><summary>{t("opNodes", { n: o.nodes.length })}</summary><ul>{o.nodes.map(n => <li key={n.node + n.mission}>{t("opAtNode", { mission: n.mission, node: n.node })}{n.storm ? ` (${t("opStorm")})` : ""}{n.hard ? ` (${t("mrSecSteel")})` : ""} <span className="tag">{READY_LABEL[n.ready]}</span></li>)}</ul></details>}
    <div className="muted advrow">{t("opAdv")} {o.advances.slice(0, 4).map((a, i) => <span key={i} className="advit"><Pic name={a} size={24} /> {a}{i < Math.min(o.advances.length, 4) - 1 ? ", " : ""}</span>)}{o.advances.length > 4 ? ` ${t("alMoreN", { n: o.advances.length - 4 })}` : ""}</div>
    {o.goals && o.goals.length > 0 && <div className="goalrow">{o.goals.map(g => <span key={g.name} className="tag">{g.total ? t("opGoalParts", { name: g.name, have: g.have, total: g.total }) : g.name}</span>)}</div>}
    <div className="muted">{t("plValue")} <b>{value(o.advances.length)}</b></div>
    <details open={i === 0 || !!o.blocks?.length}><summary>{t("advWhy")}</summary><ul>{o.why.map(w => <li key={w}>{w}</li>)}{(o.blocks ?? []).map(b => <li key={b.text}><b>{(b.severity === "blocked" ? t("saNeeds") : t("saCheck")) + " "}</b>{b.text}</li>)}{easier(o, i) && <li>{t("opLower")}</li>}<li>{rich(t("opLive"), { fis: fisBadge, inv: invBadge })}</li></ul></details></li>))}</ol>);
}
