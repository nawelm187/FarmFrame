import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Optional first-visit intent picker. It only routes the visitor; it never creates progress or assumes ownership.
const KEY = "ff.onboarding";
const INTENTS = [
  ["new", "I'm new to Warframe", "/warframes"],
  ["returning", "I'm returning to Warframe", "/planner"],
  ["farm", "I want to farm something", "/finder"],
  ["goal", "I want to complete a goal", "/roadmap"],
  ["build", "I want to create a build", "/builds"],
  ["explore", "Just explore", ""],
] as const;
const seen = () => { try { return !!localStorage.getItem(KEY); } catch { return true; } };
const mark = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* storage unavailable: it will simply show again */ } };
export default function Onboarding() {
  const [open, setOpen] = useState(() => !seen()), nav = useNavigate();
  if (!open) return null;
  const pick = (id: string, to: string) => { mark(id); setOpen(false); if (to) nav(to); };
  return (
    <section className="panel onb" aria-label="Welcome">
      <div className="row"><h2>What do you want to do?</h2><button className="btn" onClick={() => pick("skipped", "")}>Skip</button></div>
      <p className="muted">Optional. It only picks where to start; nothing is saved about your progress, and search works without it.</p>
      <div className="chips">{INTENTS.map(([id, l, to]) => <button key={id} className="relicchip" onClick={() => pick(id, to)}>{l}</button>)}</div>
    </section>
  );
}
