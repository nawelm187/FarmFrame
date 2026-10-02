import { CATS } from "../lib/catalog";
import { useCatalog } from "../lib/useCatalog";
const wiki = (name: string) => `https://wiki.warframe.com/w/${encodeURIComponent(name.replace(/ /g, "_"))}`;
const A = ({ href, children }: { href: string; children: string }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
export default function Lore() {
  const { items } = useCatalog("warframe");
  const base = (items ?? []).filter(i => !i.isPrime);
  return (<><h1>Lore</h1>
    <p className="lead">The story of Warframe belongs to Digital Extremes, so this page points to the official sources instead of copying them.</p>
    <h2>Official comics and webcomics</h2>
    <ul className="abil">
      <li><b>WARFRAME: Ghouls</b><span className="muted">A five-issue comic set before the events of the game, about the Tenno, the Grineer conquest and an ancient Orokin vault.</span></li>
      <li><b>Warframe Fragments</b><span className="muted">Short webcomics on the official website that tell the backstory of characters and quests.</span></li>
      <li><b>WARFRAME: 1999</b><span className="muted">A free 33-page webcomic about the origins of the Protoframes. <A href="https://www.warframe.com/news/warframe-1999-webcomic-available-now">Read it on the official site</A></span></li>
    </ul>
    <p><A href="https://wiki.warframe.com/w/Comics">All comics on the official wiki</A></p>
    <h2>Lore by Warframe</h2>
    <p className="muted">Each link opens that Warframe's codex page on the official wiki.</p>
    {base.length ? <div className="chips">{base.map(i => <a key={i.slug} className="relicchip" href={wiki(i.name)} target="_blank" rel="noopener noreferrer">{i.name}</a>)}</div> : <p className="muted">Loading the list of {CATS.warframe.label.toLowerCase()}…</p>}
  </>);
}
