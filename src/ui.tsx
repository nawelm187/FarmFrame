import type { ReactNode } from "react";
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
