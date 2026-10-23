import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { readBuilds } from "../lib/build";
import { useCloud } from "../lib/CloudProvider";
import { readGoals } from "../lib/goals";
import { readTracked, trackCounts } from "../lib/track";
import { applySnap, cleanImport, snapshot } from "../lib/cloud";
import { StatTile } from "../ui";
import { tp, useT } from "../i18n";
const LABEL = { off: "stOff", checking: "stChecking", conflict: "stConflict", synced: "stSynced", error: "stSyncErr" } as const;
export default function Profile() {
  const tx = useT(), c = useCloud(), [email, setEmail] = useState(""), [pw, setPw] = useState(""), [note, setNote] = useState<string | null>(null), [busy, setBusy] = useState(false), [usePw, setUsePw] = useState(false);
  const go = async (up: boolean) => { setBusy(true); setNote(null); const e = await (up ? c.signUp : c.signIn)(email.trim(), pw); setBusy(false); setNote(e); };
  const reset = async () => { if (!email.trim()) { setNote(tx("prEmailFirst")); return; } setBusy(true); setNote(null); setNote(await c.resetPassword(email.trim())); setBusy(false); };
  const [np, setNp] = useState(""), [pnote, setPnote] = useState<string | null>(null);
  const savePw = async () => { setBusy(true); const e = await c.setPassword(np); setBusy(false); setPnote(e ?? tx("prPwSaved")); if (!e) setNp(""); };
  const link = async () => { setBusy(true); setNote(null); setNote(await c.signInLink(email.trim())); setBusy(false); };
  const b = readBuilds().length, g = readGoals().length, tr = readTracked(), t = tr.length, tc = trackCounts(tr), file = useRef<HTMLInputElement>(null), [msg, setMsg] = useState<string | null>(null);
  const exportData = () => { const u = URL.createObjectURL(new Blob([JSON.stringify(snapshot(), null, 1)], { type: "application/json" })), a = document.createElement("a"); a.href = u; a.download = "farmframe-data.json"; a.click(); URL.revokeObjectURL(u); setMsg(tx("prExported")); };
  const importData = async (f?: File) => { if (!f) return; try { const d = cleanImport(JSON.parse(await f.text())); if (!d) { setMsg(tx("prNoData")); return; } if (!window.confirm(tx("prConfirmReplace"))) return; applySnap(d); setMsg(tx("prImported")); setTimeout(() => location.reload(), 400); } catch { setMsg(tx("prBadFile")); } };
  const initial = (c.email ?? "?").charAt(0).toUpperCase();
  return (<><h1>{tx("account")}</h1>
    <section className="hud acct" aria-label={tx("prYourAccount")}><span className={"avatar" + (c.email ? " on" : "")} aria-hidden="true">{c.email ? initial : "?"}</span>
      <div><h2>{c.email ?? tx("prGuest")}</h2>
        <div className="muted">{c.email ? <span className={"tag " + (c.sync === "synced" ? "FRESH" : c.sync === "error" ? "ERROR" : "STALE")}>{tx(LABEL[c.sync])}</span> : tx("prLocalOnly")}</div>
        <div className="stats"><Link className="statlink" to="/roadmap"><StatTile n={g} label={tp("prGoalLbl", g)} tone="gold" /></Link><Link className="statlink" to="/builds"><StatTile n={b} label={tp("prBuildLbl", b)} tone="acc" /></Link><Link className="statlink" to="/tracking"><StatTile n={`${tc.done}/${t}`} label={tx("prTrackedDone")} /></Link></div></div></section>
    <div className="acctgrid">
    {!c.ready ? <p className="muted">{tx("prChecking")}</p> : !c.email ? (
      <form onSubmit={e => { e.preventDefault(); void (usePw ? go(false) : link()); }} className="gcard acctcard">
        <h3>{tx("prSignIn")}</h3>
        <ul className="benefits"><li>{tx("prBen1")}</li><li>{tx("prBen2")}</li><li>{tx("prBen3")}</li></ul>
        <div className="bar"><input aria-label={tx("prEmail")} type="email" autoComplete="email" placeholder={tx("prEmail")} value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%" }} /></div>
        {usePw && <div className="bar"><input aria-label={tx("prPassword")} type="password" autoComplete="current-password" placeholder={tx("prPwPh")} value={pw} onChange={e => setPw(e.target.value)} required minLength={6} style={{ width: "100%" }} /></div>}
        <div className="bar">{usePw
          ? <><button className="btn" type="submit" disabled={busy}>{tx("prSignInBtn")}</button><button className="btn" type="button" disabled={busy || pw.length < 6 || !email.trim()} onClick={() => void go(true)}>{tx("prCreate")}</button></>
          : <button className="btn primary" type="submit" disabled={busy}>{tx("prLink")}</button>}</div>
        <p className="muted"><button type="button" className="linkbtn" onClick={() => { setUsePw(!usePw); setNote(null); }}>{usePw ? tx("prUseLink") : tx("prHavePw")}</button>{" "}<button type="button" className="linkbtn" disabled={busy} onClick={() => void reset()}>{tx("prReset")}</button></p>
        {note && <p className="muted" role="status">{note}</p>}</form>
    ) : (<section className="gcard acctcard">
      {c.recovery && <p className="gold" role="status">{tx("prRecovery")}</p>}
      <h3>{tx("prSync")}</h3>
      {c.sync === "conflict" && <><p>{tx("prConflict")}</p>
        <div className="bar"><button className="btn" onClick={() => void c.resolve("cloud")}>{tx("prUseCloud")}</button><button className="btn" onClick={() => void c.resolve("device")}>{tx("prKeepDevice")}</button></div></>}
      {c.sync === "error" && <><p className="muted">{c.err}</p><p className="muted">{tx("prSqlA")} <code>supabase/schema.sql</code> {tx("prSqlB")}</p><button className="btn" onClick={c.retry}>{tx("prRetry")}</button></>}
      {c.sync === "synced" && <p className="muted">{tx("prAuto")}</p>}
      <p className="muted">{tx("prRls")}</p>
      <h3>{tx("prPassword")}</h3><p className="muted">{tx("prPwHelp")}</p>
      <div className="bar"><input aria-label={tx("prNewPw")} type="password" autoComplete="new-password" placeholder={tx("prNewPwPh")} value={np} onChange={e => setNp(e.target.value)} minLength={6} /><button className="btn" disabled={busy || np.length < 6} onClick={() => void savePw()}>{tx("prSavePw")}</button></div>
      {pnote && <p className="muted" role="status">{pnote}</p>}
      <button className="btn" onClick={() => void c.signOut()}>{tx("prSignOut")}</button></section>)}
    <section className="gcard acctcard"><h3>{tx("prYourData")}</h3><p className="muted">{tx("prDataHelp")}</p>
      <div className="bar"><button className="btn" onClick={exportData}>{tx("prExport")}</button><button className="btn" onClick={() => file.current?.click()}>{tx("prImport")}</button>
        <input ref={file} type="file" accept="application/json,.json" hidden aria-label={tx("prImportAria")} onChange={e => { void importData(e.target.files?.[0]); e.target.value = ""; }} /></div>
      {msg && <p className="muted" role="status">{msg}</p>}</section></div></>);
}
