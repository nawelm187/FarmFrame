import { useRefreshAt, useWorld } from "./lib/data";
import { ts } from "./lib/format";
import { baroMatches, isExp, traderState, type Trader } from "./lib/planner";
import { useNeeded } from "./lib/useNeeded";
import { Credits } from "./Money";
import Npc from "./Npc";
import { Countdown, Panel, Unavailable } from "./pages/parts";
const isTrader = (d: unknown): d is Trader => isExp(d);
/** Baro Ki'Teer (Void Trader): here or coming, where, until when, his full stock with prices, and which items advance what you still need. */
export default function Baro({ full = false }: { full?: boolean }) {
  const { data, status, rec } = useWorld("voidTrader", isTrader), needed = useNeeded();
  const now = Date.now(), st = data ? traderState(data, now) : "unknown", act = data?.activation ? ts(data.activation) : NaN, end = data ? ts(data.expiry) : NaN;
  // Re-request when his visit starts or ends. If the visit is over, ask again about 30 seconds after the last answer: the source may already know his next arrival.
  useRefreshAt("voidTrader", !data ? null : st === "gone" ? (rec?.at ?? now) + 30_000 : st === "here" ? end : Number.isFinite(act) ? act : null);
  const T = "Void Trader";
  if (!data) return <Unavailable title={T} status={status} why="No verified data." rec={rec} />;
  // Just refreshed and still over: say so instead of loading forever.
  const justAsked = !!rec?.at && now - rec.at < 20_000;
  if (st === "gone" && justAsked) return <Unavailable title={T} status="LOADING" why="" note="Updating Baro's schedule…" rec={rec} />;
  if (st === "gone") return <Panel title={T} status={status} rec={rec}><Npc name="Baro Ki'Teer" role="Void Trader" /><b>Not here right now</b><div className="muted">His last visit ended {new Date(data.expiry).toLocaleString()}. The data source has not published his next arrival yet; this panel checks again on its own.</div></Panel>;
  if (st === "coming") return <Panel title={T} status={status} rec={rec}><Npc name="Baro Ki'Teer" role="Void Trader" /><b>Not here yet</b>{data.location && <span className="muted"> · arrives at {data.location}</span>}{data.activation && <div><Countdown exp={data.activation} pre="arrives in " /></div>}
    {data.activation && <div className="muted">{new Date(data.activation).toLocaleString()}</div>}</Panel>;
  const hit = baroMatches(data, needed, now), inv = [...(data.inventory ?? [])].sort((a, b) => Number(needed.has(String(b.item).toLowerCase())) - Number(needed.has(String(a.item).toLowerCase())));
  return <Panel title={T} status={status} rec={rec}><Npc name="Baro Ki'Teer" role="Void Trader" />
    <p><span className="tag FRESH">Here now</span> <b>{data.location ?? "Location not in the data"}</b></p>
    <div><Countdown exp={data.expiry} pre="leaves in " /></div>
    {hit.length ? <p><b>Stock you need:</b> {hit.map((i, k) => <span key={i.item}>{k > 0 && ", "}{i.item}{i.ducats != null && <> ({i.ducats} ducats, {i.credits != null ? <Credits n={i.credits} /> : "? credits"})</>}</span>)}</p>
      : <p className="muted">Nothing in his stock matches what you still need (matched by item name).</p>}
    {inv.length > 0 ? <details open={full}><summary>What he is selling ({inv.length})</summary><ul className="sub">{inv.map((i, k) => { const n = needed.has(String(i.item).toLowerCase());
      return <li key={k} className={n ? "gold" : undefined}>{i.item ?? "Unknown item"}{n && " ★ you need this"}{(i.ducats != null || i.credits != null) && <span className="muted"> · {i.ducats != null ? `${i.ducats} ducats` : "? ducats"}{i.credits != null && <>, <Credits n={i.credits} /></>}</span>}</li>; })}</ul></details>
      : <p className="muted">The source lists no stock yet.</p>}</Panel>;
}
