import { STARCHART } from "../data/masteryData";
import { itemKey } from "./mastery";
/** Why an activity may not be possible yet. "blocked" is a fact from your own data (you own none of the relics); "check" is something to confirm yourself
 *  because FarmFrame cannot see your game: it only knows what you ticked in the Mastery checklist and the relics you marked as owned. */
export type Severity = "blocked" | "check";
export interface Block { kind: "relic" | "node" | "steelpath" | "railjack"; severity: Severity; text: string }
export type Ready = "ready" | "check" | "needs";
export const readiness = (b: Block[] | undefined): Ready => (!b?.length ? "ready" : b.some(x => x.severity === "blocked") ? "needs" : "check");
export const READY_LABEL: Record<Ready, string> = { ready: "Ready now", check: "Check first", needs: "Needs setup" };
export const READY_RANK: Record<Ready, number> = { ready: 0, check: 1, needs: 2 };
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
/** "Hepit (Void)" -> { name: "Hepit", planet: "Void" }. */
export function parseNode(n: string): { name: string; planet: string } | null { const m = /^(.+?)\s*\(([^)]+)\)\s*$/.exec(n.trim()); return m ? { name: m[1], planet: m[2] } : null; }
const anyTicked = (m: Set<string>, sp: boolean) => STARCHART.some(g => g.items.some(([n]) => m.has(itemKey(sp ? "sp-" + g.id : g.id, n))));
/** What to confirm before running a mission at `node`, from the Mastery checklist (`mastery`: its ticked keys). Says nothing when the checklist cannot tell. */
export function nodeBlocks(node: string, hard: boolean, storm: boolean, mastery: Set<string>): Block[] {
  const p = parseNode(node), out: Block[] = [];
  if (storm || (p && /proxima$/i.test(p.planet))) { out.push({ kind: "railjack", severity: "check", text: "Void Storm fissures are Railjack missions: they need Railjack and the matching Proxima region." }); return out; }
  const g = p ? STARCHART.find(x => norm(x.label) === norm(p.planet)) : undefined, item = g && p ? g.items.find(([n]) => norm(n) === norm(p.name)) : undefined;
  if (hard) {
    if (!anyTicked(mastery, true)) out.push({ kind: "steelpath", severity: "check", text: "Steel Path fissure: it needs the Steel Path enabled. No Steel Path node is ticked in your Mastery checklist, so FarmFrame cannot tell if you have it." });
    else if (g && item && !mastery.has(itemKey("sp-" + g.id, item[0]))) out.push({ kind: "steelpath", severity: "check", text: `${item[0]} is not ticked as completed on the Steel Path in your Mastery checklist: it must be unlocked there first.` });
    return out;
  }
  if (g && item && anyTicked(mastery, false) && !mastery.has(itemKey(g.id, item[0]))) out.push({ kind: "node", severity: "check", text: `${item[0]} (${g.label}) is not ticked as completed in your Mastery checklist: make sure the node is unlocked in your Star Chart.` });
  return out;
}
