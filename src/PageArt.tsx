const files = import.meta.glob("./assets/pages/*.{png,webp,jpg,jpeg,svg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const art: Record<string, string> = {};
export const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
for (const [p, u] of Object.entries(files)) art[slug((p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, ""))] = u;
export const hasArt = (n: string) => !!art[slug(n)];
/** Image for a page or panel. The file name in src/assets/pages is the title in lowercase with dashes (void-fissures.png). Renders nothing when there is no file. */
export default function PageArt({ name, size = 28 }: { name: string; size?: number }) {
  const u = art[slug(name)]; return u ? <img className="pageart" src={u} alt="" width={size} height={size} decoding="async" /> : null;
}
