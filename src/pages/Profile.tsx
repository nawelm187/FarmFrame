import { useState } from "react";
import { Link } from "react-router-dom";
import { readBuilds } from "../lib/build";
import { useCloud } from "../lib/CloudProvider";
import { readGoals } from "../lib/goals";
import { readTracked } from "../lib/track";
const LABEL = { off: "Signed out", checking: "Checking your cloud data", conflict: "Needs your decision", synced: "Synced with your account", error: "Sync problem" } as const;
export default function Profile() {
  const c = useCloud(), [email, setEmail] = useState(""), [pw, setPw] = useState(""), [note, setNote] = useState<string | null>(null), [busy, setBusy] = useState(false);
  const go = async (up: boolean) => { setBusy(true); setNote(null); const e = await (up ? c.signUp : c.signIn)(email.trim(), pw); setBusy(false); setNote(e); };
  const b = readBuilds().length, g = readGoals().length, t = readTracked().length;
  return (<><h1>Account</h1>
    <p className="lead">Sign in to keep your goals, builds and progress on every device. Without an account everything stays in this browser.</p>
    {!c.ready ? <p className="muted">Checking session…</p> : !c.email ? (
      <form onSubmit={e => { e.preventDefault(); void go(false); }} className="panel" style={{ maxWidth: "26rem" }}>
        <div className="bar"><input aria-label="Email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%" }} /></div>
        <div className="bar"><input aria-label="Password" type="password" autoComplete="current-password" placeholder="Password (6+ characters)" value={pw} onChange={e => setPw(e.target.value)} required minLength={6} style={{ width: "100%" }} /></div>
        <div className="bar"><button className="btn" type="submit" disabled={busy}>Sign in</button><button className="btn" type="button" disabled={busy} onClick={() => void go(true)}>Create account</button></div>
        {note && <p className="muted" role="status">{note}</p>}</form>
    ) : (<section className="panel" style={{ maxWidth: "34rem" }}>
      <div className="row"><h3>{c.email}</h3><button className="btn" onClick={() => void c.signOut()}>Sign out</button></div>
      <p><span className={"tag " + (c.sync === "synced" ? "FRESH" : c.sync === "error" ? "ERROR" : "STALE")}>{LABEL[c.sync]}</span></p>
      {c.sync === "conflict" && <><p>This device and your account both have saved data, and they differ. Choose which to keep. The other one is overwritten.</p>
        <div className="bar"><button className="btn" onClick={() => void c.resolve("cloud")}>Use my account data</button><button className="btn" onClick={() => void c.resolve("device")}>Keep this device's data</button></div></>}
      {c.sync === "error" && <><p className="muted">{c.err}</p><p className="muted">If it says the table does not exist, run the SQL in <code>supabase/schema.sql</code> in the Supabase SQL editor.</p><button className="btn" onClick={c.retry}>Retry sync</button></>}
      {c.sync === "synced" && <p className="muted">Changes are saved to your account automatically within a few seconds.</p>}
      <p className="muted">Only you can read or change your data (row level security).</p></section>)}
    <h2>Your data</h2>
    <p><Link to="/roadmap">{g} goal{g === 1 ? "" : "s"}</Link> · <Link to="/builds">{b} build{b === 1 ? "" : "s"}</Link> · <Link to="/tracking">{t} tracked item{t === 1 ? "" : "s"}</Link></p></>);
}
