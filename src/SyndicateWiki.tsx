import { Pic } from "./ItemArt";
import { NIGHTWAVE_SERIES, SYNDICATE_WIKI, type WikiOffer, type WikiSyndicate } from "./data/syndicateWiki";
import { useT } from "./i18n";
const fmt = (n: number | null) => (n == null ? "?" : n.toLocaleString());
/** The wiki entry for a syndicate key (see keyOf), when we have one. */
export const wikiFor = (key: string): WikiSyndicate | undefined => SYNDICATE_WIKI[key];
/** Title of a rank number, e.g. 5 -> "Maxim". Rank 0 prefers "Neutral" because that is how the offers list names it. */
const titleOf = (w: WikiSyndicate, rank: number) => (w.ranks.find(r => r.rank === rank && r.title === "Neutral") ?? w.ranks.find(r => r.rank === rank))?.title;
/** Everything needed to rank up: what you hand over (items, credits, the standing you give up), what the rank unlocks and the standing range. */
export function RankCards({ w, here, goal }: { w: WikiSyndicate; here?: number; goal?: number }) {
  const tr = useT(), list = [...w.ranks].sort((a, b) => a.rank - b.rank || (a.title === "Neutral" ? 1 : -1));
  if (!list.length) return null;
  return (<>
    <h3>{tr("swRanksH")}</h3>
    <div className="cgrid wide">{list.map(r => <article key={r.rank + r.title} className={"minicard rankcard" + (here === r.rank && r.title !== "Initiation" ? " here" : "") + (goal === r.rank && (goal ?? 0) > (here ?? 0) ? " goal" : "")}>
      <h4><span className="rknum">{r.rank}</span> {r.title}</h4>
      {r.min != null && <p className="muted" style={{ margin: 0 }}>{tr("swRange", { min: fmt(r.min), max: fmt(r.max) })}</p>}
      {(r.sacrifice.length > 0 || r.credits != null || r.standing != null) && <div><small className="muted">{tr("swHandOver")}</small>
        <div className="chipline">{r.sacrifice.map(s => <span key={s} className="tag">{s}</span>)}{r.credits != null && <span className="tag">{tr("alCredits", { n: fmt(r.credits) })}</span>}{r.standing != null && <span className="tag">{tr("drNoteStanding", { n: fmt(r.standing) })}</span>}</div></div>}
      {r.benefits.length > 0 && <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>{r.benefits.map(b => <li key={b}>{b}</li>)}</ul>}
    </article>)}</div>
    <p className="muted">{tr("swNote")}</p></>);
}
const costText = (o: WikiOffer, tr: ReturnType<typeof useT>) => `${o.currency ? `${o.cost.toLocaleString()} ${o.currency}` : tr("drNoteStanding", { n: o.cost.toLocaleString() })}${o.credits != null ? ` + ${tr("alCredits", { n: o.credits.toLocaleString() })}` : ""}`;
/** The group titles are built in English so they can be compared with the wiki data; only the shown text is translated. */
const groupText = (g: string, tr: ReturnType<typeof useT>) => { const m = /^Rank (\d+)(?:: (.*))?$/.exec(g); return m ? tr("synRank", { n: m[1] }) + (m[2] ? `: ${m[2]}` : "") : g === "Other" ? tr("swOther") : g; };
/** What the syndicate sells, grouped by the rank that unlocks it (or by the list it belongs to). `have` highlights what your standing already covers. */
export function WikiOffers({ w, have }: { w: WikiSyndicate; have: number }) {
  const tr = useT(), groups = new Map<string, { order: number; items: WikiOffer[] }>();
  w.offers.forEach((o, i) => {
    const t = o.rank != null ? titleOf(w, o.rank) : undefined;
    const g = (o.section && o.section !== (t ? `Rank ${o.rank}: ${t}` : "") ? o.section : o.rank != null ? `Rank ${o.rank}${t ? `: ${t}` : ""}` : "Other"), cur = groups.get(g) ?? { order: o.rank != null ? o.rank : 100 + i, items: [] };
    cur.items.push(o); groups.set(g, cur);
  });
  const list = [...groups].sort((a, b) => a[1].order - b[1].order);
  return (<div className="cols" style={{ alignItems: "start" }}>{list.map(([g, { items }]) => <div key={g} className="seccard"><h3>{groupText(g, tr)}</h3><span className="muted">{tr("synOffersN", { n: items.length })}</span>
    <div className="scrollbox" style={{ maxHeight: "24rem" }}><div style={{ display: "grid", gap: ".35rem" }}>{items.map(o => { const can = !o.currency && have > 0 && o.cost <= have;
      return <div key={o.item + o.cost} className={"offer" + (can ? " can" : "")}><Pic name={o.item.replace(/\s*\(.*\)$/, "")} size={30} /><span className="tn"><b title={o.item}>{o.item}</b><small>{costText(o, tr)}{o.note ? ` · ${o.note}` : ""}</small></span>
        {!o.currency && have > 0 && <span className={"tag" + (can ? " FRESH" : "")}>{can ? tr("synAffordable") : tr("pchMoreN", { n: (o.cost - have).toLocaleString() })}</span>}</div>; })}</div></div></div>)}</div>);
}
/** Nightwave: the current series' ranks and rewards. */
export function NightwaveSeries() {
  const tr = useT(), s = NIGHTWAVE_SERIES;
  return (<><h3>{s.name}</h3><p>{s.note}</p>
    <div className="scrollbox" style={{ maxHeight: "24rem" }}><ul className="rows">{s.rewards.map(r => <li key={r.rank}><b>{tr("synRank", { n: r.rank })}</b><span className="grow">{r.reward}</span><span className="muted">{tr("swTotalStanding", { n: r.standing.toLocaleString() })}</span></li>)}</ul></div></>);
}
