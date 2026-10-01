import { Suspense, lazy, useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
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
const Planner = lazy(() => import("./pages/Planner"));
const Profile = lazy(() => import("./pages/Profile"));
const Entity = lazy(() => import("./pages/Entity"));
const BuildList = lazy(() => import("./pages/Builds").then(m => ({ default: m.BuildList })));
const BuildEditor = lazy(() => import("./pages/Builds").then(m => ({ default: m.BuildEditor })));
const Palette = lazy(() => import("./Palette"));
const NAV = [["/", "Home"], ["/roadmap", "Roadmap"], ["/planner", "Planner"], ["/builds", "Builds"], ["/warframes", "Warframes"], ["/weapons", "Weapons"], ["/mods", "Mods"], ["/companions", "Companions"], ["/archwings", "Archwings"], ["/railjack", "Railjack"], ["/relics", "Relics"], ["/fissures", "Fissures"], ["/invasions", "Invasions"], ["/finder", "Finder"], ["/tracking", "Tracking"], ["/sources", "Sources"], ["/profile", "Account"]] as const;
export default function App() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); } };
    document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h);
  }, []);
  return (
    <div className="app">
      <nav aria-label="Main">
        <div className="logo"><Logo />FARM<span>FRAME</span></div>
        {NAV.map(([to, l]) => <NavLink key={to} to={to} end={to === "/"}><Icon n={to} />{l}</NavLink>)}
      </nav>
      <main>
        <button className="sbtn" onClick={() => setOpen(true)}>Search relics, items, pages… or ask "where do I farm X" <kbd>Ctrl K</kbd></button>
        <Suspense fallback={<Skeleton />}><Routes>
          <Route path="/" element={<Home />} /><Route path="/fissures" element={<Fissures />} /><Route path="/invasions" element={<Invasions />} />
          <Route path="/relics" element={<Relics />} /><Route path="/finder" element={<Finder />} /><Route path="/tracking" element={<Tracking />} />
          <Route path="/sources" element={<Sources />} />{(["warframe", "weapon", "mod", "companion", "archwing", "railjack"] as const).map(c => [
            <Route key={c + "l"} path={`/${CATS[c].path}`} element={<Explore cat={c} />} />, <Route key={c} path={`/${c}/:slug`} element={<Entity cat={c} />} />])}
          <Route path="/farm/:item" element={<Farm />} /><Route path="/builds" element={<BuildList />} /><Route path="/build/:id" element={<BuildEditor />} /><Route path="/profile" element={<Profile />} /><Route path="/planner" element={<Planner />} /><Route path="/roadmap" element={<Roadmap />} /><Route path="*" element={<Home />} />
        </Routes></Suspense>
      </main>
      {open && <Suspense fallback={null}><Palette onClose={() => setOpen(false)} /></Suspense>}
    </div>
  );
}
