import type { Rec, Status } from "./data";
import { curLang, t, type Key } from "../i18n";
type O = Record<string, unknown>;
export interface Row { item: string; where: string; mode: string; rot: string; ch: number | null; rar: string; note: string; src: string }
type R = Omit<Row, "src">;
export interface Reward { itemName: string; rarity: string; chance: number }
export interface Relic { name: string; tier: string; st: Record<string, Reward[]> }
const isO = (x: unknown): x is O => !!x && typeof x === "object" && !Array.isArray(x);
const str = (x: unknown) => (typeof x === "string" ? x : "");
export const num = (v: unknown) => { const n = parseFloat(String(v)); return Number.isFinite(n) ? n : null; };
/** Overall chance = (chance the enemy drops loot) x (chance within its table). If either is unknown the result is unknown (null): the table chance alone is not the real chance. */
export const eff = (a: number | null, b: number | null) => (a != null && b != null ? Math.round(a * b) / 100 : null);
const unwrap = (d: unknown, k: string) => (isO(d) && k in d ? d[k] : d);
const row = (p: Partial<R>): R => ({ item: "", where: "", mode: "", rot: "", ch: null, rar: "", note: "", ...p });
const rot = (o: unknown, f: (k: string, x: O) => R) => { const r: R[] = []; if (isO(o)) for (const [k, v] of Object.entries(o)) if (Array.isArray(v)) for (const x of v) if (isO(x)) r.push(f(k, x)); return r; };
const fin = (r: R[]) => (r.length ? r.filter(x => x.item) : null);
const list = (d: unknown, k: string) => { const a = unwrap(d, k); return Array.isArray(a) ? a.filter(isO) : null; };

export interface Finder { id: string; file: string; label: string; ex: (d: unknown) => R[] | null }
const enemy = (id: string, label: Key): Finder => ({ id, file: id + ".json", get label() { return t(label); }, ex: d => {
  const a = list(d, id); if (!a) return null; const r: R[] = [];
  for (const e of a) { if (!e.enemyName || !Array.isArray(e.items)) continue; const dc = num(e.enemyItemDropChance);
    for (const x of e.items) if (isO(x) && x.itemName) r.push(row({ item: str(x.itemName), where: str(e.enemyName), mode: t("drModeEnemy"), ch: eff(dc, num(x.chance)), rar: str(x.rarity), note: t("drNoteEnemy", { dc: dc ?? "?", n: num(x.chance) ?? "?" }) })); }
  return fin(r); } });
const bounty = (id: string, label: Key): Finder => ({ id, file: id + ".json", get label() { return t(label); }, ex: d => {
  const a = list(d, id); if (!a) return null; const r: R[] = [];
  for (const b of a) r.push(...rot(b.rewards, (k, x) => row({ item: str(x.itemName || x.item), where: `${t(label)}: ${str(b.bountyLevel)}`, mode: t("drModeBounty"), rot: k, ch: num(x.chance), rar: str(x.rarity), note: str(x.stage) })));
  return fin(r); } });
export const FIND: Finder[] = [
  { id: "missions", file: "missionRewards.json", get label() { return t("drSrcMissions"); }, ex: d => {
    const mr = unwrap(d, "missionRewards"); if (!isO(mr)) return null; const r: R[] = [];
    for (const [pl, nodes] of Object.entries(mr)) { if (!isO(nodes)) continue;
      for (const [nd, i] of Object.entries(nodes)) { if (!isO(i) || !i.rewards) continue;
        const add = (k: string, x: O) => row({ item: str(x.itemName), where: `${nd} (${pl})${i.isEvent ? ` (${t("drEvent")})` : ""}`, mode: str(i.gameMode), rot: k, ch: num(x.chance), rar: str(x.rarity) });
        if (Array.isArray(i.rewards)) i.rewards.forEach(x => isO(x) && r.push(add("", x))); else r.push(...rot(i.rewards, add)); } }
    return fin(r); } },
  enemy("enemyBlueprintTables", "drSrcEnemyBp"), enemy("miscItems", "drSrcEnemyItems"),
  { id: "modLocations", file: "modLocations.json", get label() { return t("drSrcMods"); }, ex: d => {
    const a = list(d, "modLocations"); if (!a) return null; const r: R[] = [];
    for (const m of a) { if (!m.modName || !Array.isArray(m.enemies)) continue;
      for (const e of m.enemies) if (isO(e) && e.enemyName) { const dc = num(e.enemyModDropChance);
        r.push(row({ item: str(m.modName), where: str(e.enemyName), mode: t("drModeEnemy"), ch: eff(dc, num(e.chance)), rar: str(e.rarity), note: t("drNoteMod", { dc: dc ?? "?", n: num(e.chance) ?? "?" }) })); } }
    return fin(r); } },
  bounty("cetusBountyRewards", "drSrcCetus"), bounty("solarisBountyRewards", "drSrcFortuna"), bounty("zarimanRewards", "drSrcZariman"),
  { id: "sortieRewards", file: "sortieRewards.json", get label() { return t("drSrcSortie"); }, ex: d => { const a = list(d, "sortieRewards"); return a ? fin(a.map(x => row({ item: str(x.itemName), where: "Sortie", mode: "Sortie", ch: num(x.chance), rar: str(x.rarity) }))) : null; } },
  { id: "transientRewards", file: "transientRewards.json", get label() { return t("drSrcObjective"); }, ex: d => {
    const a = list(d, "transientRewards"); if (!a) return null; const r: R[] = [];
    for (const o of a) if (o.objectiveName && Array.isArray(o.rewards)) for (const x of o.rewards) if (isO(x)) r.push(row({ item: str(x.itemName), where: str(o.objectiveName), mode: t("drModeObjective"), ch: num(x.chance), rar: str(x.rarity) }));
    return fin(r); } },
  { id: "syndicates", file: "syndicates.json", get label() { return t("drSrcSyndicate"); }, ex: d => {
    const o = unwrap(d, "syndicates"); if (!isO(o)) return null; const r: R[] = [];
    for (const [n, a] of Object.entries(o)) if (Array.isArray(a)) for (const x of a) if (isO(x) && x.item) r.push(row({ item: str(x.item), where: `${n}: ${str(x.place)}`, mode: t("drModeSyndicate"), ch: num(x.chance), rar: str(x.rarity), note: x.standing != null ? t("drNoteStanding", { n: String(x.standing) }) : "" }));
    return fin(r); } },
  { id: "resourceByAvatar", file: "resourceByAvatar.json", get label() { return t("drSrcResources"); }, ex: d => {
    const a = list(d, "resourceByAvatar"); if (!a) return null; const r: R[] = [];
    for (const e of a) { const w = e.enemyName || e.source || e.avatar, l = e.items || e.resources || e.drops; if (!w || !Array.isArray(l)) continue; const dc = num(e.enemyItemDropChance ?? e.chance);
      for (const x of l) if (isO(x)) { const n = x.itemName || x.item || x.resource, c = num(x.chance); if (n && c != null) r.push(row({ item: str(n), where: str(w), mode: t("drModeEnemy"), ch: eff(dc, c), rar: str(x.rarity) })); } }
    return fin(r); } },
];
/** Rows hold translated text (modes, notes), so they are cached per language: switching language rebuilds them instead of showing the first language. */
const caches = new Map<string, WeakMap<object, R[] | null>>();
export function collect(items: { f: Finder; rec?: Rec; status: Status }[]) {
  const rows: Row[] = [], gaps: string[] = []; let ok = 0, cache = caches.get(curLang());
  if (!cache) caches.set(curLang(), cache = new WeakMap());
  for (const { f, rec, status } of items) {
    if (!rec || rec.data == null || typeof rec.data !== "object") { gaps.push(t("drGap", { label: f.label, reason: rec && rec.data != null ? t("drBadShape") : t(`st${status}`).toLowerCase() })); continue; }
    if (!cache.has(rec.data)) cache.set(rec.data, f.ex(rec.data));
    const r = cache.get(rec.data);
    if (!r) { gaps.push(t("drGap", { label: f.label, reason: t("drBadShape") })); continue; }
    ok++; r.forEach(x => rows.push({ ...x, src: f.label }));
  }
  return { rows, gaps, ok };
}
export function parseRelics(d: unknown): Relic[] | null {
  const a = unwrap(d, "relics"); if (!Array.isArray(a)) return null; const m = new Map<string, Relic>();
  for (const r of a) { if (!isO(r) || !r.tier || !r.relicName || !Array.isArray(r.rewards)) continue;
    const k = `${str(r.tier)} ${str(r.relicName)}`; if (!m.has(k)) m.set(k, { name: k, tier: str(r.tier), st: {} });
    // A reward with no chance is dropped, not turned into 0%: a missing number must never look like a real one, and relicIssues() then flags the incomplete table.
    m.get(k)!.st[str(r.state)] = r.rewards.filter(isO).flatMap(x => { const chance = num(x.chance); return chance == null ? [] : [{ itemName: str(x.itemName), rarity: str(x.rarity), chance }]; }); }
  return m.size ? [...m.values()] : null;
}
export const query = (rows: Row[], q: string) => { const l = q.trim().toLowerCase();
  return rows.filter(r => r.item.toLowerCase().includes(l)).sort((a, b) => Number(b.item.toLowerCase() === l) - Number(a.item.toLowerCase() === l) || (b.ch ?? -1) - (a.ch ?? -1)).slice(0, 40); };
/** Items whose name contains the query, each with the relics that drop it (Common first). Capped at 12 items. */
export function relicsByItem(relics: Relic[], l: string) {
  const m = new Map<string, { relic: Relic; rarity: string; chance: number }[]>();
  for (const r of relics) for (const x of r.st.Intact ?? []) if (x.itemName.toLowerCase().includes(l)) { const a = m.get(x.itemName) ?? []; a.push({ relic: r, rarity: x.rarity, chance: x.chance }); m.set(x.itemName, a); }
  const RO: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2 };
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(0, 12).map(([item, list]) => [item, [...list].sort((a, b) => (RO[a.rarity] ?? 3) - (RO[b.rarity] ?? 3) || a.relic.name.localeCompare(b.relic.name))] as const);
}
const RSTATES = ["Intact", "Exceptional", "Flawless", "Radiant"] as const;
/** Integrity check for relic tables: every refinement of a relic must list 6 rewards whose chances add up to 100 (±1 for rounding). An empty list means the table is consistent. Use it to refuse or flag a damaged download instead of showing wrong odds. */
export function relicIssues(relics: Relic[], max = 10): string[] {
  const out: string[] = [];
  for (const r of relics) for (const s of RSTATES) {
    const rw = r.st[s]; if (!rw?.length) continue;
    const sum = rw.reduce((a, x) => a + (Number.isFinite(x.chance) && x.chance >= 0 ? x.chance : NaN), 0);
    if (!Number.isFinite(sum)) out.push(`${r.name} ${s}: a chance is missing or negative`);
    else if (Math.abs(sum - 100) > 1) out.push(`${r.name} ${s}: chances add up to ${+sum.toFixed(2)}, not 100`);
    else if (rw.length !== 6) out.push(`${r.name} ${s}: ${rw.length} rewards instead of 6`);
    if (out.length >= max) return out;
  }
  return out;
}
