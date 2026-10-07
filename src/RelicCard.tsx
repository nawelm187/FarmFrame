import { Link } from "react-router-dom";
import ItemArt, { useImages } from "./ItemArt";
import RelicArt from "./RelicArt";
import { useMany } from "./lib/data";
import type { Relic } from "./lib/drops";
import { VAULT_ALT, VAULT_SRC, VAULT_URL, parseVault } from "./lib/vault";
const RO: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2 };
export function VaultBadge({ name }: { name: string }) {
  const [{ rec, status }] = useMany([{ id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }]);
  const v = parseVault(rec?.data)?.get(name);
  const label = v === undefined ? (status === "LOADING" ? "Vault status loading" : "Vault status unknown") : v ? "Vaulted" : "Available";
  return <span className={"tag " + (v === undefined ? "UNAVAILABLE" : v ? "STALE" : "FRESH")} title="Community dataset, may lag behind the game">{label}</span>;
}
/** Does a reward name match what the player searched for? Needs at least two letters. */
export const isMark = (item: string, mark?: string) => { const m = (mark ?? "").trim().toLowerCase(); return m.length >= 2 && item.toLowerCase().includes(m); };
/** A relic as a card: art, name, vault status and everything it can give, with the searched item highlighted. */
export default function RelicCard({ r, mark }: { r: Relic; mark?: string }) {
  const intact = r.st.Intact ?? Object.values(r.st)[0] ?? [], rad = r.st.Radiant ?? [];
  const rows = [...intact].sort((a, b) => (RO[a.rarity] ?? 3) - (RO[b.rarity] ?? 3) || a.itemName.localeCompare(b.itemName));
  const img = useImages();
  const found = rows.some(x => isMark(x.itemName, mark));
  return (<article className={"relcard" + (found ? " has" : "")}>
    <header><RelicArt tier={r.tier} name={r.name} size={44} /><div><Link to={`/relics?q=${encodeURIComponent(r.name)}`}><b>{r.name}</b></Link><div><VaultBadge name={r.name} /></div></div></header>
    <ul>{rows.map(x => { const hit = isMark(x.itemName, mark), ra = rad.find(y => y.itemName === x.itemName && y.rarity === x.rarity);
      return (<li key={x.itemName + x.rarity} className={hit ? "hit" : undefined}><span className={"rar " + x.rarity} title={x.rarity}>◆ {x.rarity}</span>
        <ItemArt file={img(x.itemName)} size={32} /><span><Link to={`/item/${encodeURIComponent(x.itemName)}`}>{x.itemName}</Link>{hit && <b className="found"> ★ This is what you searched for</b>}
          <span className="muted"> {x.chance}%{ra && ra.chance !== x.chance ? ` → ${ra.chance}% Radiant` : ""}</span></span></li>); })}</ul>
    <footer><Link to={`/farm/${encodeURIComponent(r.name + " Relic")}`}>How to get it</Link></footer>
  </article>);
}
