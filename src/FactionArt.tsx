const files = import.meta.glob("./assets/factions/*.{png,webp,jpg,jpeg,svg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const art: Record<string, string> = {};
for (const [p, u] of Object.entries(files)) art[(p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "").toLowerCase()] = u;
const FAC: Record<string, string> = { Grineer: "#C0524A", Corpus: "#5F86A8", Infested: "#7A9A5B", Orokin: "#B89A5B", Sentient: "#A06FB0", Narmer: "#B89A5B", Murmur: "#6FA8A3" };
/** Faction emblem from src/assets/factions (grineer.png, corpus.png, infested.png...). Without the file, a small coloured diamond. */
export default function FactionArt({ f, size = 20 }: { f?: string; size?: number }) {
  const u = art[(f ?? "").toLowerCase()];
  return u ? <img className="itemart" src={u} alt="" width={size} height={size} style={{ marginRight: ".35rem" }} /> : <span className="fac" style={{ background: FAC[f ?? ""] ?? "var(--t3)" }} aria-hidden="true" />;
}
