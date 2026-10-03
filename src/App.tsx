import { Suspense, lazy, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Icon, Logo } from "./Icons";
import { CATS } from "./lib/catalog";
import { Skeleton } from "./pages/parts";
const Home = lazy(() => import("./pages/Home"));
const Fissures = lazy(() => import("./pages/Fissures"));
const Invasions = lazy(() => import("./pages/Invasions"));
const Relics = lazy(() => import("./pages/Relics"));
const Finder = lazy(() => import("./pages/Finder"));
const Tracking = lazy(() => import("./pages/Tracking"));
const Sources = lazy(() => import("./pages/Sources"));
const Explore = lazy(() => import("./pages/Explore"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Farm = lazy(() => import("./pages/Farm"));
const FarmPlan = lazy(() => import("./pages/FarmPlan"));
const Planner = lazy(() => import("./pages/Planner"));
const Lore = lazy(() => import("./pages/Lore"));
const Hub = lazy(() => import("./pages/Hub"));
const Profile = lazy(() => import("./pages/Profile"));
const Entity = lazy(() => import("./pages/Entity"));
const BuildList = lazy(() => import("./pages/Builds").then(m => ({ default: m.BuildList })));
const BuildEditor = lazy(() => import("./pages/Builds").then(m => ({ default: m.BuildEditor })));
import ReportIssue from "./ReportIssue";
const Palette = lazy(() => import("./Palette"));
const Rotations = lazy(() => import("./pages/Rotations"));
const Patches = lazy(() => import("./pages/Patches"));
const GROUPS = [
  { label: "Explore", hub: "/explore", pre: ["/explore", "/warframe", "/weapon", "/mod", "/companion", "/archwing", "/railjack", "/relics", "/lore", "/patches"], items: [["/warframes", "Warframes"], ["/weapons", "Weapons"], ["/mods", "Mods"], ["/companions", "Companions"], ["/archwings", "Archwings"], ["/railjack", "Railjack"], ["/relics", "Relics"], ["/lore", "Lore"], ["/patches", "Patch notes"]] },
  { label: "Farm", hub: "/farm", pre: ["/farm", "/finder", "/planner", "/rotations", "/fissures", "/invasions"], items: [["/farm-plan", "Farm Plan"], ["/finder", "Resource Finder"], ["/planner", "Planner"], ["/rotations", "Rotations"], ["/fissures", "Fissures"], ["/invasions", "Invasions"]] },
  { label: "Plan", hub: "/plan", pre: ["/plan", "/roadmap", "/builds", "/build", "/tracking"], items: [["/roadmap", "Roadmap"], ["/builds", "Builds"], ["/tracking", "Tracking"]] },
  { label: "Account", hub: "/profile", pre: ["/profile", "/sources"], items: [["/sources", "Data sources"]] },
] as const;
export default function App() {
  const [open, setOpen] = useState(false), loc = useLocation();
  useEffect(() => { const t = setTimeout(() => { void import("./pages/Explore"); void import("./pages/Entity"); void import("./pages/Relics"); void import("./pages/Builds"); }, 2500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); } };
    document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h);
  }, []);
  return (
    <div className="app">
      <nav aria-label="Main">
        <div className="logo"><Logo />FARM<span>FRAME</span></div>
        <NavLink to="/" end className="tab"><Icon n="/" />Home</NavLink>
        {GROUPS.map(g => (<div key={g.label} className="grp"><Link to={g.hub} className={"tab grphead" + (g.pre.some(p => loc.pathname.startsWith(p)) ? " active" : "")}><Icon n={g.hub} />{g.label}</Link>
          {g.items.map(([to, l]) => <NavLink key={to} to={to} className="sublink">{l}</NavLink>)}</div>))}
      </nav>
      <main>
        <button className="sbtn" onClick={() => setOpen(true)}>Search relics, items, pages… or ask "where do I farm X" <kbd>Ctrl K</kbd></button>
        <Suspense fallback={<Skeleton />}><Routes>
          <Route path="/" element={<Home />} /><Route path="/fissures" element={<Fissures />} /><Route path="/invasions" element={<Invasions />} />
          <Route path="/relics" element={<Relics />} /><Route path="/finder" element={<Finder />} /><Route path="/tracking" element={<Tracking />} />
          <Route path="/sources" element={<Sources />} />{(["warframe", "weapon", "mod", "companion", "archwing", "railjack"] as const).map(c => [
            <Route key={c + "l"} path={`/${CATS[c].path}`} element={<Explore cat={c} />} />, <Route key={c} path={`/${c}/:slug`} element={<Entity cat={c} />} />])}
          <Route path="/farm/:item" element={<Farm />} /><Route path="/rotations" element={<Rotations />} /><Route path="/patches" element={<Patches />} /><Route path="/builds" element={<BuildList />} /><Route path="/build/:id" element={<BuildEditor />} /><Route path="/profile" element={<Profile />} /><Route path="/explore" element={<Hub />} /><Route path="/farm" element={<Hub />} /><Route path="/plan" element={<Hub />} /><Route path="/lore" element={<Lore />} /><Route path="/planner" element={<Planner />} /><Route path="/farm-plan" element={<FarmPlan />} /><Route path="/roadmap" element={<Roadmap />} /><Route path="*" element={<Home />} />
        </Routes></Suspense>
        <ReportIssue />
      </main>
      {open && <Suspense fallback={null}><Palette onClose={() => setOpen(false)} /></Suspense>}
    </div>
  );
}
