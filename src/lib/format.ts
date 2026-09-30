export function fmt(ms: number): string {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return (d ? d + "d " : "") + (h ? h + "h " : "") + (d ? "" : m + "m ") + (d || h ? "" : (s % 60) + "s");
}
export const ts = (v: unknown) => (typeof v === "string" ? Date.parse(v) : NaN);
