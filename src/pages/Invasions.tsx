import FactionArt from "../FactionArt";
import PageArt from "../PageArt";
import { Pic } from "../ItemArt";
import { useWorld } from "../lib/data";
import { usefulInvasion } from "../lib/farmNow";
import { useNeeded } from "../lib/useNeeded";
import { Badge, Prov, Unavailable } from "./parts";
import { useT } from "../i18n";
interface Side { faction?: string; reward?: { countedItems?: { count: number; type: string }[]; items?: string[] } }
interface Inv { id: string; node: string; desc: string; completed: boolean; completion: number; attacker?: Side; defender?: Side }
const isInv = (d: unknown): d is Inv[] => Array.isArray(d);
const Rw = ({ s }: { s?: Side }) => { const c = s?.reward?.countedItems ?? [], i = s?.reward?.items ?? [];
  if (!c.length && !i.length) return <>None</>;
  return <>{c.map((x, k) => <span key={"c" + k} className="advit"><Pic name={x.type} size={22} />{x.count}x {x.type}</span>)}{i.map((x, k) => <span key={"i" + k} className="advit"><Pic name={x} size={22} />{x}</span>)}</>; };
const Fac = ({ f }: { f?: string }) => { const t = useT(); return <span className="muted"><FactionArt f={f} size={22} />{f ?? t("unknown")}:</span>; };
export default function Invasions() {
  const t = useT();
  const { data, status, rec } = useWorld("invasions", isInv), needed = useNeeded();
  if (!data) return <><h1><PageArt name="Invasions" size={36} />{t("invasions")}</h1><Unavailable title={t("invasions")} art="Invasions" status={status} why={t("noVerified")} rec={rec} /></>;
  const a = data.filter(i => !i.completed);
  return (<><h1><PageArt name="Invasions" size={36} />{t("invasions")}</h1><p><Badge s={status} /></p>
    <div className="wrap"><table><thead><tr><th>{t("colNode")}</th><th>{t("colType")}</th><th>{t("colAttacker")}</th><th>{t("colDefender")}</th><th>{t("colProgress")}</th></tr></thead><tbody>
      {a.map(i => <tr key={i.id}><td>{i.node}{usefulInvasion(i, needed).length > 0 && <div className="tag FRESH">{t("helpsYou")} {usefulInvasion(i, needed).join(", ")}</div>}</td><td>{i.desc}</td><td><Fac f={i.attacker?.faction} /> <Rw s={i.attacker} /></td><td><Fac f={i.defender?.faction} /> <Rw s={i.defender} /></td><td>{Math.max(0, Math.min(100, +i.completion || 0)).toFixed(0)}%</td></tr>)}
      {!a.length && <tr><td colSpan={5} className="muted">{t("invNone")}</td></tr>}</tbody></table></div><Prov rec={rec} /></>);
}
