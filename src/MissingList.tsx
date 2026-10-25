import { Pic } from "./ItemArt";
import { useT } from "./i18n";
export interface Missing { label: string; left: number; group: "now" | "next" | "blocked" }
const TAG = { now: "mlNow", next: "mlNext", blocked: "mlBlocked" } as const;
/** "Chassis (Atlas Prime)" -> the picture name "Atlas Prime Chassis". A Blueprint keeps its owner's picture. */
export const pictureName = (label: string) => { const m = label.match(/^(.*) \((.*)\)$/); return m ? (/^blueprint$/i.test(m[1]) ? m[2] : `${m[2]} ${m[1]}`) : label; };
/** The parts still missing, one row each, with the part's picture and what to do about it. */
export default function MissingList({ items }: { items: Missing[] }) {
  const t = useT();
  return (<ul className="mlist">{items.map(m => (<li key={m.label} className={"mrow " + m.group}><Pic name={pictureName(m.label)} size={34} />
    <span className="mn">{m.label}{m.left > 1 ? ` ×${m.left}` : ""}</span><span className={"tag" + (m.group === "now" ? " FRESH" : m.group === "blocked" ? " STALE" : "")}>{t(TAG[m.group])}</span></li>))}</ul>);
}
