import { useCallback, useEffect, useState } from "react";
import { useCloud, type AdminStats } from "../lib/CloudProvider";
import { useT, type Key } from "../i18n";
/** Read-only counters for the owner. The server decides who may see them (public.admin_stats); this page only asks. */
const KINDS: [string, Key][] = [["created", "admNew"], ["deletion_requested", "admSched"], ["restored", "admRestored"], ["erased_now", "admErased"], ["purged", "admPurged"]];
export default function Admin() {
  const tr = useT(), c = useCloud(), [st, setSt] = useState<AdminStats | "denied" | "error" | null>(null);
  const load = useCallback(async () => { const r = await c.adminStats(); setSt(r.ok ? r.data : r.reason); }, [c]);
  useEffect(() => { if (!c.email) return; void load(); const t = setInterval(() => void load(), 30000); return () => clearInterval(t); }, [c.email, load]);
  if (!c.ready) return <p className="muted">…</p>;
  if (!c.email) return <><h1>{tr("admTitle")}</h1><p className="muted">{tr("admNeed")}</p></>;
  if (st === "denied") return <><h1>{tr("admTitle")}</h1><p className="ERROR" role="alert">{tr("admDenied")}</p></>;
  if (st === "error") return <><h1>{tr("admTitle")}</h1><p className="ERROR" role="alert">{tr("admError")}</p><button className="btn" onClick={() => void load()}>{tr("admRefresh")}</button></>;
  if (!st) return <><h1>{tr("admTitle")}</h1><p className="muted">…</p></>;
  const days = [...new Set([...st.events_by_day.map(e => e.day), ...st.peak_by_day.map(p => p.day)])].sort().reverse();
  const n = (day: string, kind: string) => st.events_by_day.find(e => e.day === day && e.kind === kind)?.n ?? 0, peak = (day: string) => st.peak_by_day.find(p => p.day === day)?.peak ?? 0;
  return (<><h1>{tr("admTitle")}</h1>
    <div className="facts">
      <div><b>{st.active_now}</b><span className="muted">{tr("admActive")}</span></div>
      <div><b>{st.accounts_total}</b><span className="muted">{tr("admAccounts")}</span></div>
      <div><b>{st.accounts_pending_deletion}</b><span className="muted">{tr("admPending")}</span></div>
      <div><b>{st.created_since_install}</b><span className="muted">{tr("admCreated")}</span></div></div>
    <h2>{tr("admHistory")}</h2>
    <div className="cmpscroll"><table className="cmp"><thead><tr><th scope="col">{tr("admDay")}</th><th scope="col">{tr("admPeak")}</th>{KINDS.map(([k, label]) => <th key={k} scope="col">{tr(label)}</th>)}</tr></thead>
      <tbody>{days.map(d => <tr key={d}><th scope="row">{d}</th><td>{peak(d)}</td>{KINDS.map(([k]) => <td key={k}>{n(d, k)}</td>)}</tr>)}</tbody></table></div>
    <p className="muted">{tr("admNote")}</p><button className="btn" onClick={() => void load()}>{tr("admRefresh")}</button></>);
}
