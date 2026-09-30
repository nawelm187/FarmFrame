import type { Rec, Status } from "./data";
type O = Record<string, unknown>;
export interface Row { item: string; where: string; mode: string; rot: string; ch: number | null; rar: string; note: string; src: string }
type R = Omit<Row, "src">;
export interface Reward { itemName: string; rarity: string; chance: number }
export interface Relic { name: string; tier: string; st: Record<string, Reward[]> }
const isO = (x: unknown): x is O => !!x && typeof x === "object" && !Array.isArray(x);
const str = (x: unknown) => (typeof x === "string" ? x : "");
export const num = (v: unknown) => { const n = parseFloat(String(v)); return Number.isFinite(n) ? n : null; };
export const eff = (a: number | null, b: number | null) => (a != null && b != null ? Math.round(a * b) / 100 : b);
const unwrap = (d: unknown, k: string) => (isO(d) && k in d ? d[k] : d);
const row = (p: Partial<R>): R => ({ item: "", where: "", mode: "", rot: "", ch: null, rar: "", note: "", ...p });
const rot = (o: unknown, f: (k: string, x: O) => R) => { const r: R[] = []; if (isO(o)) for (const [k, v] of Object.entries(o)) if (Array.isArray(v)) for (const x of v) if (isO(x)) r.push(f(k, x)); return r; };
const fin = (r: R[]) => (r.length ? r.filter(x => x.item) : null);
const list = (d: unknown, k: string) => { const a = unwrap(d, k); return Array.isArray(a) ? a.filter(isO) : null; };

export interface Finder { id: string; file: string; label: string; ex: (d: unknown) => R[] | null }
const enemy = (id: string, label: string): Finder => ({ id, file: id + ".json", label, ex: d => {
  const a = list(d, id); if (!a) return null; const r: R[] = [];
  for (const e of a) { if (!e.enemyName || !Array.isArray(e.items)) continue; const dc = num(e.enemyItemDropChance);
    for (const x of e.items) if (isO(x) && x.itemName) r.push(row({ item: str(x.itemName), where: str(e.enemyName), mode: "Enemy drop", ch: eff(dc, num(x.chance)), rar: str(x.rarity), note: `${dc ?? "?"}% chance the enemy drops loot × ${num(x.chance)}% within its table` })); }
  return fin(r); } });
const bounty = (id: string, label: string): Finder => ({ id, file: id + ".json", label, ex: d => {
  const a = list(d, id); if (!a) return null; const r: R[] = [];
  for (const b of a) r.push(...rot(b.rewards, (k, x) => row({ item: str(x.itemName || x.item), where: `${label}: ${str(b.bountyLevel)}`, mode: "Bounty", rot: k, ch: num(x.chance), rar: str(x.rarity), note: str(x.stage) })));
  return fin(r); } });
export const FIND: Finder[] = [
  { id: "missions", file: "missionRewards.json", label: "Mission rewards", ex: d => {
    const mr = unwrap(d, "missionRewards"); if (!isO(mr)) return null; const r: R[] = [];
    for (const [pl, nodes] of Object.entries(mr)) { if (!isO(nodes)) continue;
      for (const [nd, i] of Object.entries(nodes)) { if (!isO(i) || !i.rewards) continue;
        const add = (k: string, x: O) => row({ item: str(x.itemName), where: `${nd} (${pl})${i.isEvent ? " (event)" : ""}`, mode: str(i.gameMode), rot: k, ch: num(x.chance), rar: str(x.rarity) });
        if (Array.isArray(i.rewards)) i.rewards.forEach(x => isO(x) && r.push(add("", x))); else r.push(...rot(i.rewards, add)); } }
    return fin(r); } },
  enemy("enemyBlueprintTables", "Enemy blueprint drops"), enemy("miscItems", "Enemy item drops"),
  { id: "modLocations", file: "modLocations.json", label: "Mod drops", ex: d => {
    const a = list(d, "modLocations"); if (!a) return null; const r: R[] = [];
    for (const m of a) { if (!m.modName || !Array.isArray(m.enemies)) continue;
      for (const e of m.enemies) if (isO(e) && e.enemyName) { const dc = num(e.enemyModDropChance);
        r.push(row({ item: str(m.modName), where: str(e.enemyName), mode: "Enemy drop", ch: eff(dc, num(e.chance)), rar: str(e.rarity), note: `${dc ?? "?"}% mod drop × ${num(e.chance)}% within its table` })); } }
    return fin(r); } },
  bounty("cetusBountyRewards", "Cetus bounties"), bounty("solarisBountyRewards", "Fortuna bounties"), bounty("zarimanRewards", "Zariman bounties"),
  { id: "sortieRewards", file: "sortieRewards.json", label: "Sortie rewards", ex: d => { const a = list(d, "sortieRewards"); return a ? fin(a.map(x => row({ item: str(x.itemName), where: "Sortie", mode: "Sortie", ch: num(x.chance), rar: str(x.rarity) }))) : null; } },
  { id: "transientRewards", file: "transientRewards.json", label: "Objective rewards", ex: d => {
    const a = list(d, "transientRewards"); if (!a) return null; const r: R[] = [];
    for (const o of a) if (o.objectiveName && Array.isArray(o.rewards)) for (const x of o.rewards) if (isO(x)) r.push(row({ item: str(x.itemName), where: str(o.objectiveName), mode: "Objective", ch: num(x.chance), rar: str(x.rarity) }));
    return fin(r); } },
  { id: "syndicates", file: "syndicates.json", label: "Syndicate offerings", ex: d => {
    const o = unwrap(d, "syndicates"); if (!isO(o)) return null; const r: R[] = [];
    for (const [n, a] of Object.entries(o)) if (Array.isArray(a)) for (const x of a) if (isO(x) && x.item) r.push(row({ item: str(x.item), where: `${n}: ${str(x.place)}`, mode: "Syndicate", ch: num(x.chance), rar: str(x.rarity), note: x.standing != null ? String(x.standing) + " standing" : "" }));
    return fin(r); } },
  { id: "resourceByAvatar", file: "resourceByAvatar.json", label: "Resource drops (enemies)", ex: d => {
    const a = list(d, "resourceByAvatar"); if (!a) return null; const r: R[] = [];
    for (const e of a) { const w = e.enemyName || e.source || e.avatar, l = e.items || e.resources || e.drops; if (!w || !Array.isArray(l)) continue; const dc = num(e.enemyItemDropChance ?? e.chance);
      for (const x of l) if (isO(x)) { const n = x.itemName || x.item || x.resource, c = num(x.chance); if (n && c != null) r.push(row({ item: str(n), where: str(w), mode: "Enemy drop", ch: eff(dc, c), rar: str(x.rarity) })); } }
    return fin(r); } },
];
const cache = new WeakMap<object, R[] | null>();
export function collect(items: { f: Finder; rec?: Rec; status: Status }[]) {
  const rows: Row[] = [], gaps: string[] = []; let ok = 0;
  for (const { f, rec, status } of items) {
    if (!rec || rec.data == null || typeof rec.data !== "object") { gaps.push(`${f.label}: ${status.toLowerCase()}`); continue; }
    if (!cache.has(rec.data)) cache.set(rec.data, f.ex(rec.data));
    const r = cache.get(rec.data);
    if (!r) { gaps.push(`${f.label}: unrecognised data shape, ignored`); continue; }
    ok++; r.forEach(x => rows.push({ ...x, src: f.label }));
  }
  return { rows, gaps, ok };
}
export function parseRelics(d: unknown): Relic[] | null {
  const a = unwrap(d, "relics"); if (!Array.isArray(a)) return null; const m = new Map<string, Relic>();
  for (const r of a) { if (!isO(r) || !r.tier || !r.relicName || !Array.isArray(r.rewards)) continue;
    const k = `${str(r.tier)} ${str(r.relicName)}`; if (!m.has(k)) m.set(k, { name: k, tier: str(r.tier), st: {} });
    m.get(k)!.st[str(r.state)] = r.rewards.filter(isO).map(x => ({ itemName: str(x.itemName), rarity: str(x.rarity), chance: num(x.chance) ?? 0 })); }
  return m.size ? [...m.values()] : null;
}
export const query = (rows: Row[], q: string) => { const l = q.trim().toLowerCase();
  return rows.filter(r => r.item.toLowerCase().includes(l)).sort((a, b) => Number(b.item.toLowerCase() === l) - Number(a.item.toLowerCase() === l) || (b.ch ?? -1) - (a.ch ?? -1)).slice(0, 40); };
