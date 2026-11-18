import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PolIcon } from "./Icons";
import { costAt, effectsAtMax } from "./lib/modCompare";
import { useT, type Key } from "./i18n";
import type { Entity } from "./lib/catalog";
import { RAR_KEY } from "./ModPicker";
/** Side by side table of up to 3 mods; it scrolls sideways inside its own box so the page never does. */
export default function ModCompare({ mods, cat, onRemove, onClear }: { mods: Entity[]; cat: string; onRemove: (slug: string) => void; onClear: () => void }) {
  const tr = useT(), rk = (e: Entity) => RAR_KEY[e.rarity.toLowerCase() as keyof typeof RAR_KEY], dash = "\u2014";
  const rows: [Key, (e: Entity) => ReactNode][] = [
    ["mpPolarity", e => e.polarity ? <span className="cmppol"><PolIcon pol={e.polarity} size={20} /> {e.polarity}</span> : dash],
    ["mpRarity", e => rk(e) ? tr(rk(e)) : e.rarity || dash],
    ["cmpType", e => e.compat || e.type || dash],
    ["cmpMaxRank", e => e.maxRank ?? dash],
    ["cmpDrain0", e => costAt(e, 0) ?? dash],
    ["cmpDrainMax", e => costAt(e, e.maxRank ?? 0) ?? dash],
    ["cmpEffects", e => { const l = effectsAtMax(e); return l.length ? <ul>{l.map((t, i) => <li key={i}>{t}</li>)}</ul> : dash; }],
  ];
  return (<section className="cmpbox" aria-label={tr("cmpTitle")}><div className="cmphd"><h2>{tr("cmpTitle")}</h2><button className="btn" onClick={onClear}>{tr("cmpClear")}</button></div>
    <div className="cmpscroll"><table className="cmp"><thead><tr><td />{mods.map(e => <th key={e.slug} scope="col"><Link to={`/${cat}/${e.slug}`}>{e.name}</Link><button className="relicchip" aria-label={`${tr("cmpRemove")}: ${e.name}`} title={tr("cmpRemove")} onClick={() => onRemove(e.slug)}>{"\u00d7"}</button></th>)}</tr></thead>
      <tbody>{rows.map(([k, f]) => <tr key={k}><th scope="row">{tr(k)}</th>{mods.map(e => <td key={e.slug}>{f(e)}</td>)}</tr>)}</tbody></table></div></section>);
}
