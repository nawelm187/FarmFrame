import { METHODS, type Method } from "../data/methods";
import { methodDocs, methodsFor } from "./methods";
import { canon } from "./lexicon";
import { toCanonical } from "./multilang";
import { buildIndex, detectIntent, normalize, searchIndex, type Intent } from "./smartSearch";
const NEED = /\b(necesito|necesitas|necesita|ocupo|busco|buscando|quiero|quisiera|dame|give me|i need|need|i want|want|looking for)\b/;
/** What a typed query means: the query in game words, the intent, which material it names (if any) and what is left over. */
export interface Understood { text: string; intent: Intent; material: string | null; /** Words of the subject that are not the material (for example "xoris" in "credit farm xoris"). */ hint: string }
export function understand(q: string): Understood {
  const qq = toCanonical(q), c = canon(qq), material = c.materials[0] ?? null;
  // "necesito creditos", "i need platinum": a need plus a material we know means "how do I get it".
  const intent = detectIntent(c.text) ?? (material && NEED.test(normalize(qq)) ? ({ kind: "where", subject: normalize(material) } as const) : null);
  const subject = intent && "subject" in intent ? intent.subject : "";
  const matWords = new Set((material ? canon(material).text : "").split(" ").filter(Boolean));
  const hint = subject.split(" ").filter(w => w && !matWords.has(w)).join(" ");
  return { text: c.text, intent, material, hint };
}
let ix: ReturnType<typeof buildIndex> | null = null;
const idx = () => (ix ??= buildIndex(methodDocs()));
/** Methods that answer the query: those for the material it names, the best match for the leftover words first; with no material, the methods the words find. */
export function methodsForQuery(u: Understood, all: Method[] = METHODS): Method[] {
  const byId = new Map(all.map(m => [`method:${m.id}`, m]));
  if (u.material) {
    const own = methodsFor(u.material, all); if (own.length < 2 || !u.hint) return own;
    const rank = new Map(searchIndex(idx(), u.hint, 12).map((m, i) => [m.doc.id!, i]));
    return own.slice().sort((a, b) => (rank.get(`method:${a.id}`) ?? 99) - (rank.get(`method:${b.id}`) ?? 99));
  }
  const sub = u.intent && "subject" in u.intent ? u.intent.subject : u.text;
  return searchIndex(idx(), sub, 4).filter(h => h.score >= 1.5).map(h => byId.get(h.doc.id!)).filter((m): m is Method => !!m).slice(0, 3);
}
