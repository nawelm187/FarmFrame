import PageArt from "../PageArt";
import type { ReactNode } from "react";
import type { Rec, Status } from "../lib/data";
import { fmt, ts } from "../lib/format";
import { provLine } from "../lib/freshness";
import { retry, useNow } from "../lib/data";
import { useT } from "../i18n";
import { ST } from "../lib/statusKey";
export { ST };
/** The status word is translated; the class name keeps the English status, which is what the colours are keyed on. */
export const Badge = ({ s }: { s: Status | "CALCULATED" }) => { const t = useT(); return <span className={"tag " + s} title={s === "CALCULATED" ? t("badgeCalc") : undefined}>{t(ST[s])}</span>; };
export const Countdown = ({ exp, pre = "" }: { exp: string; pre?: string }) => {
  const l = ts(exp) - useNow(), t = useT();
  return <span className="big">{l > 0 ? pre + fmt(l) : t("expiredRefresh")}</span>;
};
export const Prov = ({ rec }: { rec?: Rec }) => (
  <div className="muted">{provLine(rec)}</div>
);
export const Skeleton = () => <div aria-hidden="true"><div className="sk" style={{ width: "70%" }} /><div className="sk" style={{ width: "45%" }} /></div>;
/** `art` is the English name the picture is looked up by; `title` may be translated. */
export const Unavailable = ({ title, art, status, why, rec, note }: { title: string; art?: string; status: Status; why: string; rec?: Rec; note?: string }) => { const t = useT(); return (
  <section className="panel" aria-busy={status === "LOADING"}><div className="row"><h3><PageArt name={art ?? title} />{title}</h3><Badge s={status} /></div>
    {status === "LOADING" ? <><Skeleton />{note && <p className="muted">{note}</p>}</> : <p className="muted">{why}</p>}
    <Prov rec={rec} />{rec && status !== "LOADING" && status !== "FRESH" && <button className="btn" onClick={() => retry(rec.id)}>{t("retry")}</button>}</section>
); };
export const Panel = ({ title, art, status, rec, children }: { title: string; art?: string; status: Status | "CALCULATED"; rec?: Rec; children: ReactNode }) => (
  <section className="panel"><div className="row"><h3><PageArt name={art ?? title} />{title}</h3><Badge s={status} /></div>{children}<Prov rec={rec} /></section>
);
