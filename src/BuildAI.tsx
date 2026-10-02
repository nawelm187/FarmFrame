import { useState } from "react";
import { useCloud } from "./lib/CloudProvider";
import { SUPABASE_KEY, SUPABASE_URL } from "./lib/config";
type S = "idle" | "loading" | { text: string } | { error: string };
/** AI interpretation of the build. It only receives facts the app already calculated, and its answer is labelled as interpretation. */
export default function BuildAI({ facts }: { facts: object }) {
  const { email } = useCloud(), [s, setS] = useState<S>("idle");
  const run = async () => {
    setS("loading");
    try {
      const { supabase } = await import("./lib/supabase"), token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) { setS({ error: "Sign in again to use AI analysis." }); return; }
      const r = await fetch(`${SUPABASE_URL}/functions/v1/build-analysis`, { method: "POST", headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY, "content-type": "application/json" }, body: JSON.stringify({ build: facts }) });
      const d = (await r.json().catch(() => ({}))) as { text?: string; error?: string };
      if (r.ok && d.text) setS({ text: d.text });
      else setS({ error: r.status === 503 ? "AI analysis is not set up on the server yet." : r.status === 401 ? "Sign in to use AI analysis." : "The AI service did not answer. Try again later." });
    } catch { setS({ error: "The AI service could not be reached." }); }
  };
  return (<section className="panel" style={{ margin: "1rem 0" }} aria-label="AI analysis">
    <div className="row"><h3>AI analysis</h3><span className="tag STALE">Interpretation</span></div>
    {!email ? <p className="muted">Sign in on the Account page to use AI analysis.</p> : <>
      {(s === "idle" || (typeof s === "object" && "error" in s)) && <button className="btn" onClick={() => void run()}>Analyze this build</button>}
      {s === "loading" && <div aria-hidden="true"><div className="sk" style={{ width: "80%" }} /><div className="sk" style={{ width: "60%" }} /></div>}
      {typeof s === "object" && "error" in s && <p className="muted">{s.error}</p>}
      {typeof s === "object" && "text" in s && <><p style={{ whiteSpace: "pre-wrap" }}>{s.text}</p><button className="btn" onClick={() => void run()}>Analyze again</button></>}
    </>}
    <p className="muted">Written by an AI from the numbers above only. It is an opinion, not data, and it can be wrong. The calculations on this page are not changed by it.</p>
  </section>);
}
