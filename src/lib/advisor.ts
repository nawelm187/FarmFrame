import { aTier } from "./text";
import { fissuresFor, groupOf, label, nextAction, type Fis, type Group, type Next, type PartPlan } from "./exact";
/** The whole answer to "I want X": what is missing, what to do now, why, how far along you are, and what comes after. Deterministic: every line comes from loaded data or the user's own progress. */
export interface Focus { part: string; partName: string; count: number; group: Group; action: Next; relic: string | null; tier: string | null; fissure: string | null; alsoAdvances: string[] }
export interface Advice {
  goal: string;
  /** done = nothing left; nodata = the data lists no parts; active = something is missing. */
  status: "done" | "nodata" | "active";
  have: number; total: number; pct: number;
  missing: { label: string; left: number; group: Group }[];
  focus: Focus | null;
  why: string[];
  /** What to do once the focus is done, or null when it was the last piece. */
  after: string | null;
}
const KIND = { open: 0, get: 1, source: 2, vaulted: 3, none: 4 } as const, GROUP = { now: 0, next: 1, blocked: 2 } as const;
export function advise(goalId: string, goalName: string, plans: PartPlan[], info: { have: number; total: number; parts: number } | undefined, fis: Fis[] | null, mine: Record<string, number>, relicsLoaded: boolean, now = Date.now()): Advice {
  const have = info?.have ?? 0, total = info?.total ?? 0, pct = total ? Math.round((100 * have) / total) : 0;
  const base = { goal: goalName, have, total, pct };
  const ranked = plans.filter(p => p.goal.id === goalId && p.part.count > p.have).map(p => {
    const action = nextAction(p, fis, mine, relicsLoaded, now), group = groupOf(action), live = p.relics.filter(r => r.vaulted !== true);
    return { p, action, group, relic: action.kind === "open" ? live.find(r => (mine[r.name] ?? 0) > 0) ?? null : action.kind === "get" ? live[0] ?? null : null };
  }).sort((a, b) => GROUP[a.group] - GROUP[b.group] || KIND[a.action.kind] - KIND[b.action.kind] || (b.relic?.stack ?? 0) - (a.relic?.stack ?? 0) || label(a.p).localeCompare(label(b.p)));
  if (!ranked.length) return { ...base, status: info && info.parts > 0 ? "done" : "nodata", missing: [], focus: null, why: [], after: null };
  const top = ranked[0], relic = top.relic, f = relic ? fissuresFor(fis, relic.tier, now) : [];
  const also = relic ? plans.filter(q => q !== top.p && q.part.count > q.have && q.relics.some(r => r.name === relic.name)).map(label) : [];
  const why: string[] = [`${label(top.p)} is missing${top.p.left > 1 ? ` (${top.p.left} more needed)` : ""} for ${goalName}.`];
  if (top.group === "now" && relic) { why.push(`You own ${relic.name} and ${aTier(relic.tier)} fissure is running now (${f[0].missionType} ${f[0].node}).`); }
  else if (top.action.kind === "open") why.push(`You own ${relic?.name ?? "a relic for it"}, but no fissure of its tier is active right now.`);
  else if (top.action.kind === "get" && relic) why.push(`${relic.name} is not vaulted and is the best relic for this part${relic.stack > 1 ? `: it carries ${relic.stack} of your missing parts` : ""}.`);
  else why.push(top.action.text);
  if (also.length) why.push(`The same relic also advances: ${also.join(", ")}.`);
  const second = ranked[1];
  return { ...base, status: "active", missing: ranked.map(r => ({ label: label(r.p), left: r.p.left, group: r.group })),
    focus: { part: label(top.p), partName: top.p.part.name, count: top.p.part.count, group: top.group, action: top.action, relic: relic?.name ?? null, tier: relic?.tier ?? null, fissure: f[0] ? `${f[0].missionType} ${f[0].node}` : null, alsoAdvances: also },
    why, after: second ? `${label(second.p)}: ${second.action.text}` : null };
}
import type { Opp } from "./farmNow";
export interface Activity { opp: Opp; goals: string[]; score: number; reasons: string[] }
/** Ranks the activities running now by how much of YOUR plan they advance: goals first, then missing parts, then relics you already own. Not a universal ranking. */
export function rankActivities(opps: Opp[]): Activity[] {
  return opps.map(opp => {
    const goals = (opp.goals ?? []).map(g => g.name), owned = (opp.relics ?? []).filter(r => r.owned > 0).map(r => r.relic);
    const reasons = [goals.length ? `Advances ${goals.length} goal${goals.length > 1 ? "s" : ""}: ${goals.join(", ")}` : "Its reward matches something you still need", `${opp.advances.length} missing item${opp.advances.length === 1 ? "" : "s"} can come from it`];
    if (owned.length) reasons.push(`You already own ${owned.slice(0, 3).join(", ")}, so you can start right away`);
    return { opp, goals, score: goals.length * 100 + opp.advances.length * 10 + (owned.length ? 5 : 0), reasons };
  }).sort((a, b) => b.score - a.score || a.opp.title.localeCompare(b.opp.title));
}
