import { useState } from "react";
import type { Entity } from "./lib/catalog";
import type { Build } from "./lib/build";
import { DAMAGE_SOURCE, DTYPES, readMods, runTest, targetFrom, weaponFromEntity, type DType, type Weapon } from "./lib/damage";
import { ENEMY_ALT, ENEMY_SRC, ENEMY_URL, parseEnemies } from "./lib/enemies";
import { GROUPS, groupFromFaction, scaleEnemy, type GroupId } from "./lib/enemyScaling";
import { useMany } from "./lib/data";
import { useT } from "./i18n";
import { rich } from "./lib/rich";
const f = (v: string | undefined, d: number) => { if (v == null || v.trim() === "") return d; const n = Number(v.replace(",", ".")); return Number.isFinite(n) && n >= 0 ? n : d; };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fmt = (n: number) => Math.round(n).toLocaleString(), fmt1 = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });
const EMPTY: Weapon = { damage: {}, critChance: 0, critMult: 1, status: 0, fireRate: 0, multishot: 1, magazine: null, reload: null };
/** Damage test under the build: what the build does to an enemy of a chosen level (estimate from the wiki rules, see lib/damage.ts). */
export default function DamageTest({ b, weaponEnt, mods }: { b: Build; weaponEnt: Entity | undefined; mods: Map<string, Entity> }) {
  const t = useT(), [er] = useMany([{ id: "enemies", file: "", url: ENEMY_URL, alt: ENEMY_ALT, src: ENEMY_SRC, win: 6 * 3_600_000 }]);
  const [name, setName] = useState(""), [group, setGroup] = useState<GroupId>("grineer"), [baseLevel, setBaseLevel] = useState(1), [level, setLevel] = useState(60), [eximus, setEximus] = useState(false);
  const [own, setOwn] = useState({ h: 300, s: 0, a: 0 }), [ed, setEd] = useState<Record<string, string>>({});
  const kind = b.kind ?? "warframe";
  if (kind === "melee") return <section aria-label={t("dtTitle")}><header className="sechead"><h2>{t("dtTitle")}</h2></header><p className="muted">{t("dtMelee")}</p></section>;
  if (kind !== "primary" && kind !== "secondary") return null;
  if (!weaponEnt) return <section aria-label={t("dtTitle")}><header className="sechead"><h2>{t("dtTitle")}</h2></header><p className="muted">{t("dtNoWeapon")}</p></section>;
  const enemies = parseEnemies(er.rec?.data) ?? [], e = enemies.find(x => x.name === name);
  const read = weaponFromEntity(weaponEnt), manual = !read.weapon, base = read.weapon ?? EMPTY;
  const types: DType[] = manual ? ["impact", "puncture", "slash"] : DTYPES.filter(k => base.damage[k]);
  const shown = (k: string, d: number) => ed[k] ?? String(+d.toFixed(3));
  const w: Weapon = {
    damage: Object.fromEntries(types.map(k => [k, f(ed["d:" + k], base.damage[k] ?? 0)])) as Weapon["damage"],
    critChance: f(ed.cc, base.critChance * 100) / 100, critMult: f(ed.cm, base.critMult), status: f(ed.st, base.status * 100) / 100, fireRate: f(ed.fr, base.fireRate),
    multishot: f(ed.ms, base.multishot), magazine: ed.mag != null && ed.mag.trim() !== "" ? f(ed.mag, base.magazine ?? 0) : base.magazine, reload: ed.rl != null && ed.rl.trim() !== "" ? f(ed.rl, base.reload ?? 0) : base.reload,
  };
  const bv = e ? { h: e.health ?? 0, s: e.shield ?? 0, a: e.armor ?? 0 } : own;
  const sc = scaleEnemy({ group, baseHealth: bv.h, baseShield: bv.s, baseArmor: bv.a, baseLevel, level, eximus });
  const target = targetFrom({ health: sc.health, shield: sc.shield, armor: sc.armor }, e?.layers ?? []);
  const rm = readMods(b, mods), usable = w.fireRate > 0 && types.some(k => (w.damage[k] ?? 0) > 0), res = usable ? runTest(w, rm.bonus, target) : null;
  const pick = (n: string) => { setName(n); const g = enemies.find(x => x.name === n) ? groupFromFaction(enemies.find(x => x.name === n)!.faction) : null; if (g) setGroup(g); };
  const num = (k: string, label: string, v: string) => <label key={k}>{label} <input type="number" min={0} step="any" value={v} onChange={ev => setEd({ ...ed, [k]: ev.target.value })} /></label>;
  return (
    <section aria-label={t("dtTitle")}>
      <header className="sechead"><h2>{t("dtTitle")}</h2></header>
      <p className="muted">{t("dtLead")}</p>
      {manual && <p className="muted">{t("dtNoStats")}</p>}
      <details open={manual}><summary>{t("dtEditTitle")}</summary>
        <div className="bar">{types.map(k => num("d:" + k, t("dtDmgOf", { type: cap(k) }), shown("d:" + k, base.damage[k] ?? 0)))}</div>
        <div className="bar">{num("cc", t("dtCrit"), shown("cc", base.critChance * 100))}{num("cm", t("dtCritMult"), shown("cm", base.critMult))}{num("st", t("dtStatus"), shown("st", base.status * 100))}{num("fr", t("dtFireRate"), shown("fr", base.fireRate))}{num("ms", t("dtMulti"), shown("ms", base.multishot))}{num("mag", t("dtMag"), ed.mag ?? String(base.magazine ?? ""))}{num("rl", t("dtReload"), ed.rl ?? String(base.reload ?? ""))}</div>
      </details>
      <div className="bar">
        <label>{t("scEnemy")} <select value={name} onChange={ev => pick(ev.target.value)}><option value="">{t("scCustom")}</option>{enemies.map(x => <option key={x.name} value={x.name}>{x.name}</option>)}</select></label>
        <label>{t("scGroup")} <select value={group} onChange={ev => setGroup(ev.target.value as GroupId)}>{GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select></label>
        <label>{t("scBaseLevel")} <input type="number" min={1} max={9999} value={baseLevel} onChange={ev => setBaseLevel(Math.min(9999, Math.max(1, Math.floor(Number(ev.target.value)) || 1)))} /></label>
        <label>{t("scLevel")} <input type="number" min={1} max={9999} value={level} onChange={ev => setLevel(Math.min(9999, Math.max(1, Math.floor(Number(ev.target.value)) || 1)))} /></label>
        <label><input type="checkbox" checked={eximus} onChange={ev => setEximus(ev.target.checked)} /> {t("scEximus")}</label>
      </div>
      {!e && <div className="bar">
        <label>{t("scBaseH")} <input type="number" min={0} value={own.h} onChange={ev => setOwn({ ...own, h: f(ev.target.value, 0) })} /></label>
        <label>{t("scBaseS")} <input type="number" min={0} value={own.s} onChange={ev => setOwn({ ...own, s: f(ev.target.value, 0) })} /></label>
        <label>{t("scBaseA")} <input type="number" min={0} value={own.a} onChange={ev => setOwn({ ...own, a: f(ev.target.value, 0) })} /></label>
      </div>}
      <p className="muted">{t("scHealth")} {fmt(sc.health)} · {t("scShields")} {sc.shield === null ? "—" : fmt(sc.shield)} · {t("scArmor")} {fmt(sc.armor)}{(!e || e.layers.length === 0) && ` · ${t("dtNoLayers")}`}{sc.shield === null && bv.s > 0 && ` · ${t("dtShieldNote")}`}</p>
      {res ? <>
        <dl className="stats">
          <div><dt>{t("dtPerShot")}</dt><dd>{fmt(res.perShotHealth)}</dd></div>
          <div><dt>{t("dtBurst")}</dt><dd>{fmt(res.burstDpsHealth)}</dd></div>
          <div><dt>{t("dtSustained")}</dt><dd>{fmt(res.sustainedDpsHealth)}</dd></div>
          <div><dt>{t("dtTtk")}</dt><dd>{res.ttk == null ? <small className="muted">{t("dtNoKill")}</small> : t("dtSeconds", { n: res.ttk.toFixed(2) })}</dd></div>
          <div><dt>{t("dtShots")}</dt><dd>{res.shotsToKill == null ? "—" : fmt1(res.shotsToKill)}</dd></div>
          <div><dt>{t("dtReloadsN")}</dt><dd>{res.reloads}</dd></div>
        </dl>
        <p className="muted">{t("dtWith", { cc: fmt1(res.totals.critChance * 100), cm: res.totals.critMult.toFixed(2), st: fmt1(res.totals.status * 100), fr: fmt1(res.totals.fireRate), ms: res.totals.multishot.toFixed(2) })}</p>
        <div className="wrap"><table><thead><tr><th>{t("fmType")}</th><th>{t("dtColPellet")}</th><th>{t("dtColHealth")}</th><th>{t("dtColShield")}</th></tr></thead>
          <tbody>{res.perType.map(x => <tr key={x.type}><td>{cap(x.type)}</td><td>{fmt1(x.pellet)}</td><td>{fmt1(x.vsHealth)}</td><td>{fmt1(x.vsShield)}</td></tr>)}</tbody></table></div>
      </> : null}
      {rm.ignored.length > 0 && <details><summary>{t("dtIgnoredTitle", { n: rm.ignored.length })}</summary><p className="muted">{t("dtIgnoredHint")}</p><ul>{rm.ignored.map((l, i) => <li key={i}>{l}</li>)}</ul></details>}
      <p className="muted">{t("dtLimits")} {rich(t("dtSource", {}), { link: <a href={DAMAGE_SOURCE.url} target="_blank" rel="noopener noreferrer">{DAMAGE_SOURCE.name}</a> })}</p>
    </section>
  );
}
