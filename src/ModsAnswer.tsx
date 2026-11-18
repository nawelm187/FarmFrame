import { Link } from "react-router-dom";
import { Card } from "./SearchAnswers";
import { baseName, findFrame, modsForFrame, norm } from "./lib/modAdvice";
import { useCatalogs } from "./lib/useCatalog";
import type { Entity } from "./lib/catalog";
import { useT, type Key } from "./i18n";
/** "Mods for Rhino": the mods made for that Warframe and the general ones grouped by what they raise. Names come from the loaded data; it is a grouping, not a ranking. */
const LABEL: Record<string, Key> = { health: "saGHealth", shields: "saGShields", armor: "saGArmor", energy: "saGEnergy", efficiency: "saGEfficiency", strength: "saGStrength", duration: "saGDuration", range: "saGRange", speed: "saGSpeed" };
const ModLine = ({ m, go }: { m: Entity; go: () => void }) => { const fx = (m.levelStats?.length ? m.levelStats[m.levelStats.length - 1][0] ?? "" : "").slice(0, 60); return <li><Link to={`/mod/${m.slug}`} onClick={go}>{m.name}</Link>{fx && <span className="muted"> · {fx}</span>}</li>; };
export default function ModsAnswer({ subject, go }: { subject: string; go: () => void }) {
  const tr = useT(), c = useCatalogs(["warframe", "mod"]), frames = c.warframe?.items, mods = c.mod?.items;
  if (!frames || !mods) return <Card title={tr("saModsTitle", { name: subject })}><p className="muted">{tr("saModsLoading")}</p></Card>;
  const frame = findFrame(subject, frames);
  if (!frame) return <Card title={tr("saModsTitle", { name: subject })}><p>{tr("saModsNoFrame", { name: subject })}</p></Card>;
  const r = modsForFrame(frame.name, mods, new Set(frames.map(f => norm(baseName(f.name))))), name = baseName(frame.name);
  return (<Card title={tr("saModsTitle", { name: frame.name })}>
    {!r.exclusive.length && !r.groups.length && <p>{tr("saModsNone")}</p>}
    {r.exclusive.length > 0 && <><h4>{tr("saModsExclusive", { name })}</h4><ul>{r.exclusive.map(m => <ModLine key={m.slug} m={m} go={go} />)}</ul></>}
    {r.groups.length > 0 && <><h4>{tr("saModsGeneral")}</h4>{r.groups.map(g => <div key={g.key}><b>{tr(LABEL[g.key])}</b><ul>{g.mods.map(m => <ModLine key={m.slug} m={m} go={go} />)}</ul></div>)}</>}
    <p className="muted">{tr("saModsNote")}</p><Link to="/builds" onClick={go}>{tr("saModsOpen")}</Link></Card>);
}
