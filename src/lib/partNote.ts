/** Text for the right-hand column of a component row. Relics are shown on the left, so "no data" must only appear when nothing at all is known. */
export function partNote(drops: { location: string; type?: string }[], relicCount: number | null): string {
  if (drops.length) return drops.slice(0, 6).map(d => `${d.location}${d.type ? " (" + d.type + ")" : ""}`).join("; ");
  if (relicCount === null) return "Checking relics…";
  return relicCount > 0 ? "Drops from the relics listed here" : "No drop source found for this part";
}
