import { Suspense, lazy, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Icon, Logo } from "./Icons";
import { CATS } from "./lib/catalog";
import { Skeleton } from "./pages/parts";
import usePageTitle from "./usePageTitle";
import LangBar from "./LangBar";
import { useT } from "./i18n";
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Alerts = lazy(() => import("./pages/Alerts"));
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
const Syndicates = lazy(() => import("./pages/Syndicates"));
const Lore = lazy(() => import("./pages/Lore"));
const Hub = lazy(() => import("./pages/Hub"));
const Profile = lazy(() => import("./pages/Profile"));
const Entity = lazy(() => import("./pages/Entity"));
const BuildList = lazy(() => import("./pages/Builds").then(m => ({ default: m.BuildList })));
const BuildEditor = lazy(() => import("./pages/Builds").then(m => ({ default: m.BuildEditor })));
import ReportIssue from "./ReportIssue";
const Palette = lazy(() => import("./Palette"));
const Rotations = lazy(() => import("./pages/Rotations"));
const Enemies = lazy(() => import("./pages/Enemies"));
const Resources = lazy(() => import("./pages/Resources"));
const Parts = lazy(() => import("./pages/PartSearch"));
const Patches = lazy(() => import("./pages/Patches"));
const Part = lazy(() => import("./pages/Part"));
const Mastery = lazy(() => import("./pages/Mastery"));
const KDrives = lazy(() => import("./pages/KDrives"));
const Guides = lazy(() => import("./pages/Guides"));
const Helminth = lazy(() => import("./pages/Helminth"));
const Methods = lazy(() => import("./pages/Methods"));
const GROUPS = [
  { k: "explore", hub: "/explore", pre: ["/explore", "/warframe", "/weapon", "/mod", "/companion", "/archwing", "/railjack", "/relics", "/parts", "/enemies", "/resources", "/lore", "/patches", "/kdrives", "/guides", "/helminth"], items: [["/warframes", "warframes"], ["/weapons", "weapons"], ["/mods", "mods"], ["/companions", "companions"], ["/archwings", "archwings"], ["/railjack", "railjack"], ["/relics", "relics"], ["/parts", "parts"], ["/enemies", "enemies"], ["/resources", "resources"], ["/lore", "lore"], ["/patches", "patchNotes"], ["/kdrives", "kdrives"], ["/guides", "starterGuides"], ["/helminth", "helminth"]] },
  { k: "farm", hub: "/farm", pre: ["/farm", "/methods", "/finder", "/planner", "/syndicates", "/rotations", "/fissures", "/invasions", "/alerts"], items: [["/farm-plan", "farmPlan"], ["/methods", "farmingMethods"], ["/syndicates", "syndicates"], ["/finder", "resourceFinder"], ["/planner", "planner"], ["/rotations", "rotations"], ["/fissures", "fissures"], ["/invasions", "invasions"], ["/alerts", "alerts"]] },
  { k: "plan", hub: "/plan", pre: ["/plan", "/mastery", "/roadmap", "/builds", "/build", "/tracking"], items: [["/mastery", "mastery"], ["/roadmap", "roadmap"], ["/builds", "builds"], ["/tracking", "tracking"]] },
  { k: "account", hub: "/profile", pre: ["/profile", "/sources"], items: [["/sources", "dataSources"]] },
] as const;
export default function App() {
  const [open, setOpen] = useState(false), loc = useLocation(), t = useT();
  usePageTitle();
  useEffect(() => { const t = setTimeout(() => { void import("./pages/Explore"); void import("./pages/Entity"); void import("./pages/Relics"); void import("./pages/Builds"); }, 2500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); } };
    document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h);
  }, []);
  return (
    <div className="app">
      <a className="skip" href="#main" onClick={e => { e.preventDefault(); document.getElementById("main")?.focus(); }}>{t("skip")}</a>
      <nav aria-label={t("navMain")}>
        <div className="logo"><Logo size={32} /><span className="wm">FARM<span>FRAME</span></span></div>
        <NavLink to="/" end className="tab"><Icon n="/" />{t("home")}</NavLink>
        {GROUPS.map(g => (<div key={g.k} className="grp"><Link to={g.hub} className={"tab grphead" + (g.pre.some(p => loc.pathname.startsWith(p)) ? " active" : "")}><Icon n={g.hub} />{t(g.k)}</Link>
          {g.items.map(([to, l]) => <NavLink key={to} to={to} className="sublink">{t(l)}</NavLink>)}</div>))}
      </nav>
      <main id="main" tabIndex={-1}>
        <div className="topbar"><button className="sbtn" onClick={() => setOpen(true)}>{t("search")} <kbd>Ctrl K</kbd></button><LangBar /></div>
        <Suspense fallback={<Skeleton />}><Routes>
          <Route path="/" element={<Home />} /><Route path="/fissures" element={<Fissures />} /><Route path="/invasions" element={<Invasions />} />
          <Route path="/relics" element={<Relics />} /><Route path="/finder" element={<Finder />} /><Route path="/tracking" element={<Tracking />} />
          <Route path="/enemies" element={<Enemies />} /><Route path="/resources" element={<Resources />} /><Route path="/parts" element={<Parts />} /><Route path="/sources" element={<Sources />} />{(["warframe", "weapon", "mod", "companion", "archwing", "railjack"] as const).map(c => [
            <Route key={c + "l"} path={`/${CATS[c].path}`} element={<Explore cat={c} />} />, <Route key={c} path={`/${c}/:slug`} element={<Entity cat={c} />} />])}
          <Route path="/farm/:item" element={<Farm />} /><Route path="/syndicates" element={<Syndicates />} /><Route path="/mastery" element={<Mastery />} /><Route path="/kdrives" element={<KDrives />} /><Route path="/guides" element={<Guides />} /><Route path="/helminth" element={<Helminth />} /><Route path="/methods" element={<Methods />} /><Route path="/rotations" element={<Rotations />} /><Route path="/alerts" element={<Alerts />} /><Route path="/patches" element={<Patches />} /><Route path="/item/:name" element={<Part />} /><Route path="/builds" element={<BuildList />} /><Route path="/build/:id" element={<BuildEditor />} /><Route path="/profile" element={<Profile />} /><Route path="/explore" element={<Hub />} /><Route path="/farm" element={<Hub />} /><Route path="/plan" element={<Hub />} /><Route path="/lore" element={<Lore />} /><Route path="/planner" element={<Planner />} /><Route path="/farm-plan" element={<FarmPlan />} /><Route path="/roadmap" element={<Roadmap />} /><Route path="*" element={<NotFound />} />
        </Routes></Suspense>
        <ReportIssue />
      </main>
      {open && <Suspense fallback={null}><Palette onClose={() => setOpen(false)} /></Suspense>}
    </div>
  );
}
