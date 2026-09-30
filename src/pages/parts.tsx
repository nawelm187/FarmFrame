import type { ReactNode } from "react";
import type { Rec, Status } from "../lib/data";
import { fmt, ts } from "../lib/format";
import { useNow } from "../lib/data";
export const Badge = ({ s }: { s: Status }) => <span className={"tag " + s}>{s}</span>;
export const Countdown = ({ exp, pre = "" }: { exp: string; pre?: string }) => {
  const l = ts(exp) - useNow();
  return <span className="big">{l > 0 ? pre + fmt(l) : "expired, refreshing"}</span>;
};
export const Prov = ({ rec }: { rec?: Rec }) => (
  <div className="muted">{rec?.at ? "Retrieved " + new Date(rec.at).toLocaleTimeString() : "Not retrieved"}{rec?.err ? " · " + rec.err : ""}</div>
);
export const Unavailable = ({ title, status, why, rec }: { title: string; status: Status; why: string; rec?: Rec }) => (
  <section className="panel"><div className="row"><h3>{title}</h3><Badge s={status} /></div><p className="muted">{why}</p><Prov rec={rec} /></section>
);
export const Panel = ({ title, status, rec, children }: { title: string; status: Status; rec?: Rec; children: ReactNode }) => (
  <section className="panel"><div className="row"><h3>{title}</h3><Badge s={status} /></div>{children}<Prov rec={rec} /></section>
);
