import { useRefreshAt, useWorld } from "./lib/data";
import { ts } from "./lib/format";
import { baroMatches, isExp, traderState, type Trader } from "./lib/planner";
import { useNeeded } from "./lib/useNeeded";
import { Credits } from "./Money";
import Npc from "./Npc";
import VendorStock from "./VendorStock";
import { Countdown, Panel, Unavailable } from "./pages/parts";
import { useT } from "./i18n";
const isTrader = (d: unknown): d is Trader => isExp(d);
/** Baro Ki'Teer (Void Trader): here or coming, where, until when, his full stock with prices, and which items advance what you still need. */
export default function Baro({ full = false }: { full?: boolean }) {
  const { data, status, rec } = useWorld("voidTrader", isTrader), needed = useNeeded(), t = useT();
  const now = Date.now(), st = data ? traderState(data, now) : "unknown", act = data?.activation ? ts(data.activation) : NaN, end = data ? ts(data.expiry) : NaN;
  // Re-request when his visit starts or ends. If the visit is over, ask again about 30 seconds after the last answer: the source may already know his next arrival.
  useRefreshAt("voidTrader", !data ? null : st === "gone" ? (rec?.at ?? now) + 30_000 : st === "here" ? end : Number.isFinite(act) ? act : null);
  const T = t("baroRole");
  if (!data) return <Unavailable title={T} art="Void Trader" status={status} why={t("noVerified")} rec={rec} />;
  // Just refreshed and still over: say so instead of loading forever.
  const justAsked = !!rec?.at && now - rec.at < 20_000;
  if (st === "gone" && justAsked) return <Unavailable title={T} art="Void Trader" status="LOADING" why="" note={t("baroUpdating")} rec={rec} />;
  if (st === "gone") return <Panel title={T} art="Void Trader" status={status} rec={rec}><Npc name="Baro Ki'Teer" role={t("baroRole")} /><b>{t("baroGone")}</b><div className="muted">{t("baroGoneNote", { date: new Date(data.expiry).toLocaleString() })}</div></Panel>;
  if (st === "coming") return <Panel title={T} art="Void Trader" status={status} rec={rec}><Npc name="Baro Ki'Teer" role={t("baroRole")} /><b>{t("baroSoon")}</b>{data.location && <span className="muted"> · {t("baroArrivesAt", { place: data.location })}</span>}{data.activation && <div><Countdown exp={data.activation} pre={t("cdArrives") + " "} /></div>}
    {data.activation && <div className="muted">{new Date(data.activation).toLocaleString()}</div>}</Panel>;
  const hit = baroMatches(data, needed, now), inv = [...(data.inventory ?? [])].sort((a, b) => Number(needed.has(String(b.item).toLowerCase())) - Number(needed.has(String(a.item).toLowerCase())));
  return <Panel title={T} art="Void Trader" status={status} rec={rec}><Npc name="Baro Ki'Teer" role={t("baroRole")} />
    <p><span className="tag FRESH">{t("baroNow")}</span> <b>{data.location ?? t("baroNoLoc")}</b></p>
    <div><Countdown exp={data.expiry} pre={t("cdLeaves") + " "} /></div>
    {hit.length ? <p><b>{t("baroNeed")}</b> {hit.map((i, k) => <span key={i.item}>{k > 0 && ", "}{i.item}{i.ducats != null && <> ({i.ducats} {t("ducats")}, {i.credits != null ? <Credits n={i.credits} /> : t("unkCredits")})</>}</span>)}</p>
      : <p className="muted">{t("baroNoMatch")}</p>}
    {inv.length > 0 ? <details open={full}><summary>{t("baroSelling", { n: inv.length })}</summary><VendorStock items={inv.map(i => ({ name: String(i.item ?? t("unknownItem")), ducats: i.ducats ?? undefined, credits: i.credits ?? undefined }))} needed={needed} /></details>
      : <p className="muted">{t("baroNoStock")}</p>}</Panel>;
}
