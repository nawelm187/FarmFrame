const files = import.meta.glob("./assets/npc/*.{png,webp,jpg,jpeg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const art: Record<string, string> = {};
for (const [p, u] of Object.entries(files)) art[(p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "").toLowerCase()] = u;
export const npcSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** A vendor or character: portrait on top, name underneath, so new players know who they are looking at. Without an image, a neutral silhouette. */
export default function Npc({ name, role, size = 72 }: { name: string; role?: string; size?: number }) {
  const src = art[npcSlug(name)];
  return (<figure className="npc" style={{ ["--s" as string]: size + "px" }}>
    {src ? <img src={src} alt={name} loading="lazy" decoding="async" />
      : <svg viewBox="0 0 64 64" role="img" aria-label={name}><circle cx="32" cy="24" r="11" fill="none" stroke="#8E9392" strokeWidth="2" /><path d="M10 62c2-14 12-20 22-20s20 6 22 20" fill="none" stroke="#8E9392" strokeWidth="2" /></svg>}
    <figcaption><b>{name}</b>{role && <span className="muted">{role}</span>}</figcaption>
  </figure>);
}
