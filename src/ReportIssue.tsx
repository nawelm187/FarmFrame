import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useT } from "./i18n";
import { REPORT_CATS } from "./lib/reportCats";
// Lightweight data-problem report. Stores category, optional note and the page only; no personal data is requested.
const LIM = "ff.reports";
const allowed = () => { try { const a = (JSON.parse(localStorage.getItem(LIM) ?? "[]") as number[]).filter(t => Date.now() - t < 864e5); return a.length < 5 && (!a.length || Date.now() - a[a.length - 1] > 3e4); } catch { return true; } };
const note = () => { try { const a = (JSON.parse(localStorage.getItem(LIM) ?? "[]") as number[]).filter(t => Date.now() - t < 864e5); localStorage.setItem(LIM, JSON.stringify([...a, Date.now()])); } catch { /* ignore */ } };
export default function ReportIssue() {
  const t = useT(), [open, setOpen] = useState(false), [cat, setCat] = useState<string>(REPORT_CATS[0].value), [text, setText] = useState(""), [st, setSt] = useState<"idle" | "sending" | "sent" | "err" | "wait">("idle"), loc = useLocation(), opened = useRef(0);
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
      <p className="muted disclaimer">{t("rptDisclaimer")}</p>
      {!open ? <button className="btn" onClick={() => { opened.current = Date.now(); setOpen(true); setSt("idle"); }}>{t("rptOpen")}</button> : (
        <div className="panel" role="group" aria-label={t("rptOpen")}>
          <label>{t("rptWhat")}<br /><select value={cat} onChange={e => setCat(e.target.value)}>{REPORT_CATS.map(c => <option key={c.value} value={c.value}>{t(c.key)}</option>)}</select></label>
          <label>{t("rptDetails")}<br /><textarea value={text} maxLength={500} rows={3} onChange={e => setText(e.target.value)} /></label>
          <p className="muted">{t("rptPage", { path: loc.pathname })}</p>
          <div className="row"><button className="btn" disabled={st === "sending"} onClick={() => void send()}>{st === "sending" ? t("rptSending") : t("rptSend")}</button><button className="btn" onClick={() => setOpen(false)}>{t("rptClose")}</button></div>
          {st === "sent" && <p role="status">{t("rptThanks")}</p>}
          {st === "err" && <p role="alert">{t("rptErr")}</p>}
          {st === "wait" && <p role="alert">{t("rptWait")}</p>}
        </div>
      )}
    </footer>
  );
}
