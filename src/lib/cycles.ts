/** Open-world cycles repeat on fixed schedules. When the community API serves a cached cycle whose end time already passed,
 *  the current phase can be calculated from the last verified end time and the fixed phase lengths. It is labeled "calculated", never "live". */
const MIN = 60_000;
export const PHASES: Record<string, [string, number][]> = {
  cetusCycle: [["day", 100 * MIN], ["night", 50 * MIN]],
  vallisCycle: [["warm", (20 * MIN) / 3], ["cold", 20 * MIN]],
  cambionCycle: [["fass", 100 * MIN], ["vome", 50 * MIN]],
  zarimanCycle: [["corpus", 150 * MIN], ["grineer", 150 * MIN]],
};
/** Longest gap that is still projected; beyond it the data is treated as missing instead of guessed. */
export const MAX_GAP = 12 * 3_600_000;
export interface Projected { state: string; expiry: string; calculated: boolean }
/** Returns the cycle as served when still valid, the calculated current phase when expired, or null when it cannot be done safely. */
export function projectCycle(key: string, state: string, expiry: string, now = Date.now()): Projected | null {
  const end = Date.parse(expiry); if (!Number.isFinite(end)) return null;
  if (end > now) return { state, expiry, calculated: false };
  const ph = PHASES[key], i0 = ph?.findIndex(([n]) => n === state.toLowerCase());
  if (!ph || i0 === undefined || i0 < 0 || now - end > MAX_GAP) return null;
  let i = i0, t = end;
  for (let n = 0; n < 500 && t <= now; n++) { i = (i + 1) % ph.length; t += ph[i][1]; }
  if (t <= now) return null;
  const name = ph[i][0];
  return { state: state === state.toLowerCase() ? name : name[0].toUpperCase() + name.slice(1), expiry: new Date(Math.round(t)).toISOString(), calculated: true };
}
