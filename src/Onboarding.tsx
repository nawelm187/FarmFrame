import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "./i18n";
// Optional first-visit intent picker. It only routes the visitor; it never creates progress or assumes ownership.
const KEY = "ff.onboarding";
const INTENTS = [
  ["new", "onbNew", "/warframes"],
  ["returning", "onbReturning", "/planner"],
  ["farm", "onbFarm", "/finder"],
  ["goal", "onbGoal", "/roadmap"],
  ["build", "onbBuild", "/builds"],
  ["explore", "onbExplore", ""],
] as const;
const seen = () => { try { return !!localStorage.getItem(KEY); } catch { return true; } };
const mark = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* storage unavailable: it will simply show again */ } };
export default function Onboarding() {
  const [open, setOpen] = useState(() => !seen()), nav = useNavigate(), t = useT();
  if (!open) return null;
  const pick = (id: string, to: string) => { mark(id); setOpen(false); if (to) nav(to); };
  return (
    <section className="panel onb" aria-label={t("onbWelcome")}>
      <div className="row"><h2>{t("onbTitle")}</h2><button className="btn" onClick={() => pick("skipped", "")}>{t("onbSkip")}</button></div>
      <p className="muted">{t("onbNote")}</p>
      <div className="chips">{INTENTS.map(([id, l, to]) => <button key={id} className="relicchip" onClick={() => pick(id, to)}>{t(l)}</button>)}</div>
    </section>
  );
}
