import { useState } from "react";
import { useCloud } from "./lib/CloudProvider";
import { curLang, useT } from "./i18n";
import { SUPABASE_KEY, SUPABASE_URL } from "./lib/config";
type S = "idle" | "loading" | { text: string } | { error: string };
/** AI interpretation of the build. It only receives facts the app already calculated, and its answer is labelled as interpretation. */
export default function BuildAI({ facts }: { facts: object }) {
  const tr = useT(), { email } = useCloud(), [s, setS] = useState<S>("idle");
  const run = async () => {
    setS("loading");
    try {
      const { supabase } = await import("./lib/supabase"), token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) { setS({ error: tr("baiSignAgain") }); return; }
      const r = await fetch(`${SUPABASE_URL}/functions/v1/build-analysis`, { method: "POST", headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY, "content-type": "application/json" }, body: JSON.stringify({ build: facts, lang: curLang() }) });
      const d = (await r.json().catch(() => ({}))) as { text?: string; error?: string };
      if (r.ok && d.text) setS({ text: d.text });
      else setS({ error: r.status === 503 ? tr("baiNoServer") : r.status === 401 ? tr("baiSignIn") : tr("baiNoAnswer") });
    } catch { setS({ error: tr("baiUnreach") }); }
  };
  return (<section className="panel" style={{ margin: "1rem 0" }} aria-label={tr("baiTitle")}>
    <div className="row"><h3>{tr("baiTitle")}</h3><span className="tag STALE">{tr("baiTag")}</span></div>
    {!email ? <p className="muted">{tr("baiNeedLogin")}</p> : <>
      {(s === "idle" || (typeof s === "object" && "error" in s)) && <button className="btn" onClick={() => void run()}>{tr("baiAnalyze")}</button>}
      {s === "loading" && <div aria-hidden="true"><div className="sk" style={{ width: "80%" }} /><div className="sk" style={{ width: "60%" }} /></div>}
      {typeof s === "object" && "error" in s && <p className="muted">{s.error}</p>}
      {typeof s === "object" && "text" in s && <><p style={{ whiteSpace: "pre-wrap" }}>{s.text}</p><button className="btn" onClick={() => void run()}>{tr("baiAgain")}</button></>}
    </>}
    <p className="muted">{tr("baiDisclaimer")}</p>
  </section>);
}
