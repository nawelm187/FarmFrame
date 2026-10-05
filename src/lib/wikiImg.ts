import { wikiPortrait } from "../Npc";
// Last-resort picture from the Warframe wiki when the image CDN has no file for an item. Requests run two at a time so a long list
// (40 enemies) does not hit the wiki all at once; every answer, including "none", is remembered for a week by wikiPortrait.
let active = 0; const waiting: (() => void)[] = [];
const next = () => { active--; waiting.shift()?.(); };
export async function wikiImage(name: string): Promise<string | null> {
  if (active >= 2) await new Promise<void>(r => waiting.push(r));
  active++; try { return await wikiPortrait(name); } finally { next(); }
}
