const files = import.meta.glob("./assets/damage/*.{png,webp,svg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const art: Record<string, string> = {};
for (const [p, u] of Object.entries(files)) art[(p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "").toLowerCase()] = u;
const COLOR: Record<string, string> = { impact: "#8E9392", puncture: "#9EA3A6", slash: "#C0524A", cold: "#9CC7E6", electricity: "#C9A24E", heat: "#C77A4A", toxin: "#7A9A5B", blast: "#C58B4A", radiation: "#C9C24E", gas: "#6FA98B", magnetic: "#5F86A8", viral: "#A8B87A", corrosive: "#8FA05A", void: "#8E6FB5", tau: "#6FA3C9", true: "#E4E2DC" };
/** Damage-type icon: the official file when it has been added to src/assets/damage, otherwise a neutral FarmFrame marker. */
export function DamageIcon({ type, size = 16 }: { type: string; size?: number }) {
  const k = type.toLowerCase().replace(/\s+/g, ""), src = art[k], label = type.charAt(0).toUpperCase() + type.slice(1);
  return src
    ? <img className="dmgic" src={src} alt={label} title={label} width={size} height={size} decoding="async" />
    : <svg className="dmgic" viewBox="0 0 16 16" width={size} height={size} role="img" aria-label={label}><title>{label}</title><path d="M8 1l7 7-7 7-7-7z" fill={COLOR[k] ?? "#8E9392"} fillOpacity=".35" stroke={COLOR[k] ?? "#8E9392"} strokeWidth="1.4" /></svg>;
}
