import type { Component } from "./catalog";
import { missing, progress } from "./goals";
/** Message shown right after a part of a goal becomes complete. Everything in it is derived from the user's own progress. */
export interface CompletionNote { text: string; goalDone: boolean; have: number; total: number; next: string | null; prev: number; part: string; goalId: string }
/** Returns a note only when `part` went from missing to complete with this change; any other change (more, less, already done) returns null. */
export function completionNote(goalId: string, goalName: string, comps: Component[], before: Record<string, number>, after: Record<string, number>, part: string): CompletionNote | null {
  const c = comps.find(x => x.name === part);
  if (!c || (before[part] ?? 0) >= c.count || (after[part] ?? 0) < c.count) return null;
  const p = progress(comps, after), left = missing(comps, after), next = left[0]?.name ?? null, goalDone = p.total > 0 && left.length === 0;
  const text = goalDone ? `${part} collected. ${goalName} is complete: ${p.have}/${p.total} parts.`
    : `${part} collected. ${goalName}: ${p.have}/${p.total} parts. Next: ${next}.`;
  return { text, goalDone, have: p.have, total: p.total, next, prev: before[part] ?? 0, part, goalId };
}
/** The first still-missing tracked item other than `except`, so the user is told what comes next after completing one. */
export const nextTracked = (list: { n: string; o: number; t: number }[], except: number): string | null => list.find((m, i) => i !== except && m.o < m.t)?.n ?? null;
