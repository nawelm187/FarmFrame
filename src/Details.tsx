import type { ReactNode } from "react";
import type { Cat, Entity } from "./lib/catalog";
import { Credits, Plat } from "./Money";
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
/** Everything the source knows about an item, grouped like a codex entry. Missing fields are simply left out. */
export default function Details({ e, cat }: { e: Entity; cat: Cat }) {
  const raw = e.raw, secs: { title: string; rows: Row[] }[] = [];
  const stats: Row[] = [];
  num(stats, raw, "health", "Health"); num(stats, raw, "shield", "Shield"); num(stats, raw, "armor", "Armor"); num(stats, raw, "power", "Energy"); num(stats, raw, "sprintSpeed", "Sprint speed");
  if (cat === "weapon") {
    const dmg: Row[] = [], dps = Array.isArray(raw.damagePerShot) ? raw.damagePerShot : [];
    dps.forEach((v, i) => { const x = n(v); if (x && x > 0) dmg.push([DMG[i] ?? `Type ${i}`, f(x)]); });
    num(dmg, raw, "totalDamage", "Total damage");
    if (dmg.length) secs.push({ title: "Damage per shot", rows: dmg });
    num(stats, raw, "criticalChance", "Critical chance", pct); num(stats, raw, "criticalMultiplier", "Critical multiplier", x => `${f(x)}x`); num(stats, raw, "procChance", "Status chance", pct);
    num(stats, raw, "fireRate", "Fire rate"); num(stats, raw, "multishot", "Multishot"); num(stats, raw, "magazineSize", "Magazine size"); num(stats, raw, "reloadTime", "Reload time", x => `${f(x)} s`);
    num(stats, raw, "ammo", "Max ammo"); num(stats, raw, "accuracy", "Accuracy"); num(stats, raw, "range", "Range"); num(stats, raw, "followThrough", "Follow through"); num(stats, raw, "blockResist", "Block resist");
    txt(stats, raw, "trigger", "Trigger"); txt(stats, raw, "noise", "Noise");
  }
  if (stats.length) secs.unshift({ title: "Stats from the source", rows: stats });
  const info: Row[] = [];
  num(info, raw, "masteryReq", "Mastery rank", x => String(x)); txt(info, raw, "type", "Type"); txt(info, raw, "category", "Category");
  const dis = n(raw.disposition); if (dis) info.push(["Riven disposition", `${dis} of 5`]);
  if (e.slots?.length) info.push(["Slot polarities", e.slots.filter(Boolean).join(", ") || "none"]);
  const aura = Array.isArray(raw.aura) ? raw.aura.filter((x): x is string => typeof x === "string").join(", ") : s(raw.aura); if (aura) info.push(["Aura polarity", aura]);
  const intro = isR(raw.introduced) ? [s(raw.introduced.name), s(raw.introduced.date)].filter(Boolean).join(" · ") : null; if (intro) info.push(["Introduced", intro]);
  txt(info, raw, "releaseDate", "Release date"); txt(info, raw, "vaultDate", "Vault date");
  num(info, raw, "buildPrice", "Foundry cost", x => <Credits n={x} />); num(info, raw, "buildTime", "Build time", time); num(info, raw, "skipBuildTimePrice", "Rush cost", x => <Plat n={x} />); num(info, raw, "marketCost", "Market price", x => <Plat n={x} />);
  if (typeof raw.tradable === "boolean") info.push(["Tradable", raw.tradable ? "Yes" : "No"]);
  if (info.length) secs.push({ title: "Information", rows: info });
  const abilities = Array.isArray(raw.abilities) ? raw.abilities.filter(isR).map(a => ({ name: s(a.name), description: s(a.description) })).filter(a => a.name) : [], passive = s(raw.passiveDescription);
  if (!secs.length && !abilities.length && !passive) return null;
  return (<>
    {abilities.length > 0 && <><h2>Abilities</h2><ul className="abil">{abilities.map(a => <li key={a.name}><b>{a.name}</b>{a.description && <span className="muted">{a.description}</span>}</li>)}</ul></>}
    {passive && <><h2>Passive</h2><p className="muted">{passive}</p></>}
    {secs.map(x => <section key={x.title}><h2>{x.title}</h2><dl className="dgrid">{x.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></section>)}
  </>);
}
