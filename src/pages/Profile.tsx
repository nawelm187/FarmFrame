import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { readBuilds } from "../lib/build";
import { useCloud } from "../lib/CloudProvider";
import { readGoals } from "../lib/goals";
import { readTracked, trackCounts } from "../lib/track";
import { applySnap, cleanImport, snapshot } from "../lib/cloud";
import { StatTile } from "../ui";
const LABEL = { off: "Signed out", checking: "Checking your cloud data", conflict: "Needs your decision", synced: "Synced with your account", error: "Sync problem" } as const;
export default function Profile() {
  const c = useCloud(), [email, setEmail] = useState(""), [pw, setPw] = useState(""), [note, setNote] = useState<string | null>(null), [busy, setBusy] = useState(false), [usePw, setUsePw] = useState(false);
  const go = async (up: boolean) => { setBusy(true); setNote(null); const e = await (up ? c.signUp : c.signIn)(email.trim(), pw); setBusy(false); setNote(e); };
  const link = async () => { setBusy(true); setNote(null); setNote(await c.signInLink(email.trim())); setBusy(false); };
  const b = readBuilds().length, g = readGoals().length, tr = readTracked(), t = tr.length, tc = trackCounts(tr), file = useRef<HTMLInputElement>(null), [msg, setMsg] = useState<string | null>(null);
  const exportData = () => { const u = URL.createObjectURL(new Blob([JSON.stringify(snapshot(), null, 1)], { type: "application/json" })), a = document.createElement("a"); a.href = u; a.download = "farmframe-data.json"; a.click(); URL.revokeObjectURL(u); setMsg("Exported farmframe-data.json."); };
  const importData = async (f?: File) => { if (!f) return; try { const d = cleanImport(JSON.parse(await f.text())); if (!d) { setMsg("That file has no FarmFrame data."); return; } if (!window.confirm("Replace the data in this browser with the file's data?")) return; applySnap(d); setMsg("Imported. Reloading…"); setTimeout(() => location.reload(), 400); } catch { setMsg("That file could not be read."); } };
  const initial = (c.email ?? "?").charAt(0).toUpperCase();
  return (<><h1>Account</h1>
    <section className="hud acct" aria-label="Your account"><span className={"avatar" + (c.email ? " on" : "")} aria-hidden="true">{c.email ? initial : "?"}</span>
      <div><h2>{c.email ?? "Playing as a guest"}</h2>
        <div className="muted">{c.email ? <span className={"tag " + (c.sync === "synced" ? "FRESH" : c.sync === "error" ? "ERROR" : "STALE")}>{LABEL[c.sync]}</span> : "Everything is stored in this browser only."}</div>
        <div className="stats"><Link className="statlink" to="/roadmap"><StatTile n={g} label={g === 1 ? "Goal" : "Goals"} tone="gold" /></Link><Link className="statlink" to="/builds"><StatTile n={b} label={b === 1 ? "Build" : "Builds"} tone="acc" /></Link><Link className="statlink" to="/tracking"><StatTile n={`${tc.done}/${t}`} label="Tracked done" /></Link></div></div></section>
    <div className="acctgrid">
    {!c.ready ? <p className="muted">Checking session…</p> : !c.email ? (
      <form onSubmit={e => { e.preventDefault(); void (usePw ? go(false) : link()); }} className="gcard acctcard">
        <h3>Sign in to sync</h3>
        <ul className="benefits"><li>Your goals, builds and progress on every device</li><li>No password needed: a one-time link arrives by email</li><li>Only you can read your data</li></ul>
        <div className="bar"><input aria-label="Email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%" }} /></div>
        {usePw && <div className="bar"><input aria-label="Password" type="password" autoComplete="current-password" placeholder="Password (6+ characters)" value={pw} onChange={e => setPw(e.target.value)} required minLength={6} style={{ width: "100%" }} /></div>}
        <div className="bar">{usePw
          ? <><button className="btn" type="submit" disabled={busy}>Sign in</button><button className="btn" type="button" disabled={busy || pw.length < 6 || !email.trim()} onClick={() => void go(true)}>Create account</button></>
          : <button className="btn primary" type="submit" disabled={busy}>Email me a sign-in link</button>}</div>
        <p className="muted"><button type="button" className="linkbtn" onClick={() => { setUsePw(!usePw); setNote(null); }}>{usePw ? "Use an email link instead" : "I already have a password"}</button></p>
        {note && <p className="muted" role="status">{note}</p>}</form>
    ) : (<section className="gcard acctcard">
      <h3>Sync</h3>
      {c.sync === "conflict" && <><p>This device and your account both have saved data, and they differ. Choose which to keep. The other one is overwritten.</p>
        <div className="bar"><button className="btn" onClick={() => void c.resolve("cloud")}>Use my account data</button><button className="btn" onClick={() => void c.resolve("device")}>Keep this device's data</button></div></>}
      {c.sync === "error" && <><p className="muted">{c.err}</p><p className="muted">If it says the table does not exist, run the SQL in <code>supabase/schema.sql</code> in the Supabase SQL editor.</p><button className="btn" onClick={c.retry}>Retry sync</button></>}
      {c.sync === "synced" && <p className="muted">Changes are saved to your account automatically within a few seconds.</p>}
      <p className="muted">Only you can read or change your data (row level security).</p><button className="btn" onClick={() => void c.signOut()}>Sign out</button></section>)}
    <section className="gcard acctcard"><h3>Your data</h3><p className="muted">Download a copy of your goals, builds and progress, or restore one. Works with or without an account.</p>
      <div className="bar"><button className="btn" onClick={exportData}>Export data</button><button className="btn" onClick={() => file.current?.click()}>Import data</button>
        <input ref={file} type="file" accept="application/json,.json" hidden aria-label="Import data file" onChange={e => { void importData(e.target.files?.[0]); e.target.value = ""; }} /></div>
      {msg && <p className="muted" role="status">{msg}</p>}</section></div></>);
}
