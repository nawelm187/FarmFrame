import type { ReactNode } from "react";
import type { Cat, Entity } from "./lib/catalog";
import { Credits, Plat } from "./Money";
import { DamageIcon } from "./DamageIcon";
import GameText from "./GameText";
import { tradeLine } from "./lib/trade";
import { useT } from "./i18n";
type R = Record<string, unknown>;
type Row = [string, ReactNode];
const isR = (v: unknown): v is R => !!v && typeof v === "object" && !Array.isArray(v);
const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const s = (v: unknown) => (typeof v === "string" && v ? v : null);
const f = (v: number) => String(+v.toFixed(2));
const pct = (v: number) => `${f(v <= 1 ? v * 100 : v)}%`;
const time = (sec: number) => (sec >= 3600 ? `${f(sec / 3600)} h` : `${f(sec / 60)} min`);
const DMG = ["Impact", "Puncture", "Slash", "Cold", "Electricity", "Heat", "Toxin", "Blast", "Radiation", "Gas", "Magnetic", "Viral", "Corrosive", "Void", "Tau", "Cinematic", "Shield drain", "Health drain", "Energy drain", "True"];
const num = (rows: Row[], raw: R, key: string, label: string, fmt: (x: number) => ReactNode = f) => { const v = n(raw[key]); if (v != null && v !== 0) rows.push([label, fmt(v)]); };
const txt = (rows: Row[], raw: R, key: string, label: string) => { const v = s(raw[key]); if (v) rows.push([label, v]); };
/** Game text: damage types as icons, blank values marked as unavailable. */
const Txt = ({ t }: { t: string }) => <GameText t={t} />;
/** Everything the source knows about an item, grouped like a codex entry. Missing fields are simply left out. */
export default function Details({ e, cat }: { e: Entity; cat: Cat }) {
  const t = useT();
  const raw = e.raw, secs: { title: string; rows: Row[]; /** how many leading rows are damage types (they get an icon, whatever language the labels are in) */ dmg?: number }[] = [];
  const stats: Row[] = [];
  num(stats, raw, "health", t("dHealth")); num(stats, raw, "shield", t("dShield")); num(stats, raw, "armor", t("dArmor")); num(stats, raw, "power", t("dEnergy")); num(stats, raw, "sprintSpeed", t("dSprint"));
  if (cat === "weapon") {
    const dmg: Row[] = [], dps = Array.isArray(raw.damagePerShot) ? raw.damagePerShot : [];
    dps.forEach((v, i) => { const x = n(v); if (x && x > 0) dmg.push([DMG[i] ?? t("dTypeN", { n: i }), f(x)]); });
    const types = dmg.length; num(dmg, raw, "totalDamage", t("dTotalDamage"));
    if (dmg.length) secs.push({ title: t("dDamagePerShot"), rows: dmg, dmg: types });
    num(stats, raw, "criticalChance", t("dCrit"), pct); num(stats, raw, "criticalMultiplier", t("dCritMult"), x => `${f(x)}x`); num(stats, raw, "procChance", t("dStatus"), pct);
    num(stats, raw, "fireRate", t("dFireRate")); num(stats, raw, "multishot", t("dMultishot")); num(stats, raw, "magazineSize", t("dMag")); num(stats, raw, "reloadTime", t("dReload"), x => `${f(x)} s`);
    num(stats, raw, "ammo", t("dAmmo")); num(stats, raw, "accuracy", t("dAccuracy")); num(stats, raw, "range", t("dRange")); num(stats, raw, "followThrough", t("dFollow")); num(stats, raw, "blockResist", t("dBlock"));
    txt(stats, raw, "trigger", t("dTrigger")); txt(stats, raw, "noise", t("dNoise"));
  }
  if (stats.length) secs.unshift({ title: t("dStatsSource"), rows: stats });
  const info: Row[] = [], store: Row[] = [];
  num(info, raw, "masteryReq", t("mastery"), x => String(x)); txt(info, raw, "type", t("colType")); txt(info, raw, "category", t("dCategory"));
  const dis = n(raw.disposition); if (dis) info.push([t("dDisposition"), t("dOf5", { n: dis })]);
  if (e.slots?.length) info.push([t("dPolarities"), e.slots.filter(Boolean).join(", ") || t("dNone")]);
  const aura = Array.isArray(raw.aura) ? raw.aura.filter((x): x is string => typeof x === "string").join(", ") : s(raw.aura); if (aura) info.push([t("dAura"), aura]);
  const intro = isR(raw.introduced) ? [s(raw.introduced.name), s(raw.introduced.date)].filter(Boolean).join(" · ") : null; if (intro) info.push([t("dIntroduced"), intro]);
  txt(info, raw, "releaseDate", t("dRelease")); txt(info, raw, "vaultDate", t("dVault"));
  num(info, raw, "buildPrice", t("dFoundry"), x => <Credits n={x} />); num(info, raw, "buildTime", t("dBuildTime"), time); num(store, raw, "skipBuildTimePrice", t("dRush"), x => <Plat n={x} />); num(store, raw, "marketCost", t("dStorePrice"), x => <Plat n={x} />);
  const tl = tradeLine(e); if (tl && tl.tone !== "no") info.push([t("dTrading"), <span className={"tr-" + tl.tone}>{tl.label}</span>]);
  if (info.length) secs.push({ title: t("dInfo"), rows: info });
  const abilities = Array.isArray(raw.abilities) ? raw.abilities.filter(isR).map(a => ({ name: s(a.name), description: s(a.description) })).filter(a => a.name) : [], passive = s(raw.passiveDescription);
  if (!secs.length && !abilities.length && !passive) return null;
  const missingVals = [...abilities.map(a => a.description), passive].some(t => t && /\|[A-Za-z_0-9]+\|/.test(t));
  return (<>
    {abilities.length > 0 && <><h2>Abilities</h2><ul className="abil">{abilities.map(a => <li key={a.name}><b>{a.name}</b>{a.description && <span className="muted"><Txt t={a.description} /></span>}</li>)}</ul></>}
    {passive && <><h2>Passive</h2><p className="muted"><Txt t={passive} /></p></>}
    {missingVals && <p className="muted">{t("detMissing")}</p>}
    {store.length > 0 && <details className="storebox"><summary>{t("detStore")}</summary><dl className="dgrid">{store.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></details>}
    {secs.map(x => <section key={x.title}><h2>{x.title}</h2><dl className="dgrid">{x.rows.map(([k, v], i) => <div key={k}><dt>{x.dmg != null && i < x.dmg && <DamageIcon type={k} />}{k}</dt><dd>{v}</dd></div>)}</dl></section>)}
  </>);
}
