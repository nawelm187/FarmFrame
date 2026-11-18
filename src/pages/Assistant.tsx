import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnswerCards from "../AnswerCards";
import { useAnswerEngine } from "../lib/useAnswerEngine";
import { followUp } from "../lib/followUp";
import { ASSISTANT_EXAMPLES } from "../data/assistantExamples";
import { useT } from "../i18n";
/** The FarmFrame assistant. It is not a language model and it calls no outside AI: it uses the same engine as the Ctrl+K search
 *  (intents, one index over every page, item, relic, resource, enemy and method FarmFrame knows) and shows the answer cards.
 *  Nothing typed here leaves the browser; the last questions are kept on this device only. */
const KEY = "ff.assistant";
const read = (): string[] => { try { const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(-8) : []; } catch { return []; } };
const save = (h: string[]) => { try { localStorage.setItem(KEY, JSON.stringify(h.slice(-8))); } catch { /* storage unavailable */ } };
function Turn({ text, q, onSubject }: { text: string; q: string; onSubject: (s: string | null) => void }) {
  const tr = useT(), e = useAnswerEngine(q), kind = e.u0.intent?.kind, subjectless = kind === "now" || kind === "changed" || kind === "mods", list = subjectless ? [] : e.hits;
  const answered = e.intent || e.itemName || e.whatName || e.methods || e.target || list.length > 0;
  // What this answer was about, so a follow-up like "and where do I get it?" can point at it.
  const subject = e.itemName || e.whatName || (e.intent && "subject" in e.intent ? e.intent.subject : null) || (e.target && e.top ? e.top.doc.title : null) || null;
  useEffect(() => { if (answered) onSubject(subject); }, [subject, answered, onSubject]);
  return (<section className="astturn" aria-live="polite"><p className="astq"><span className="muted">{tr("asYou")}:</span> {text}</p>
    {q !== text && <p className="muted">{tr("asUnderstood", { q })}</p>}
    <AnswerCards e={e} go={() => {}} />
    {list.length > 0 && <ul className="list">{list.slice(0, 6).map((h, i) => <li key={h.cat + h.label + i}><Link to={h.to}>{h.label}</Link><span className="tag">{h.cat}</span></li>)}</ul>}
    {!answered && <p className="muted">{tr("asNone")}</p>}</section>);
}
export default function Assistant() {
  const tr = useT(), [draft, setDraft] = useState(""), [current, setCurrent] = useState<{ text: string; query: string } | null>(null), [last, setLast] = useState<string | null>(null), [history, setHistory] = useState<string[]>(read);
  const ask = (text: string) => { const q = text.trim().slice(0, 200); if (!q) return; setCurrent({ text: q, query: followUp(q, last).query }); setDraft(""); const h = [...history.filter(x => x !== q), q]; setHistory(h); save(h); };
  const clear = () => { setCurrent(null); setLast(null); setHistory([]); save([]); };
  return (<><h1>{tr("assistant")}</h1><p className="muted">{tr("asIntro")}</p>
    <div className="astform"><input aria-label={tr("asPlaceholder")} placeholder={tr("asPlaceholder")} value={draft} maxLength={200} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") ask(draft); }} />
      <button className="btn" disabled={!draft.trim()} onClick={() => ask(draft)}>{tr("asAsk")}</button></div>
    {current ? <Turn key={current.query} text={current.text} q={current.query} onSubject={setLast} /> : <div><p className="muted">{tr("asTry")}</p><div className="chips">{ASSISTANT_EXAMPLES.map(x => <button key={x} className="relicchip" onClick={() => ask(x)}>{x}</button>)}</div></div>}
    {history.length > 0 && <div className="chips" role="group">{history.slice().reverse().map(x => <button key={x} className={"relicchip" + (x === current?.text ? " own" : "")} onClick={() => ask(x)}>{x}</button>)}<button className="btn" onClick={clear}>{tr("asClear")}</button></div>}
    <p className="muted">{tr("asHow")}</p></>);
}
