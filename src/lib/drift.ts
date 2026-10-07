/** Structural check of a downloaded dataset. A source that quietly renames or drops a field makes pages empty without any error, so each known dataset lists the fields the app reads. */
type O = Record<string, unknown>;
const isO = (v: unknown): v is O => !!v && typeof v === "object" && !Array.isArray(v);
const SHAPES: Record<string, string[]> = { fissures: ["tier", "node", "expiry", "missionType"], invasions: ["node", "completed"], alerts: ["expiry", "mission"] };
/** Fields the item catalogs (ids "f:<file>") must carry in nearly every entry. */
const CATALOG = ["name", "uniqueName"];
const SAMPLE = 30, MIN = 0.8;
/** Human-readable problems; an empty list means the data has the expected shape (or the dataset is not one we know). */
export function detectDrift(id: string, data: unknown): string[] {
  const keys = id.startsWith("f:") ? CATALOG : SHAPES[id];
  if (!keys || data == null) return [];
  if (!Array.isArray(data)) return [`expected a list, got ${isO(data) ? "an object" : typeof data}`];
  const rows = data.slice(0, SAMPLE); if (!rows.length) return [];
  const out: string[] = [];
  for (const k of keys) { const miss = rows.filter(r => !isO(r) || r[k] == null).length; if (miss / rows.length > 1 - MIN) out.push(`field "${k}" is missing in ${miss} of ${rows.length} sampled entries`); }
  if (id.startsWith("f:")) {
    const comps = rows.filter(isO).flatMap(r => (Array.isArray(r.components) ? r.components : [])), bad = comps.filter(c => !isO(c) || (c.name == null && c.uniqueName == null)).length;
    if (comps.length && bad / comps.length > 1 - MIN) out.push(`part entries have neither "name" nor "uniqueName" (${bad} of ${comps.length})`);
  }
  return out;
}
