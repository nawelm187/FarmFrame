import { phaseProgress } from "./lib/cycles";
const SUN = new Set(["day", "warm", "fass"]), MOON = new Set(["night", "cold", "vome"]);
const STARS: [number, number][] = [[14, 9], [30, 18], [47, 7], [78, 12], [96, 8], [108, 20], [64, 22]];
/** A small sky over the planet: the sun (or the moon) travels along an arc from sunrise to sunset as the phase advances. */
export default function CycleSky({ k, state, expiry, now }: { k: string; state: string; expiry: string; now: number }) {
  const s = state.toLowerCase(), sun = SUN.has(s), moon = MOON.has(s), p = phaseProgress(k, state, expiry, now);
  if (p == null || (!sun && !moon)) return null;
  const x = 10 + 100 * p, y = 44 - 34 * Math.sin(Math.PI * p);
  const edge = p < 0.1 ? (sun ? "sunrise" : "moonrise") : p > 0.9 ? (sun ? "sunset" : "moonset") : sun ? "daytime" : "night";
  const gid = "sky-" + k;
  return (<svg viewBox="0 0 120 48" className="sky" role="img" aria-label={`${state}: ${edge}`}>
    <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sun ? "#27414D" : "#080B10"} /><stop offset="1" stopColor={sun ? "#5B7078" : "#18202B"} /></linearGradient></defs>
    <rect width="120" height="48" fill={`url(#${gid})`} />
    {moon && STARS.map(([a, b], i) => <circle key={i} cx={a} cy={b} r=".7" fill="#E4E2DC" opacity=".7" />)}
    <g style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform 1s linear" }}>
      {sun ? <><circle r="5" fill="#E0B861" />{Array.from({ length: 8 }, (_, i) => <line key={i} y1="-8" y2="-10.5" stroke="#E0B861" strokeWidth="1.2" transform={`rotate(${i * 45})`} />)}</>
        : <><circle r="9" fill="#DDE3EA" opacity=".08" /><circle r="5.2" fill="#DDE3EA" opacity=".16" />
          {/* crescent: an outer half circle (r 5) and a flatter inner arc (r 6.5) between the same two horns */}
          <path d="M1 -5 A5 5 0 0 0 1 5 A6.5 6.5 0 0 1 1 -5Z" fill="#EEF2F6" /></>}
    </g>
    <path d="M0 48V43Q60 33 120 43V48Z" fill="#0B0D0F" />
  </svg>);
}
