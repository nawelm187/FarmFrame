import { Link, useLocation } from "react-router-dom";
import { Icon } from "../Icons";
import PageArt, { hasArt } from "../PageArt";
import { en } from "../i18n/en";
import { useT, type Key } from "../i18n";
type Hub = { title: Key; lead: Key; links: [string, Key, Key][] };
const HUBS: Record<string, Hub> = {
  explore: { title: "explore", lead: "hubExploreLead", links: [
    ["/warframes", "warframes", "hubWarframes"], ["/weapons", "weapons", "hubWeapons"], ["/mods", "mods", "hubMods"],
    ["/companions", "companions", "hubCompanions"], ["/archwings", "archwings", "hubArchwings"], ["/railjack", "railjack", "hubRailjack"], ["/resources", "resources", "hubResources"], ["/enemies", "enemies", "hubEnemies"], ["/parts", "parts", "hubParts"],
    ["/relics", "relics", "hubRelics"], ["/lore", "lore", "hubLore"], ["/patches", "patchNotes", "hubPatches"], ["/kdrives", "kdrives", "hubKdrives"], ["/guides", "starterGuides", "hubGuides"], ["/helminth", "helminth", "hubHelminth"]] },
  farm: { title: "farm", lead: "hubFarmLead", links: [
    ["/farm-plan", "farmPlan", "hubFarmPlan"], ["/methods", "farmingMethods", "hubMethods"], ["/finder", "resourceFinder", "hubFinder"], ["/syndicates", "syndicates", "hubSyndicates"], ["/planner", "planner", "hubPlanner"], ["/rotations", "rotations", "hubRotations"], ["/alerts", "alerts", "hubAlerts"], ["/fissures", "fissures", "hubFissures"], ["/invasions", "invasions", "hubInvasions"]] },
  plan: { title: "plan", lead: "hubPlanLead", links: [
    ["/mastery", "mastery", "hubMastery"], ["/roadmap", "roadmap", "hubRoadmap"], ["/builds", "builds", "hubBuilds"], ["/tracking", "tracking", "hubTracking"]] },
};
/** The picture of a tile is looked up by the English name of the page, which is the English text of the key. */
export default function Hub() {
  const tr = useT(), h = HUBS[useLocation().pathname.slice(1)] ?? HUBS.explore;
  return (<><h1>{tr(h.title)}</h1><p className="lead">{tr(h.lead)}</p>
    <div className="hubgrid">{h.links.map(([to, k, d]) => { const art = en[k]; return <Link key={to} to={to} className="hubtile"><span className="hubart"><PageArt name={art} size={40} />{!hasArt(art) && <Icon n={to} />}</span><span><b>{tr(k)}</b><span className="muted">{tr(d)}</span></span></Link>; })}</div></>);
}
