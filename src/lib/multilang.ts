// Language-independent search: words and phrases from the 9 interface languages are turned into the canonical English words the search engine
// already understands ("où farmer des crédits" -> "where farm credits"), before anything else runs. Game proper nouns (Warframe, weapon and relic
// names) are the same in every language and are not touched. Everything here only ADDS ways to match: a wrong alias just never matches.
import { en } from "../i18n/en";
import { MENU_KEYS, MENU_TERMS } from "./menuTerms";
const CJK = /[\u3040-\u30ff\u3400-\u9fff]/;
/** Canonical English word or phrase -> how it is written in the other languages (lower case, accents kept: "où" is not "ou"). */
const CONCEPTS: Record<string, string[]> = {
  where: ["onde", "où", "wo", "dove", "где", "куда", "哪里", "哪裡", "在哪", "在哪里", "在哪裡", "どこで", "どこ"],
  how: ["comment", "wie", "come", "как", "怎么", "怎麼", "如何", "どうやって"],
  get: ["obtenir", "trouver", "trouve", "bekomme", "finde", "trovo", "obtenho", "bekommen", "erhalten", "finden", "ottenere", "trovare", "obter", "получить", "достать", "найти", "获得", "获取", "得到", "入手", "手に入れる", "ゲット"],
  farm: ["farmer", "farmen", "farmare", "farmar", "фармить", "фарм", "刷取", "刷", "周回", "ファーム"],
  buy: ["acheter", "kaufen", "comprare", "купить", "购买", "购", "买", "買う", "購入"],
  need: ["besoin", "brauche", "brauchen", "benötige", "bisogno", "serve", "servono", "preciso", "precisa", "нужно", "нужен", "нужна", "нужны", "надо", "需要", "想要", "必要", "欲しい", "ほしい"],
  best: ["meilleur", "meilleure", "beste", "besten", "migliore", "melhor", "лучший", "лучшая", "лучшие", "最佳", "最好", "最高", "最適", "一番"],
  fast: ["rapide", "schnell", "veloce", "rápido", "быстро", "быстрый", "快速", "最快", "速い", "高速", "効率"],
  method: ["méthode", "methode", "metodo", "método", "способ", "方法", "やり方"],
  place: ["endroit", "lieu", "ort", "luogo", "posto", "место", "地方", "地点", "場所"],
  now: ["maintenant", "jetzt", "adesso", "agora", "сейчас", "现在", "現在", "今すぐ"],
  today: ["aujourd hui", "heute", "oggi", "hoje", "сегодня", "今天", "今日"],
  "what is": ["qu est ce que", "qu est ce qu", "c est quoi", "was ist", "was sind", "che cos e", "cos e", "o que é", "что такое", "什么是", "什麼是"],
  lore: ["histoire", "hintergrund", "geschichte", "storia", "história", "история", "лор", "背景故事", "剧情", "设定", "背景", "ロア", "設定"],
  "patch notes": ["mise à jour", "patchnotizen", "aggiornamento", "atualização", "обновление", "更新日志", "更新", "パッチノート"],
  // Materials and currencies, by the name the game gives them in each language where I am sure of it.
  credits: ["crédits", "crediti", "кредиты", "кредитов", "кредит", "信用点", "信用點", "现金", "クレジット"],
  platinum: ["platine", "platin", "platina", "платина", "платину", "白金", "プラチナ"],
  "orokin cell": ["cellule orokin", "cellules orokin", "orokin zelle", "orokin zellen", "cellula orokin", "cellule orokin", "ячейка орокин", "ячейки орокин"],
  "steel essence": ["essence d acier", "stahlessenz", "essenza d acciaio", "essência de aço", "стальная эссенция"],
  "argon crystal": ["cristal d argon", "cristaux d argon", "argonkristall", "argonkristalle", "cristallo di argon", "cristais de argônio", "кристаллы аргона"],
};
/** Words with no meaning of their own in a question, per language; dropped so they do not count as words that failed to match. */
/** Chinese and Japanese particles need no list: any CJK character that is not a known word is dropped. */
const FILLER = ("le la les un une des du au aux et pour sur dans je ai mon ma mes qui que quoi est sont ce cet cette ces l d j qu c n s m t " +
  "der die das den dem des ein eine einen einem einer und oder für fuer von mit zu zum zur im auf ist sind ich mein meine mir " +
  "il lo gli uno di del della dei delle da con per su sono io mi mio mia " +
  "os as um uma uns umas do dos das em no na nos nas com para por eu meu minha " +
  "я мне мой моя мои в на для и или с со по что это как у от из о об " +
  "").split(" ").filter(Boolean);
const MAP = new Map<string, string>(), CJKKEYS: string[] = [], DROP = new Set(FILLER);
const add = (k: string, v: string) => {
  const key = k.toLowerCase().normalize("NFKC").replace(/['’`-]/g, " ").replace(/\s+/g, " ").trim(); if (!key || key === v) return;
  MAP.set(key, v); if (CJK.test(key)) CJKKEYS.push(key);
  // People often type without accents ("relíquias" or "reliquias"); one- to three-letter words keep theirs ("où" is not "ou", which means "or").
  const plain = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC"); if (plain !== key && key.length > 3 && !MAP.has(plain)) MAP.set(plain, v);
};
for (const [v, ks] of Object.entries(CONCEPTS)) for (const k of ks) add(k, v);
// The interface's own words, in every language, point at the English page name: "Reliquias", "Relikte", "遗物" all mean Relics.
for (const terms of Object.values(MENU_TERMS)) for (const k of MENU_KEYS) add(terms[k], en[k].toLowerCase());
CJKKEYS.sort((a, b) => b.length - a.length);
const MAXN = Math.max(...[...MAP.keys()].filter(k => !CJK.test(k)).map(k => k.split(" ").length));
/** Question endings of Chinese and Japanese ("X是什么", "Xとは") become the English prefix "what is X". */
const WHAT_END = /(是什么|是什麼|とは|って何|ってなに|は何)$/;
/** The query with words of any of the 9 languages replaced by canonical English ones. Returns the query unchanged when nothing is recognised or nothing would be left. */
export function toCanonical(q: string): string {
  let s = q.toLowerCase().normalize("NFKC").trim(), prefix = "";
  const we = WHAT_END.exec(s); if (we) { s = s.slice(0, we.index); prefix = "what is "; }
  const units = s.replace(/['’`-]/g, " ").match(/[\p{L}\p{N}\p{M}]+/gu) ?? [], out: string[] = []; let changed = !!prefix;
  for (const u of units) {
    if (CJK.test(u)) {
      for (let i = 0; i < u.length;) {
        const k = CJKKEYS.find(key => u.startsWith(key, i));
        if (k) { out.push(MAP.get(k)!); i += k.length; changed = true; continue; }
        if (CJK.test(u[i])) { i++; changed = true; continue; } // an unknown CJK character: the index has no Chinese or Japanese words to match it with
        let j = i; while (j < u.length && !CJK.test(u[j])) j++; out.push(u.slice(i, j)); i = j; // Latin letters written next to CJK text (a Warframe name)
      }
      continue;
    }
    out.push(u);
  }
  // Words: longest phrase first (up to MAXN words). Filler words of other languages are dropped ONLY when the phrase is clearly not English or
  // Spanish (it has a recognised foreign word or a non-Latin script); otherwise "que es vosfor" or "trazas del vacio" would lose words the engine needs.
  let res: string[] = [], hits = 0;
  for (let i = 0; i < out.length;) {
    let hit: string | null = null, len = 0;
    for (let k = Math.min(MAXN, out.length - i); k >= 1; k--) { const v = MAP.get(out.slice(i, i + k).join(" ")); if (v) { hit = v; len = k; break; } }
    if (hit) { res.push(hit); i += len; hits++; changed = true; } else { res.push(out[i]); i++; }
  }
  if ((hits || changed || /[^\u0000-\u024f\s]/.test(s)) && res.length > 1) { const kept = res.filter(w => !DROP.has(w)); if (kept.length) { changed = changed || kept.length !== res.length; res = kept; } }
  const text = (prefix + res.join(" ")).trim();
  return changed && text ? text : q;
}
