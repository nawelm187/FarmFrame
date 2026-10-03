type O = Record<string, unknown>;
const isO = (v: unknown): v is O => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v ? v : null);
/** A readable label from an unknown event or reward object, looking one level deep. Returns null instead of guessing. */
export function label(v: unknown, depth = 0): string | null {
  if (typeof v === "string") return v || null;
  if (!isO(v) || depth > 1) return null;
  for (const k of ["title", "name", "description", "item", "upgrade", "reward", "challenge", "type"]) { const r = label(v[k], depth + 1); if (r) return r; }
  return null;
}
export interface Offer { name: string; cost: number | null }
const offers = (v: unknown): Offer[] => (Array.isArray(v) ? v.filter(isO).map(o => ({ name: str(o.name) ?? str(o.item) ?? "", cost: typeof o.cost === "number" ? o.cost : null })).filter(o => o.name) : []);
export function steelView(d: unknown) {
  if (!isO(d)) return null;
  return { current: isO(d.currentReward) ? offers([d.currentReward])[0] ?? null : null, rotation: offers(d.rotation), evergreens: offers(d.evergreens) };
}
export function duviriView(d: unknown) {
  if (!isO(d)) return null;
  const choices = Array.isArray(d.choices) ? d.choices.filter(isO).map(c => ({ category: str(c.category) ?? str(c.categoryKey) ?? "Choices", items: (Array.isArray(c.choices) ? c.choices : []).map(x => label(x)).filter((x): x is string => !!x) })).filter(c => c.items.length) : [];
  return { state: str(d.state), expiry: str(d.expiry), choices };
}
export function calendarView(d: unknown) {
  const o = Array.isArray(d) ? d[0] : d; if (!isO(o)) return null;
  const days = Array.isArray(o.days) ? o.days.filter(isO).map((x, i) => ({ day: str(x.day) ?? str(x.date) ?? String(i + 1), events: (Array.isArray(x.events) ? x.events : []).map(e => label(e)).filter((s): s is string => !!s) })).filter(x => x.events.length) : [];
  return { season: str(o.season), loop: typeof o.yearIteration === "number" ? o.yearIteration : null, expiry: str(o.expiry), days };
}
export function archView(d: unknown) {
  const a = Array.isArray(d) ? d : isO(d) ? [d] : [];
  return a.filter(isO).map(x => ({ type: str(x.typeKey) ?? str(x.type) ?? "Archimedea", expiry: str(x.expiry),
    missions: (Array.isArray(x.missions) ? x.missions : []).map(m => (isO(m) ? [str(m.missionType) ?? str(m.mission) ?? str(m.type), str(m.faction)].filter(Boolean).join(" · ") : null)).filter((s): s is string => !!s) }));
}
export function stockView(d: unknown) {
  if (!isO(d)) return null;
  return { active: d.active === true, location: str(d.location), activation: str(d.activation), expiry: str(d.expiry), items: (Array.isArray(d.inventory) ? d.inventory : []).map(i => label(i)).filter((s): s is string => !!s) };
}
/** Vendors and the Duviri Circuit reset every Monday at 00:00 UTC. */
export function nextWeeklyReset(now = Date.now()) {
  const d = new Date(now), add = ((1 - d.getUTCDay() + 7) % 7) || 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + add);
}
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
export function dealsView(d: unknown) {
  const a = Array.isArray(d) ? d : isO(d) ? [d] : [];
  return a.filter(isO).map(x => { const t = num(x.total), s = num(x.sold); return { item: str(x.item) ?? "", price: num(x.salePrice), original: num(x.originalPrice), left: t != null && s != null ? Math.max(0, t - s) : null, expiry: str(x.expiry) }; }).filter(x => x.item);
}
export function arbView(d: unknown) { if (!isO(d)) return null; const node = str(d.node); return node ? { node, type: str(d.type), enemy: str(d.enemy), expiry: str(d.expiry) } : null; }
export function kuvaView(d: unknown) { return (Array.isArray(d) ? d : []).filter(isO).map(x => ({ node: str(x.node) ?? "", type: str(x.type), enemy: str(x.enemy), expiry: str(x.expiry) })).filter(x => x.node); }
export function simarisView(d: unknown) { if (!isO(d)) return null; const t = str(d.target); return t ? { target: t, active: d.isTargetActive === true } : null; }
export function anomalyView(d: unknown) {
  const o = Array.isArray(d) ? d[0] : d; if (!isO(o)) return null; const m = isO(o.mission) ? o.mission : null;
  return { active: o.active === true, expiry: str(o.expiry), node: m ? str(m.node) : null, faction: m ? str(m.faction) : null, type: m ? str(m.type) : null };
}
