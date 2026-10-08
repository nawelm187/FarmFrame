/** Relic reward rarity as the game shows it: only a bronze / silver / gold marker, no words. Bronze = most likely drop, silver = middle, gold = hardest to get. The name stays available to screen readers. */
export default function RarityMark({ r }: { r: string }) {
  const k = r === "Common" || r === "Uncommon" || r === "Rare" ? r : "Common", n = { Common: "Bronze", Uncommon: "Silver", Rare: "Gold" }[k];
  return <span className={"rar " + k} role="img" aria-label={n}>◆</span>;
}
