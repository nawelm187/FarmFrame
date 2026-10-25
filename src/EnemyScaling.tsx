import { useMemo, useState } from "react";
import type { Enemy } from "./lib/enemies";
import { useT } from "./i18n";
import { rich } from "./lib/rich";
import { GROUPS, SCALING_SOURCE, groupFromFaction, scaleEnemy, type GroupId } from "./lib/enemyScaling";
const num = (v: string, min: number, max: number) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min; };
/** Level scaling calculator: health, shields, armor and effective health of an enemy at a level (estimate from the wiki formulas). */
export default function EnemyScaling({ enemies }: { enemies: Enemy[] }) {
  const t = useT(), [name, setName] = useState(""), [group, setGroup] = useState<GroupId>("grineer"), [baseLevel, setBaseLevel] = useState(1), [level, setLevel] = useState(50), [eximus, setEximus] = useState(false), [own, setOwn] = useState({ h: 300, s: 0, a: 0 });
  const e = enemies.find(x => x.name === name), base = e ? { h: e.health ?? 0, s: e.shield ?? 0, a: e.armor ?? 0 } : own;
  const pick = (n: string) => { setName(n); const g = enemies.find(x => x.name === n) ? groupFromFaction(enemies.find(x => x.name === n)!.faction) : null; if (g) setGroup(g); };
  const r = useMemo(() => scaleEnemy({ group, baseHealth: base.h, baseShield: base.s, baseArmor: base.a, baseLevel, level, eximus }), [group, base.h, base.s, base.a, baseLevel, level, eximus]);
  const fmt = (n: number) => Math.round(n).toLocaleString();
  return (
    <section aria-label={t("scTitle")}>
      <header className="sechead"><h2>{t("scTitle")}</h2></header>
      <p className="muted">{t("scLead")}</p>
      <div className="bar">
        <label>{t("scEnemy")} <select value={name} onChange={ev => pick(ev.target.value)}><option value="">{t("scCustom")}</option>{enemies.map(x => <option key={x.name} value={x.name}>{x.name}</option>)}</select></label>
        <label>{t("scGroup")} <select value={group} onChange={ev => setGroup(ev.target.value as GroupId)}>{GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select></label>
        <label>{t("scBaseLevel")} <input type="number" min={1} max={9999} value={baseLevel} onChange={ev => setBaseLevel(num(ev.target.value, 1, 9999))} /></label>
        <label>{t("scLevel")} <input type="number" min={1} max={9999} value={level} onChange={ev => setLevel(num(ev.target.value, 1, 9999))} /></label>
        <label><input type="checkbox" checked={eximus} onChange={ev => setEximus(ev.target.checked)} /> {t("scEximus")}</label>
      </div>
      {!e && <div className="bar">
        <label>{t("scBaseH")} <input type="number" min={0} value={own.h} onChange={ev => setOwn({ ...own, h: num(ev.target.value, 0, 1e9) })} /></label>
        <label>{t("scBaseS")} <input type="number" min={0} value={own.s} onChange={ev => setOwn({ ...own, s: num(ev.target.value, 0, 1e9) })} /></label>
        <label>{t("scBaseA")} <input type="number" min={0} value={own.a} onChange={ev => setOwn({ ...own, a: num(ev.target.value, 0, 1e9) })} /></label>
      </div>}
      <p className="muted">{t("scBaseHint")}</p>
      <dl className="stats">
        <div><dt>{t("scHealth")}</dt><dd>{fmt(r.health)}</dd></div>
        <div><dt>{t("scShields")}</dt><dd>{r.shield === null ? <small className="muted">{t("scNoShield")}</small> : fmt(r.shield)}</dd></div>
        <div><dt>{t("scArmor")}</dt><dd>{fmt(r.armor)}{r.armorNote && <small className="muted"> {r.armorNote === "cap" ? t("scArmorCap") : t("scArmorMin")}</small>}</dd></div>
        <div><dt>{t("scReduction")}</dt><dd>{(r.reduction * 100).toFixed(1)}%</dd></div>
        {r.overguard !== null && <div><dt>{t("scOverguard")}</dt><dd>{fmt(r.overguard)}</dd></div>}
        <div title={t("scEhpTip")}><dt>{t("scEhp")}</dt><dd>{r.ehp === null ? "—" : fmt(r.ehp)}</dd></div>
        <div><dt>{t("scAffinity")}</dt><dd>×{r.affinityMultiplier.toFixed(2)}</dd></div>
      </dl>
      <p className="muted">{t("scNotes")} {rich(t("scSource", { date: SCALING_SOURCE.date }), { link: <a href={SCALING_SOURCE.url} target="_blank" rel="noopener noreferrer">{SCALING_SOURCE.name}</a> })}</p>
    </section>
  );
}
