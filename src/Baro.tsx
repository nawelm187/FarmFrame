import { useRefreshAt, useWorld } from "./lib/data";
import { ts } from "./lib/format";
import { baroMatches, isExp, type Trader } from "./lib/planner";
import { useNeeded } from "./lib/useNeeded";
import { Credits } from "./Money";
import { Countdown, Panel, Unavailable } from "./pages/parts";
const isTrader = (d: unknown): d is Trader => isExp(d);
/** Baro Ki'Teer (Void Trader): arrival countdown, location, stock, and which items advance what you still need. */
export default function Baro({ full = false }: { full?: boolean }) {
  const { data, status, rec } = useWorld("voidTrader", isTrader), needed = useNeeded();
  const now = Date.now(), act = data?.activation ? ts(data.activation) : NaN, end = data ? ts(data.expiry) : NaN;
  const stale = !!data && (data.active ? end < now : Number.isFinite(act) && act < now);
  useRefreshAt("voidTrader", !data ? null : stale ? now : data.active ? end : Number.isFinite(act) ? act : null);
  const T = "Baro Ki'Teer";
  if (!data) return <Unavailable title={T} status={status} why="No verified data." rec={rec} />;
  if (stale) return <Unavailable title={T} status="LOADING" why="" note="Updating Baro's schedule…" rec={rec} />;
  if (!data.active) return <Panel title={T} status={status} rec={rec}><b>Not here yet</b>{data.location && <span className="muted"> · arrives at {data.location}</span>}{data.activation && <div><Countdown exp={data.activation} pre="arrives in " /></div>}
    {data.activation && <div className="muted">{new Date(data.activation).toLocaleString()}</div>}</Panel>;
  const hit = baroMatches(data, needed), inv = data.inventory ?? [];
  return <Panel title={T} status={status} rec={rec}><b>{data.location}</b><div><Countdown exp={data.expiry} pre="leaves in " /></div>
    {hit.length ? <p><b>Stock you need:</b> {hit.map((i, k) => <span key={i.item}>{k > 0 && ", "}{i.item}{i.ducats != null && <> ({i.ducats} ducats, {i.credits != null ? <Credits n={i.credits} /> : "? credits"})</>}</span>)}</p>
      : <p className="muted">Nothing in his stock matches what you still need (matched by item name).</p>}
    {inv.length > 0 && <details open={full}><summary>Full stock ({inv.length})</summary><ul className="sub">{inv.map((i, k) => <li key={k}>{i.item ?? "Unknown item"}{(i.ducats != null || i.credits != null) && <span className="muted"> · {i.ducats != null ? `${i.ducats} ducats` : "? ducats"}{i.credits != null && <>, <Credits n={i.credits} /></>}</span>}</li>)}</ul></details>}</Panel>;
}
