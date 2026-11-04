// Railjack ship components, written by hand because no data API lists them (checked: WarframeStat, WFCD warframe-items).
// Every line below comes from the source named in RAILJACK_SOURCE. It is NOT read from a live feed, so it can go out of date.
export const RAILJACK_SOURCE = { name: "ProGameTalk, Warframe: Railjack Components", url: "https://progametalk.com/warframe/railjack-components/", date: "2026-02-22" };
export interface Component { name: string; does: string }
export const COMPONENTS: Component[] = [
  { name: "Shield Array", does: "Sets the Railjack's maximum shield capacity and how fast shields regenerate." },
  { name: "Engines", does: "Raise movement speed and the boost multiplier." },
  { name: "Plating", does: "Raises hull health and armor durability." },
  { name: "Reactor", does: "Raises the Plexus mod capacity, the space you have to configure the ship's mods." },
];
export const HOUSES = ["Sigma", "Lavan", "Vidar", "Zetki"];
export const TIERS: { tier: string; where: string }[] = [
  { tier: "MK I", where: "Earth and Venus Proxima" },
  { tier: "MK II", where: "Saturn and Neptune Proxima" },
  { tier: "MK III", where: "Pluto and Veil Proxima" },
];
export const HOW = [
  "Components drop during Proxima missions as wreckage from enemy fighters, Crewships and elite units. The wreckage shows as purple loot and must be collected before the mission ends.",
  "More components come as end-of-mission rewards.",
  "Sigma components are not found in missions: they need clan research.",
  "A found component must be inspected and repaired at the Railjack Configure console before use. There is a limit of 30 inspected wreckage slots before you have to repair some.",
  "Railjack components cannot be traded between players.",
];
export const NOT_COVERED = "The source does not give resource costs, crafting times or exact drop chances, and says nothing about Avionics. Those are left out instead of guessed.";
