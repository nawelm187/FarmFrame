type O = Record<string, unknown>;
const isO = (v: unknown): v is O => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v ? v : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
export interface AlertView { id: string; title: string; node: string; type: string | null; faction: string | null; expiry: string; levels: [number, number] | null; credits: number | null; rewards: { name: string; count: number }[]; archwing: boolean; nightmare: boolean }
/** Active alerts only. An alert whose end time has passed is dropped here, so the list changes by itself while the page is open. */
export function alertsView(d: unknown, now = Date.now()): AlertView[] {
  if (!Array.isArray(d)) return [];
  return d.filter(isO).map((a, i): AlertView | null => {
    const m = isO(a.mission) ? a.mission : null, expiry = str(a.expiry); if (!m || !expiry || Date.parse(expiry) <= now) return null;
    const rw = isO(m.reward) ? m.reward : {}, counted = Array.isArray(rw.countedItems) ? rw.countedItems.filter(isO).map(c => ({ name: str(c.type) ?? str(c.key) ?? "", count: num(c.count) ?? 1 })).filter(c => c.name) : [];
    const plain = (Array.isArray(rw.items) ? rw.items : []).filter((x): x is string => typeof x === "string" && !!x && !counted.some(c => c.name === x)).map(name => ({ name, count: 1 }));
    const rewards = [...counted, ...plain], min = num(m.minEnemyLevel), max = num(m.maxEnemyLevel), node = str(m.node) ?? "Unknown node";
    return { id: str(a.id) ?? String(i), title: rewards[0]?.name ?? str(m.description) ?? "Alert", node, type: str(m.type), faction: str(m.faction), expiry, levels: min != null && max != null ? [min, max] : null,
      credits: num(rw.credits), rewards, archwing: m.archwingRequired === true, nightmare: m.nightmare === true };
  }).filter((a): a is AlertView => !!a).sort((a, b) => Date.parse(a.expiry) - Date.parse(b.expiry));
}
