import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
// Lightweight data-problem report. Stores category, optional note and the page only; no personal data is requested.
const CATS = ["Incorrect acquisition information", "Incorrect drop information", "Outdated information", "Incorrect item information", "Incorrect market information", "Incorrect world state", "Other"];
const LIM = "ff.reports";
const allowed = () => { try { const a = (JSON.parse(localStorage.getItem(LIM) ?? "[]") as number[]).filter(t => Date.now() - t < 864e5); return a.length < 5 && (!a.length || Date.now() - a[a.length - 1] > 3e4); } catch { return true; } };
const note = () => { try { const a = (JSON.parse(localStorage.getItem(LIM) ?? "[]") as number[]).filter(t => Date.now() - t < 864e5); localStorage.setItem(LIM, JSON.stringify([...a, Date.now()])); } catch { /* ignore */ } };
export default function ReportIssue() {
  const [open, setOpen] = useState(false), [cat, setCat] = useState(CATS[0]), [text, setText] = useState(""), [st, setSt] = useState<"idle" | "sending" | "sent" | "err" | "wait">("idle"), loc = useLocation(), opened = useRef(0);
  const send = async () => {
    // Anti-bot check by timing instead of a hidden form field (hidden fields look like phishing to page scanners).
    if (Date.now() - opened.current < 2000) { setSt("wait"); return; }
    if (!allowed()) { setSt("wait"); return; }
    setSt("sending");
    try {
      const { supabase } = await import("./lib/supabase");
      const { error } = await supabase.from("data_reports").insert({ category: cat, page: loc.pathname.slice(0, 200), note: text.trim().slice(0, 500) || null });
      if (error) throw error;
      note(); setSt("sent"); setText("");
    } catch { setSt("err"); }
  };
  return (
    <footer className="report">
      <p className="muted disclaimer">FarmFrame is an unofficial, fan-made planning tool. It is not affiliated with or endorsed by Digital Extremes. Warframe is a trademark of Digital Extremes Ltd. FarmFrame never asks for your Warframe login.</p>
      {!open ? <button className="btn" onClick={() => { opened.current = Date.now(); setOpen(true); setSt("idle"); }}>Report a data problem</button> : (
        <div className="panel" role="group" aria-label="Report a data problem">
          <label>What is wrong?<br /><select value={cat} onChange={e => setCat(e.target.value)}>{CATS.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Details (optional, no personal information)<br /><textarea value={text} maxLength={500} rows={3} onChange={e => setText(e.target.value)} /></label>
          <p className="muted">Page: {loc.pathname}</p>
          <div className="row"><button className="btn" disabled={st === "sending"} onClick={() => void send()}>{st === "sending" ? "Sending…" : "Send report"}</button><button className="btn" onClick={() => setOpen(false)}>Close</button></div>
          {st === "sent" && <p role="status">Thanks. The report was received for review.</p>}
          {st === "err" && <p role="alert">The report could not be sent. Check your connection and try again.</p>}
          {st === "wait" && <p role="alert">Please wait a moment before sending a report. If you sent several already, try again later.</p>}
        </div>
      )}
    </footer>
  );
}
