/** A follow-up such as "and where do I get it?" or "¿y dónde lo consigo?" points at the subject of the previous answer.
 *  This rewrites it with that subject, so the same engine can answer it. Only clear pronouns are replaced (it, that, this, them, eso, esto…),
 *  and the Spanish "lo / la / los / las" only right after a question word ("dónde lo consigo"), because "la historia de…" is an article. */
const EN = /\b(it|that|this|them|those|these)\b/, ES = /\b(eso|esto|esa|ese|esos|esas|aquello)\b/, CLITIC = /\b(donde|como|cuando|cuanto|cuanta|cuantos|cuantas|que|cual|cuales) (lo|los|la|las)\b/;
const plain = (q: string) => q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
export function followUp(q: string, subject: string | null): { query: string; used: boolean } {
  const n = plain(q), words = n.split(" ").filter(Boolean);
  if (!subject || !n || words.length > 8) return { query: q.trim(), used: false };
  const clitic = CLITIC.exec(n);
  let out = n;
  if (EN.test(n)) out = n.replace(EN, subject);
  else if (ES.test(n)) out = n.replace(ES, subject);
  else if (clitic) out = n.replace(CLITIC, (_m, w: string) => w + " " + subject);
  else return { query: q.trim(), used: false };
  return { query: out.replace(/^(and|also|y|ademas|tambien|ok|vale) /, "").trim(), used: true };
}
