import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Palette from "./Palette";
import Home from "./pages/Home";
import Fissures from "./pages/Fissures";
import Invasions from "./pages/Invasions";
import Relics from "./pages/Relics";
import Finder from "./pages/Finder";
import Tracking from "./pages/Tracking";
import Sources from "./pages/Sources";
import Explore from "./pages/Explore";
import Roadmap from "./pages/Roadmap";
import Entity from "./pages/Entity";
const NAV = [["/", "Home"], ["/roadmap", "Roadmap"], ["/warframes", "Warframes"], ["/weapons", "Weapons"], ["/mods", "Mods"], ["/relics", "Relics"], ["/fissures", "Fissures"], ["/invasions", "Invasions"], ["/finder", "Finder"], ["/tracking", "Tracking"], ["/sources", "Sources"]] as const;
export default function App() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); } };
    document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h);
  }, []);
  return (
    <div className="app">
      <nav aria-label="Main">
        <div className="logo">FARM<span>FRAME</span></div>
        {NAV.map(([to, l]) => <NavLink key={to} to={to} end={to === "/"}>{l}</NavLink>)}
      </nav>
      <main>
        <button className="sbtn" onClick={() => setOpen(true)}>Search relics, items, pages… or ask "where do I farm X" <kbd>Ctrl K</kbd></button>
        <Routes>
          <Route path="/" element={<Home />} /><Route path="/fissures" element={<Fissures />} /><Route path="/invasions" element={<Invasions />} />
          <Route path="/relics" element={<Relics />} /><Route path="/finder" element={<Finder />} /><Route path="/tracking" element={<Tracking />} />
          <Route path="/sources" element={<Sources />} />{(["warframe", "weapon", "mod"] as const).map(c => [
            <Route key={c + "l"} path={`/${c}s`} element={<Explore cat={c} />} />, <Route key={c} path={`/${c}/:slug`} element={<Entity cat={c} />} />])}
          <Route path="/roadmap" element={<Roadmap />} /><Route path="*" element={<Home />} />
        </Routes>
      </main>
      {open && <Palette onClose={() => setOpen(false)} />}
    </div>
  );
}
