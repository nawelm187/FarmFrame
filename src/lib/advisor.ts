import { tierA } from "./text";
import { t, tp } from "../i18n";
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
  const why: string[] = [top.p.left > 1 ? t("advMissingMore", { label: label(top.p), n: top.p.left, goal: goalName }) : t("advMissing", { label: label(top.p), goal: goalName })];
  if (top.group === "now" && relic) { why.push(t("advOwnNow", { relic: relic.name, tier: relic.tier, tierA: tierA(relic.tier), mission: f[0].missionType, node: f[0].node })); }
  else if (top.action.kind === "open") why.push(t("advOwnIdle", { relic: relic?.name ?? t("advARelic") }));
  else if (top.action.kind === "get" && relic) why.push(relic.stack > 1 ? t("advBestStack", { relic: relic.name, n: relic.stack }) : t("advBest", { relic: relic.name }));
  else why.push(top.action.text);
  if (also.length) why.push(t("advAlso", { list: also.join(", ") }));
  const second = ranked[1];
  return { ...base, status: "active", missing: ranked.map(r => ({ label: label(r.p), left: r.p.left, group: r.group })),
    focus: { part: label(top.p), partName: top.p.part.name, count: top.p.part.count, group: top.group, action: top.action, relic: relic?.name ?? null, tier: relic?.tier ?? null, fissure: f[0] ? `${f[0].missionType} ${f[0].node}` : null, alsoAdvances: also },
    why, after: second ? `${label(second.p)}: ${second.action.text}` : null };
}
import type { Opp } from "./farmNow";
import { READY_RANK, readiness, type Block, type Ready } from "./unlock";
export interface Activity { opp: Opp; goals: string[]; score: number; reasons: string[]; ready: Ready; blocks: Block[] }
/** Ranks the activities running now: the ones you can start right now come first, then by how much of YOUR plan they advance (goals, missing parts, relics you already own). Not a universal ranking. */
export function rankActivities(opps: Opp[]): Activity[] {
  return opps.map(opp => {
    const goals = (opp.goals ?? []).map(g => g.name), owned = (opp.relics ?? []).filter(r => r.owned > 0).map(r => r.relic);
    const reasons = [goals.length ? tp("advGoals", goals.length, { list: goals.join(", ") }) : t("advMatches"), tp("advItems", opp.advances.length)];
    if (owned.length) reasons.push(t("advOwned", { list: owned.slice(0, 3).join(", ") }));
    const blocks = opp.blocks ?? [];
    return { opp, goals, score: goals.length * 100 + opp.advances.length * 10 + (owned.length ? 5 : 0), reasons, ready: readiness(blocks), blocks };
  }).sort((a, b) => READY_RANK[a.ready] - READY_RANK[b.ready] || b.score - a.score || a.opp.title.localeCompare(b.opp.title));
}
