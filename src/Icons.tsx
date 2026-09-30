const P: Record<string, string> = {
  "/": "M3 11 12 4l9 7M5 10v10h14V10",
  "/roadmap": "M4 6h16M4 12h10M4 18h6",
  "/builds": "M4 8h16M4 16h16M8 4v16M16 4v16",
  "/warframes": "M12 3 20 7.5v9L12 21l-8-4.5v-9z",
  "/weapons": "M4 20 16 8m0 0 4-4m-4 4 2 2M6 14l4 4",
  "/mods": "M6 4h12v16H6zM9 8h6M9 12h6M9 16h3",
  "/relics": "M12 3 19 12 12 21 5 12z",
  "/fissures": "M12 3v6l-3 3 4 3-2 6",
  "/invasions": "M3 20 12 4l9 16zM12 10v4",
  "/finder": "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l4 4",
  "/tracking": "M4 12l5 5L20 6",
  "/sources": "M4 6c0-1.5 3.5-3 8-3s8 1.5 8 3-3.5 3-8 3-8-1.5-8-3zM4 6v12c0 1.5 3.5 3 8 3s8-1.5 8-3V6",
};
export const Icon = ({ n }: { n: string }) => (
  <svg className="ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true"><path d={P[n] ?? P["/"]} /></svg>
);
export const Logo = () => (
  <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path d="M16 2 28 9v14l-12 7L4 23V9z" fill="none" stroke="#B89A5B" strokeWidth="1.6" />
    <path d="M12 22V10h9M12 15.5h6" fill="none" stroke="#E4E2DC" strokeWidth="2.2" strokeLinecap="square" /></svg>
);
const TIER: Record<string, [string, number]> = { Lith: ["#A08868", 1], Meso: ["#9EA3A6", 2], Neo: ["#B89A5B", 3], Axi: ["#5FA8A3", 4], Requiem: ["#C0524A", 0], Omnia: ["#E4E2DC", 0] };
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
