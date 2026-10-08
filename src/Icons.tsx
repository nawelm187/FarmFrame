const P: Record<string, string> = {
  "/": "M3 11 12 4l9 7M5 10v10h14V10",
  "/roadmap": "M4 6h16M4 12h10M4 18h6",
  "/profile": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6",
  "/planner": "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  "/builds": "M4 8h16M4 16h16M8 4v16M16 4v16",
  "/warframes": "M12 3 20 7.5v9L12 21l-8-4.5v-9z",
  "/weapons": "M4 20 16 8m0 0 4-4m-4 4 2 2M6 14l4 4",
  "/companions": "M8 20c0-3 2-5 4-5s4 2 4 5M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 12l3 1M21 12l-3 1",
  "/archwings": "M3 8l9 4 9-4-3 9-6-3-6 3z",
  "/railjack": "M4 17h16M6 17l2-7h8l2 7M10 10V6h4v4",
  "/lore": "M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10",
  "/explore": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z",
  "/farm": "M12 3v4M12 17v4M3 12h4M17 12h4M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "/plan": "M4 6h16M4 12h10M4 18h6",
  "/mods": "M6 4h12v16H6zM9 8h6M9 12h6M9 16h3",
  "/relics": "M12 3 19 12 12 21 5 12z",
  "/fissures": "M12 3v6l-3 3 4 3-2 6",
  "/invasions": "M3 20 12 4l9 16zM12 10v4",
  "/finder": "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l4 4",
  "/tracking": "M4 12l5 5L20 6",
  "/sources": "M4 6c0-1.5 3.5-3 8-3s8 1.5 8 3-3.5 3-8 3-8-1.5-8-3zM4 6v12c0 1.5 3.5 3 8 3s8-1.5 8-3V6",
};
P["/patches"] ??= P["/lore"];
P["/farm-plan"] ??= P["/planner"] ?? P["/finder"];
P["/alerts"] ??= P["/invasions"];
P["/syndicates"] ??= P["/planner"] ?? P["/finder"];
P["/mastery"] ??= P["/tracking"];
P["/kdrives"] ??= P["/planner"] ?? P["/finder"];
P["/guides"] ??= P["/lore"];
P["/helminth"] ??= P["/planner"] ?? P["/finder"];
P["/rotations"] ??= P["/planner"] ?? P["/finder"];
export const Icon = ({ n }: { n: string }) => (
  <svg className="ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true"><path d={P[n] ?? P["/"]} /></svg>
);
/** FarmFrame emblem: a cyan ring open at the top, a spike and two wing strokes around a white F. Original artwork. */
export const Logo = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <path d="M16 3.2A12.8 12.8 0 1 1 6 8.2" fill="none" stroke="#00D6D6" strokeWidth="1.7" strokeLinecap="round" /><path d="M26 8.2A12.8 12.8 0 0 0 20.5 4" fill="none" stroke="#00D6D6" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M16 1.5 18 5.2h-4z" fill="#00D6D6" /><path d="M5.5 11.5 9.5 9M26.5 11.5 22.5 9" stroke="#089B9B" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M11.2 23.5V9.2h10.3v3.1h-6.9v2.9h5.7v3h-5.7v5.3z" fill="#E6E6E6" /></svg>
);
const TIER: Record<string, [string, number]> = { Lith: ["#A08868", 1], Meso: ["#9EA3A6", 2], Neo: ["#B89A5B", 3], Axi: ["#00D6D6", 4], Requiem: ["#C0524A", 0], Omnia: ["#E4E2DC", 0] };
/** Relic tier emblem: one diamond, tier shown by tick marks (Lith 1 ... Axi 4), a cross for Requiem/Omnia. Original artwork. */
export const TierIcon = ({ tier, size = 22 }: { tier: string; size?: number }) => {
  const [c, n] = TIER[tier] ?? ["#8E9392", 0];
  const ys = n === 1 ? [12] : n === 2 ? [10, 14] : n === 3 ? [9, 12, 15] : n === 4 ? [8, 11, 14, 17] : [];
  return (
    <svg className="tier-ic" viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={`${tier} relic`}>
      <path d="M12 2 21 12 12 22 3 12z" fill={c} fillOpacity=".14" stroke={c} strokeWidth="1.5" />
      {ys.map(y => <path key={y} d={`M9 ${y}h6`} stroke={c} strokeWidth="1.6" />)}
      {!n && <path d="M12 7v10M8 11.5h8" stroke={c} strokeWidth="1.6" />}
    </svg>
  );
};
const pfiles = import.meta.glob("./assets/polarity/*.{png,webp,svg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const polArt: Record<string, string> = {};
const POLS = ["madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "umbra", "koneksi", "aura", "any"];
// The file name is matched by the polarity name it contains ("Madurai_icon.png" works). If one file contains two names, the longest/earliest exact one wins and the file is skipped as ambiguous.
for (const [p, u] of Object.entries(pfiles)) {
  const base = (p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "").toLowerCase(), hits = POLS.filter(k => base.includes(k));
  const key = POLS.includes(base) ? base : hits.length === 1 ? hits[0] : /omni|universal/.test(base) ? "any" : null;
  if (key) polArt[key] = u;
}
const POL_ALIAS: Record<string, string> = { omni: "any", universal: "any" };
export const polKey = (pol: string) => { const k = pol.toLowerCase().trim(); return POL_ALIAS[k] ?? k; };
/** Polarity icon. Uses the official image when it exists in src/assets/polarity (file name = polarity name, e.g. madurai.png).
 *  Without the file it shows a plain labeled marker instead of a made-up symbol. */
export const PolIcon = ({ pol, size = 16 }: { pol: string | null; size?: number }) => {
  if (!pol) return null; const k = polKey(pol), src = polArt[k], label = pol.charAt(0).toUpperCase() + pol.slice(1).toLowerCase() + " polarity";
  return src ? <img className="polic" src={src} alt={label} title={label} width={size} height={size} decoding="async" />
    : <span className="polic nopol" role="img" aria-label={label} title={label + " (icon file not added yet)"} style={{ width: size, height: size, fontSize: Math.max(7, size * 0.38) }}>{k.slice(0, 3)}</span>;
};
export const Star = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="miter" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>
);
