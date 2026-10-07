const files = import.meta.glob("./assets/factions/*.{png,webp,jpg,jpeg,svg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const art: Record<string, string> = {};
for (const [p, u] of Object.entries(files)) art[(p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "").toLowerCase()] = u;
const FAC: Record<string, string> = { Grineer: "#C0524A", Corpus: "#5F86A8", Infested: "#7A9A5B", Orokin: "#B89A5B", Sentient: "#A06FB0", Narmer: "#B89A5B", Murmur: "#6FA8A3" };
const ALIAS: Record<string, string> = { infestation: "infested", "the murmur": "murmur", sentients: "sentient" };
const G: Record<string, string> = {
  melee: "M5 19 19 5M15 5h4v4M5 19l2-2M4 16l4 4", rifle: "M3 14h12l2-2h4v3h-5l-2 2h-3l-1 3H8l1-3H3z", shotgun: "M2 11h14v3H2zM16 12h4l2 4h-4z", predator: "M6 4l6 16M11 4l6 16M16 4l5 14",
  prey: "M12 15a3 3 0 1 0 .01 0M6 11a1.6 1.6 0 1 0 .01 0M18 11a1.6 1.6 0 1 0 .01 0M9.5 7a1.6 1.6 0 1 0 .01 0M14.5 7a1.6 1.6 0 1 0 .01 0", neutral: "M12 4a8 8 0 1 0 .01 0M8 12h8",
  orbiter: "M3 13a9 4 0 0 0 18 0 9 4 0 0 0-18 0M8 12a4 4 0 0 1 8 0", stalker: "M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12zM12 9a3 3 0 1 0 .01 0", tenno: "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z",
  warframe: "M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z", crossfire: "M12 3a9 9 0 1 0 .01 0M6 6l12 12M18 6 6 18",
};
/** Faction emblem from src/assets/factions (grineer.png, corpus.png, infested.png...). Without the file, a small coloured diamond. */
export default function FactionArt({ f, size = 20 }: { f?: string; size?: number }) {
  const k = (f ?? "").toLowerCase().trim(), n = ALIAS[k] ?? k, u = art[n];
  if (!u && G[n]) return <svg className="itemart" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ marginRight: ".35rem", color: "var(--acc)" }}><path d={G[n]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return u ? <img className={"itemart" + (n === "infested" ? " tint-white" : "")} src={u} alt="" width={size} height={size} style={{ marginRight: ".35rem" }} /> : <span className="fac" style={{ background: FAC[f ?? ""] ?? "var(--t3)" }} aria-hidden="true" />;
}
