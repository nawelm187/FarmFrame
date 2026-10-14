// Smart search: one index over everything FarmFrame knows, matched word by word. Words can come in any order, be cut short, carry typos,
// or come from the description or the drop list instead of the name. Nothing here knows a fixed sentence.
export interface Doc { /** Stable id shared with goals, Tracking and Farm Plan (see refs.ts). */ id?: string; title: string; kind: string; to: string; /** Other names and keywords: counted almost like the title. */ alias?: string; /** Descriptions, drop places, rewards: counted lightly. */ body?: string; boost?: number }
export interface Match { doc: Doc; score: number; field: "title" | "alias" | "body" }
export const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
export const tokens = (s: string): string[] => { const n = normalize(s); return n ? n.split(" ") : []; };
/** Words that carry no meaning on their own (English and Spanish). They are ignored unless the query has nothing else. */
const STOP = new Set(("the a an of for to do does did i me my we you can could should would which what where when who how is are was in on at it its that this these with and or be get need want have has there any some " +
  "de la el los las un una que como donde cual cuales para por mi quiero puedo debo se en y o con del al es hay algo thing things stuff something anything cosa cosas").split(" "));
/** Distance with swapped neighbours counted as one edit; returns max + 1 as soon as it is clear the words are further apart than `max`. */
export function within(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let pp: number[] | null = null, p = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const c = [i]; let min = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (pp && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, pp[j - 2] + 1);
      c[j] = v; if (v < min) min = v;
    }
    if (min > max) return max + 1; pp = p; p = c;
  }
  return p[b.length];
}
/** How a word sounds, roughly, so that spellings a beginner would write match: aia = aya, kuba = kuva, bosfor = vosfor, galium = gallium. Not a spelling rule: it only compares. */
export const phon = (w: string) => w.replace(/ph/g, "f").replace(/ck|qu/g, "k").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k").replace(/z/g, "s").replace(/v/g, "b").replace(/y/g, "i").replace(/(?<![cs])h/g, "").replace(/(.)\1+/g, "$1");
export interface Index { docs: Doc[]; post: Map<string, [number, number][]>; vocab: string[]; titles: string[]; /** Sound-alike key to the words that have it. */ ph: Map<string, string[]> }
const W = { title: 3, alias: 2, body: 1 } as const;
export function buildIndex(docs: Doc[]): Index {
  const post = new Map<string, [number, number][]>(), titles: string[] = [];
  docs.forEach((d, i) => {
    const best = new Map<string, number>(), put = (t: string, w: number) => { if (t.length && (best.get(t) ?? 0) < w) best.set(t, w); };
    titles.push(normalize(d.title));
    tokens(d.title).forEach(t => put(t, W.title)); if (d.alias) tokens(d.alias).forEach(t => put(t, W.alias));
    if (d.body) tokens(d.body).slice(0, 300).forEach(t => put(t, W.body));
    for (const [t, w] of best) { const a = post.get(t); if (a) a.push([i, w]); else post.set(t, [[i, w]]); }
  });
  const ph = new Map<string, string[]>(); for (const t of post.keys()) if (t.length >= 3) { const k = phon(t), a = ph.get(k); if (a) a.push(t); else ph.set(k, [t]); }
  return { docs, post, vocab: [...post.keys()].sort(), titles, ph };
}
const lower = (v: string[], t: string) => { let lo = 0, hi = v.length; while (lo < hi) { const m = (lo + hi) >> 1; if (v[m] < t) lo = m + 1; else hi = m; } return lo; };
/** Ranks the documents for a query. A document needs most of the words (at least 60%); more words, better words and a title that starts like the query score higher. */
export function searchIndex(ix: Index, query: string, limit = 10): Match[] {
  let qt = [...new Set(tokens(query))]; if (!qt.length) return [];
  const content = qt.filter(t => !STOP.has(t)); if (content.length) qt = content;
  const n = qt.length, need = Math.max(1, Math.ceil(n * 0.6)), per = new Map<number, { s: number[]; w: number }>();
  qt.forEach((t, k) => {
    const found = new Map<number, [number, number]>(), last = k === n - 1;
    const add = (tok: string, q: number) => { for (const [d, w] of ix.post.get(tok) ?? []) { const cur = found.get(d); if (!cur || q * w > cur[0]) found.set(d, [q * w, w]); } };
    if (ix.post.has(t)) add(t, 1);
    if (t.length >= 2) { let c = 0; for (let i = lower(ix.vocab, t); i < ix.vocab.length && ix.vocab[i].startsWith(t) && c < 300; i++, c++) if (ix.vocab[i] !== t) add(ix.vocab[i], last ? 0.8 : 0.65); }
    if (t.length >= 4 && found.size < 40) for (const v of ix.vocab) if (v.length > t.length && !v.startsWith(t) && v.includes(t)) add(v, 0.4);
    if (t.length >= 4 && found.size < 10) { const max = t.length >= 8 ? 2 : 1; for (const v of ix.vocab) { if (Math.abs(v.length - t.length) > max) continue; const d = within(t, v, max); if (d >= 1 && d <= max) add(v, d === 1 ? 0.55 : 0.4); } }
    // Nothing matched this word: look for words that sound the same (aia = aya), then for one or two wrong letters.
    if (found.size === 0 && t.length >= 3) { const pt = phon(t); for (const v of ix.ph.get(pt) ?? []) add(v, 0.7);
      if (found.size === 0) { const max = pt.length >= 9 ? 2 : 1; for (const [k, vs] of ix.ph) { if (Math.abs(k.length - pt.length) > max) continue; const d = within(pt, k, max); if (d >= 1 && d <= max) for (const v of vs) add(v, d === 1 ? 0.5 : 0.35); } } }
    for (const [d, [s, w]] of found) { const e = per.get(d) ?? { s: new Array<number>(n).fill(0), w: 0 }; e.s[k] = s; e.w = Math.max(e.w, w); per.set(d, e); }
  });
  const qn = qt.join(" "), out: Match[] = [];
  for (const [d, e] of per) {
    const m = e.s.filter(x => x > 0).length; if (m < need) continue;
    const doc = ix.docs[d], tn = ix.titles[d];
    let score = (e.s.reduce((a, b) => a + b, 0) / n) * (m / n) + (doc.boost ?? 0) - Math.min(0.4, tn.split(" ").length * 0.04);
    if (tn === qn) score += 3; else if (tn.startsWith(qn)) score += 1.5; else if (tn.includes(qn)) score += 1;
    out.push({ doc, score, field: e.w >= 3 ? "title" : e.w >= 2 ? "alias" : "body" });
  }
  return out.sort((a, b) => b.score - a.score || a.doc.title.length - b.doc.title.length).slice(0, limit);
}
/** The query with each misspelt word replaced by the closest word the index knows, or null when nothing needed fixing. A word that is the start of a known word is left alone (the person is still typing). */
export function suggest(ix: Index, query: string): string | null {
  const ts = tokens(query); let changed = false;
  const out = ts.map(t => {
    if (t.length < 3 || STOP.has(t) || ix.post.has(t)) return t;
    const k = lower(ix.vocab, t); if (k < ix.vocab.length && ix.vocab[k].startsWith(t)) return t;
    const weight = (v: string) => ix.post.get(v)?.length ?? 0, pt = phon(t);
    let best: string | null = null, bd = 9;
    for (const v of ix.ph.get(pt) ?? []) if (best === null || weight(v) > weight(best)) { best = v; bd = 0; }
    if (best === null) { const max = t.length >= 9 ? 2 : 1; for (const v of ix.vocab) { if (Math.abs(v.length - t.length) > max) continue; const d = within(t, v, max); if (d >= 1 && d <= max && (d < bd || (d === bd && weight(v) > weight(best!)))) { best = v; bd = d; } } }
    if (best === null || bd > 2) return t; changed = true; return best;
  });
  return changed ? out.join(" ") : null;
}
/** What the person is asking for, read from the words and not from a fixed sentence. */
export type Intent = { kind: "now" } | { kind: "changed" } | { kind: "method"; subject: string } | { kind: "where"; subject: string } | { kind: "what"; subject: string } | null;
const FARMW = new Set("farm farming farmear farmeo grind grindear conseguir conseguirlo obtener obtain buy comprar find encontrar drop drops sells sell sold vende venden unlock desbloquear".split(" "));
const NOWW = new Set("now today tonight currently current right ahora hoy actualmente next best worth priority priorities conviene mejor primero first".split(" "));
const DOW = new Set("do play run hacer jugar".split(" "));
const WHEREW = new Set("where donde how como who which obtain".split(" "));
const CHANGEDRE = /\b(changed|changes|patch notes?|patchnotes|hotfix|hotfixes|cambio|cambios|parche|parches|novedades|latest update|last update|newest update|ultima actualizacion)\b/;
const FASTW = new Set("fast faster fastest quick quickly efficient efficiently rapido rapida eficiente method methods metodo metodos way ways".split(" "));
/** Words of "how do I get X": with "how"/"como" they mean the person wants to know where X comes from. */
const GETW = new Set("get got obtain find consigo conseguir consigue conseguirlo encuentro encontrar encuentra obtengo obtener obtiene ganar earn".split(" "));
/** Nouns that only point at the thing ("this material"), not at which thing it is. */
const NOUNW = new Set("material materials recurso recursos resource resources item items objeto objetos este esta esto ese esa aquel".split(" "));
const WHATRE = /^(?:what is|what are|what s|whats|que es|que son|para que sirve|para que sirven|what does (.+) do|tell me about|info about|info on|info sobre|informacion de|informacion sobre|explain|explica|explicame)\b/;
export const isFiller = (t: string) => isIntentWord(t);
const isIntentWord = (t: string) => GETW.has(t) || NOUNW.has(t) || FASTW.has(t) || STOP.has(t) || FARMW.has(t) || NOWW.has(t) || WHEREW.has(t) || DOW.has(t);
export function detectIntent(q: string): Intent {
  const n = normalize(q), ts = n ? n.split(" ") : []; if (ts.length < 2) return null;
  if (CHANGEDRE.test(n) && ts.length <= 7) return { kind: "changed" };
  const hasGet = ts.some(t => GETW.has(t)) && ts.some(t => t === "how" || t === "como" || t === "where" || t === "donde"), hasFarm = ts.some(t => FARMW.has(t)), hasNow = ts.some(t => NOWW.has(t)), hasDo = ts.some(t => DOW.has(t));
  const rest = ts.filter(t => !isIntentWord(t));
  // "forma" is also an item, so it only means "way" in "mejor forma de ...".
  const esWay = /\bmejor(es)? formas?\b/.test(n);
  const hasAcq = hasFarm || ts.some(t => GETW.has(t));
  if (hasAcq && (esWay || ts.some(t => FASTW.has(t)))) return { kind: "method", subject: ts.filter(t => !isIntentWord(t) && !(esWay && /^formas?$/.test(t))).join(" ") };
  if (!rest.length && ((hasFarm && (hasNow || ts.length <= 6)) || (hasDo && hasNow))) return { kind: "now" };
  const wm = WHATRE.exec(n); if (wm && !hasFarm) { const tail = wm[1] ?? n.slice(wm[0].length), subject = tail.split(" ").filter(t => t && !isIntentWord(t)).join(" "); if (subject.length >= 2 && subject.split(" ").length <= 5) return { kind: "what", subject }; }
  if (hasFarm || hasGet || ts.some(t => WHEREW.has(t))) {
    let a = 0, b = ts.length; while (a < b && isIntentWord(ts[a])) a++; while (b > a && isIntentWord(ts[b - 1])) b--;
    const subject = ts.slice(a, b).join(" "); if (subject.length >= 2 && (hasFarm || hasGet || ts.some(t => t === "where" || t === "donde" || t === "who"))) return { kind: "where", subject };
  }
  return null;
}
