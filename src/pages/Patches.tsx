import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMany } from "../lib/data";
import { PATCH_ALT, PATCH_SRC, PATCH_URL, PATCH_WINDOW, matchPatch, parsePatches, patchTypes, type Patch } from "../lib/patchlogs";
import { Panel, Skeleton, Unavailable } from "./parts";
const SHOW = 25;
const Section = ({ title, text }: { title: string; text: string }) => (text ? <><h4>{title}</h4><div className="patchtext">{text}</div></> : null);
function Entry({ p, open }: { p: Patch; open?: boolean }) {
  return (<details className="panel" open={open}>
    <summary><b>{p.name}</b> <span className="tag">{p.type}</span> <span className="muted">{new Date(p.date).toLocaleDateString()}</span></summary>
    <Section title="Additions" text={p.additions} /><Section title="Changes" text={p.changes} /><Section title="Fixes" text={p.fixes} />
    {!p.additions && !p.changes && !p.fixes && <p className="muted">The source has no text for this entry. Open the original post.</p>}
    {p.url ? <p><a href={p.url} target="_blank" rel="noopener noreferrer">Open the official post</a></p> : <p className="muted">No link in the source.</p>}
  </details>);
}
export default function Patches() {
  const [r] = useMany([{ id: "patchlogs", file: "", url: PATCH_URL, alt: PATCH_ALT, src: PATCH_SRC, win: PATCH_WINDOW }]);
  const [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", type = sp.get("type") ?? "", [more, setMore] = useState(1);
  const data = useMemo(() => parsePatches(r.rec?.data), [r.rec?.data]);
  const list = useMemo(() => (data?.patches ?? []).filter(p => (!type || p.type === type) && matchPatch(p, q)), [data, q, type]);
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); setMore(1); };
  return (<><h1>Patch notes</h1>
    <p className="lead">What changed in each update and hotfix, with a link to the official post. Search a word to find when something changed.</p>
    {!data ? (r.status === "LOADING" ? <Skeleton /> : <Unavailable title="Patch notes" status={r.status === "FRESH" ? "ERROR" : r.status} why={r.rec?.data != null ? "The patch notes arrived in a format FarmFrame does not recognize (source schema changed)." : "Patch notes could not be loaded."} rec={r.rec} />) : (<>
      <div className="bar"><input aria-label="Search patch notes" placeholder="Search patch notes, e.g. Nidus, Steel Path, relics" value={q} onChange={e => set("q", e.target.value)} />
        <select aria-label="Type" value={type} onChange={e => set("type", e.target.value)}><option value="">All types</option>{patchTypes(data.patches).map(t => <option key={t}>{t}</option>)}</select></div>
      <p className="muted">{list.length} of {data.patches.length} entries{data.skipped ? ` · ${data.skipped} source entries skipped (missing title or date)` : ""}. Source: {PATCH_SRC}.</p>
      {list.length === 0 ? <p className="muted">No patch notes match. Try a different word.</p> : list.slice(0, SHOW * more).map((p, i) => <Entry key={p.date + p.name} p={p} open={i === 0 && !q && !type} />)}
      {list.length > SHOW * more && <button className="btn" onClick={() => setMore(more + 1)}>Show more</button>}
      <Panel title="Data source" status={r.status} rec={r.rec}><span className="muted">Updated every 6 hours. A gap is shown instead of a guess.</span></Panel></>)}
  </>);
}
