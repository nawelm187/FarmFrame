import { Pic } from "./ItemArt";
import { NIGHTWAVE_SERIES, SYNDICATE_WIKI, WIKI_VERIFIED, type WikiOffer, type WikiSyndicate } from "./data/syndicateWiki";
const fmt = (n: number | null) => (n == null ? "?" : n.toLocaleString());
/** The wiki entry for a syndicate key (see keyOf), when we have one. */
export const wikiFor = (key: string): WikiSyndicate | undefined => SYNDICATE_WIKI[key];
/** Title of a rank number, e.g. 5 -> "Maxim". Rank 0 prefers "Neutral" because that is how the offers list names it. */
const titleOf = (w: WikiSyndicate, rank: number) => (w.ranks.find(r => r.rank === rank && r.title === "Neutral") ?? w.ranks.find(r => r.rank === rank))?.title;
/** Everything needed to rank up: what you hand over (items, credits, the standing you give up), what the rank unlocks and the standing range. */
export function RankCards({ w, here, goal }: { w: WikiSyndicate; here?: number; goal?: number }) {
  const list = [...w.ranks].sort((a, b) => a.rank - b.rank || (a.title === "Neutral" ? 1 : -1));
  if (!list.length) return null;
  return (<>
    <h3>What each rank asks for</h3>
    <div className="cgrid wide">{list.map(r => <article key={r.rank + r.title} className={"minicard rankcard" + (here === r.rank && r.title !== "Initiation" ? " here" : "") + (goal === r.rank && (goal ?? 0) > (here ?? 0) ? " goal" : "")}>
      <h4><span className="rknum">{r.rank}</span> {r.title}</h4>
      {r.min != null && <p className="muted" style={{ margin: 0 }}>Standing {fmt(r.min)} to {fmt(r.max)}</p>}
      {(r.sacrifice.length > 0 || r.credits != null || r.standing != null) && <div><small className="muted">To reach it you hand over</small>
        <div className="chipline">{r.sacrifice.map(s => <span key={s} className="tag">{s}</span>)}{r.credits != null && <span className="tag">{fmt(r.credits)} credits</span>}{r.standing != null && <span className="tag">{fmt(r.standing)} standing</span>}</div></div>}
      {r.benefits.length > 0 && <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>{r.benefits.map(b => <li key={b}>{b}</li>)}</ul>}
    </article>)}</div>
    <p className="muted">Credits and standing are what the wiki lists for the rank-up. A "?" means the screenshot showed no value.</p></>);
}
const costText = (o: WikiOffer) => `${o.cost.toLocaleString()} ${o.currency ?? "standing"}${o.credits != null ? ` + ${o.credits.toLocaleString()} credits` : ""}`;
/** What the syndicate sells, grouped by the rank that unlocks it (or by the list it belongs to). `have` highlights what your standing already covers. */
export function WikiOffers({ w, have }: { w: WikiSyndicate; have: number }) {
  const groups = new Map<string, { order: number; items: WikiOffer[] }>();
  w.offers.forEach((o, i) => {
    const t = o.rank != null ? titleOf(w, o.rank) : undefined;
    const g = (o.section && o.section !== (t ? `Rank ${o.rank}: ${t}` : "") ? o.section : o.rank != null ? `Rank ${o.rank}${t ? `: ${t}` : ""}` : "Other"), cur = groups.get(g) ?? { order: o.rank != null ? o.rank : 100 + i, items: [] };
    cur.items.push(o); groups.set(g, cur);
  });
  const list = [...groups].sort((a, b) => a[1].order - b[1].order);
  return (<div className="cols" style={{ alignItems: "start" }}>{list.map(([g, { items }]) => <div key={g} className="seccard"><h3>{g}</h3><span className="muted">{items.length} offers</span>
    <div className="scrollbox" style={{ maxHeight: "24rem" }}><div style={{ display: "grid", gap: ".35rem" }}>{items.map(o => { const can = !o.currency && have > 0 && o.cost <= have;
      return <div key={o.item + o.cost} className={"offer" + (can ? " can" : "")}><Pic name={o.item.replace(/\s*\(.*\)$/, "")} size={30} /><span className="tn"><b title={o.item}>{o.item}</b><small>{costText(o)}{o.note ? ` · ${o.note}` : ""}</small></span>
        {!o.currency && have > 0 && <span className={"tag" + (can ? " FRESH" : "")}>{can ? "Affordable" : `${(o.cost - have).toLocaleString()} more`}</span>}</div>; })}</div></div></div>)}</div>);
}
/** Nightwave: the current series' ranks and rewards. */
export function NightwaveSeries() {
  const s = NIGHTWAVE_SERIES;
  return (<><h3>{s.name}</h3><p>{s.note}</p>
    <div className="scrollbox" style={{ maxHeight: "24rem" }}><ul className="rows">{s.rewards.map(r => <li key={r.rank}><b>Rank {r.rank}</b><span className="grow">{r.reward}</span><span className="muted">{r.standing.toLocaleString()} total standing</span></li>)}</ul></div></>);
}
export const WIKI_NOTE = `Ranks and offers: typed by hand from the Warframe Wiki syndicate pages on ${WIKI_VERIFIED}. The wiki changes, so check it before relying on one number.`;
