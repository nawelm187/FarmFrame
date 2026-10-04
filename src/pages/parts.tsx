import PageArt from "../PageArt";
import type { ReactNode } from "react";
import type { Rec, Status } from "../lib/data";
import { fmt, ts } from "../lib/format";
import { retry, useNow } from "../lib/data";
export const Badge = ({ s }: { s: Status | "CALCULATED" }) => <span className={"tag " + s} title={s === "CALCULATED" ? "Worked out from the last verified end time and the fixed cycle length; replaced by live data as soon as it arrives" : undefined}>{s}</span>;
export const Countdown = ({ exp, pre = "" }: { exp: string; pre?: string }) => {
  const l = ts(exp) - useNow();
  return <span className="big">{l > 0 ? pre + fmt(l) : "expired, refreshing"}</span>;
};
export const Prov = ({ rec }: { rec?: Rec }) => (
  <div className="muted">{rec?.at ? "Retrieved " + new Date(rec.at).toLocaleTimeString() : "Not retrieved"}{rec?.err ? " · " + rec.err : ""}</div>
);
export const Skeleton = () => <div aria-hidden="true"><div className="sk" style={{ width: "70%" }} /><div className="sk" style={{ width: "45%" }} /></div>;
export const Unavailable = ({ title, status, why, rec, note }: { title: string; status: Status; why: string; rec?: Rec; note?: string }) => (
  <section className="panel" aria-busy={status === "LOADING"}><div className="row"><h3><PageArt name={title} />{title}</h3><Badge s={status} /></div>
    {status === "LOADING" ? <><Skeleton />{note && <p className="muted">{note}</p>}</> : <p className="muted">{why}</p>}
    <Prov rec={rec} />{rec && status !== "LOADING" && status !== "FRESH" && <button className="btn" onClick={() => retry(rec.id)}>Retry</button>}</section>
);
export const Panel = ({ title, status, rec, children }: { title: string; status: Status | "CALCULATED"; rec?: Rec; children: ReactNode }) => (
  <section className="panel"><div className="row"><h3><PageArt name={title} />{title}</h3><Badge s={status} /></div>{children}<Prov rec={rec} /></section>
);
