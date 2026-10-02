import { Link, useLocation } from "react-router-dom";
import { Icon } from "../Icons";
type Hub = { title: string; lead: string; links: [string, string, string][] };
const HUBS: Record<string, Hub> = {
  explore: { title: "Explore", lead: "Everything in the game, with its data.", links: [
    ["/warframes", "Warframes", "Abilities, stats, parts and sets"], ["/weapons", "Weapons", "Damage, crit, status and more"], ["/mods", "Mods", "Cards with drain, effects and prices"],
    ["/companions", "Companions", "Sentinels, beasts and more"], ["/archwings", "Archwings", "Archwings and their weapons"], ["/railjack", "Railjack", "Railjack mods"],
    ["/relics", "Relics", "Search by relic or by item"], ["/lore", "Lore", "Comics and codex pages"]] },
  farm: { title: "Farm", lead: "Where and when to get what you need.", links: [
    ["/farm-plan", "Farm Plan", "Exact relics, fissures and refinement for your goals"], ["/finder", "Resource Finder", "Where any item drops"], ["/planner", "Planner", "Daily and weekly activities that matter to you"], ["/fissures", "Fissures", "Live Void Fissures"], ["/invasions", "Invasions", "Live invasion rewards"]] },
  plan: { title: "Plan", lead: "Your goals, builds and progress.", links: [
    ["/roadmap", "Roadmap", "Goals, checklist and resources"], ["/builds", "Builds", "Mods, Forma, arcanes and statistics"], ["/tracking", "Tracking", "Items you are collecting"]] },
};
export default function Hub() {
  const h = HUBS[useLocation().pathname.slice(1)] ?? HUBS.explore;
  return (<><h1>{h.title}</h1><p className="lead">{h.lead}</p>
    <div className="hubgrid">{h.links.map(([to, label, d]) => <Link key={to} to={to} className="hubtile"><Icon n={to} /><span><b>{label}</b><span className="muted">{d}</span></span></Link>)}</div></>);
}
