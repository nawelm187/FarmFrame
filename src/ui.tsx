import { useEffect, useState, type ReactNode } from "react";
/** Circular progress. `pct` is 0-100; the number inside is the same value, so it reads without colour. */
export function Ring({ pct, size = 72, children }: { pct: number; size?: number; children?: ReactNode }) {
  const p = Math.max(0, Math.min(100, Math.round(pct))), r = 15.9155, done = p >= 100;
  return (<span className={"ring" + (done ? " done" : "")} style={{ width: size, height: size }} role="img" aria-label={`${p}% complete`}>
    <svg viewBox="0 0 36 36" aria-hidden="true"><circle className="rt" cx="18" cy="18" r={r} /><circle className="rf" cx="18" cy="18" r={r} strokeDasharray={`${p} ${100 - p}`} /></svg>
    <span className="rc">{children ?? <b>{p}%</b>}</span></span>);
}
/** − [n] + counter for how many of something you own. */
export function Stepper({ value, max, label, onChange }: { value: number; max?: number; label: string; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.max(0, max != null ? Math.min(max, v) : v));
  return (<span className="stepper" role="group" aria-label={label}><button className="btn" aria-label={`One less ${label}`} disabled={value <= 0} onClick={() => set(value - 1)}>−</button>
    <input type="number" inputMode="numeric" min={0} max={max} value={value} aria-label={`${label} owned`} onChange={e => set(+e.target.value || 0)} />
    <button className="btn" aria-label={`One more ${label}`} disabled={max != null && value >= max} onClick={() => set(value + 1)}>+</button></span>);
}
/** Big number with a caption, for the header of a page. */
export const StatTile = ({ n, label, tone }: { n: ReactNode; label: string; tone?: "gold" | "acc" }) => <div className={"stat" + (tone ? " " + tone : "")}><b>{n}</b><span>{label}</span></div>;
/** Thick bar with a label on the left and a count on the right. */
export function Meter({ label, have, total }: { label: string; have: number; total: number }) {
  const p = total ? Math.round(100 * have / total) : 0;
  return (<div className="meter"><div className="row"><span>{label}</span><b>{have} / {total}</b></div><div className={"mbar" + (p >= 100 ? " done" : "")} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={have} aria-label={label}><i style={{ width: p + "%" }} /></div></div>);
}
/** Sticky buttons that scroll to a section of the same page. They are buttons, not #links, because the app uses HashRouter and a #hash would change the route. */
export function SectionTabs({ items }: { items: readonly (readonly [string, string])[] }) {
  const [act, setAct] = useState(items[0]?.[0] ?? "");
  useEffect(() => {
    const els = items.map(([id]) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(es => { const v = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setAct(v.target.id); }, { rootMargin: "-15% 0px -70% 0px" });
    els.forEach(e => io.observe(e)); return () => io.disconnect();
  }, [items]);
  const go = (id: string) => { setAct(id); const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches; document.getElementById(id)?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" }); };
  return <div className="stabs" role="group" aria-label="Sections of this page">{items.map(([id, t]) => <button key={id} type="button" className={"btn" + (act === id ? " on" : "")} aria-current={act === id ? "true" : undefined} onClick={() => go(id)}>{t}</button>)}</div>;
}
/** Banner at the top of a page: a picture, the title and a short lead. */
export const PageHead = ({ title, art, children, aside }: { title: string; art?: ReactNode; children?: ReactNode; aside?: ReactNode }) =>
  <header className="pghead">{art && <span className="pgart">{art}</span>}<div className="pgtxt"><h1>{title}</h1>{children && <p className="lead">{children}</p>}</div>{aside}</header>;
