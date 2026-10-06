/** Lore written for FarmFrame. Dates for the real-world timeline come from Digital Extremes' own pages and the game's Wikipedia article (checked 5 Oct 2026). */
export interface Era { id: string; title: string; when: string; text: string; terms: string[] }
export const ERAS: Era[] = [
  { id: "orokin", title: "The Orokin Empire", when: "Ancient past", terms: ["Orokin", "Void", "Tau"], text: "The Orokin ruled the Origin System with enormous technological power, much of it built on the Void, a strange dimension they learned to draw on. They sent machines called Sentients to the distant Tau system to prepare worlds for them, and for a time the empire seemed unstoppable." },
  { id: "zariman", title: "The Zariman Incident", when: "Before the Old War ended", terms: ["Zariman Ten Zero", "Children", "Void"], text: "The Zariman Ten Zero was an Orokin colony ship lost in the Void. The adults aboard were broken by what they found there, but the children survived with strange powers. Those children are the origin of the Tenno." },
  { id: "oldwar", title: "The Old War", when: "Ancient past", terms: ["Sentients", "Tenno", "Warframes"], text: "The Sentients turned against their makers and a long war followed. The Orokin used the Tenno as warriors who command Warframes, living biomechanical suits, and the Technocyte plague that created the Infested was part of the Orokin arsenal." },
  { id: "collapse", title: "The Collapse and the long sleep", when: "Centuries ago", terms: ["Orokin", "Cryosleep", "Lotus"], text: "The empire fell and the Tenno were left in a long sleep. The Lotus, a guiding voice, watched over them while the survivors of the old order broke into rival powers." },
  { id: "awakening", title: "The Tenno awaken", when: "The game's present", terms: ["Lotus", "Grineer", "Corpus", "Infested"], text: "The Lotus wakes the Tenno to a system carved up by three powers. The Grineer are a militarised empire of clones, the Corpus a profit-driven corporation, and the Infested a living plague. The Sentients are also still out there." },
  { id: "now", title: "Newer chapters", when: "Recent updates", terms: ["Drifter", "Duviri", "Höllvania", "Hex"], text: "The Duviri Paradox follows the Drifter in the strange land of Duviri. Warframe: 1999 is set in the town of Höllvania, following the Hex, a group of people turned into Protoframes. Details keep changing with every update." },
];
export interface Mile { when: string; text: string }
export const BEGAN: Mile[] = [
  { when: "1993", text: "Digital Extremes is founded by James Schmalz in London, Ontario. The studio later co-creates the Unreal and Unreal Tournament games and works on Dark Sector and BioShock." },
  { when: "2000-2008", text: "The concept for Warframe starts in 2000, when the studio begins a game called Dark Sector. After many delays it is released in 2008, very different from the original plan." },
  { when: "2012", text: "With free-to-play games booming, the team takes its Dark Sector ideas and art and builds a new self-published project: Warframe. The closed beta starts in October 2012." },
  { when: "25 Mar 2013", text: "Open beta on PC, together with Update 7. Growth is slow at first, with modest reviews and low player counts." },
  { when: "2013-2014", text: "PlayStation 4 (15 Nov 2013, North America) and Xbox One (2 Sep 2014)." },
  { when: "2018-2021", text: "Nintendo Switch in November 2018, PlayStation 5 in November 2020 and Xbox Series X/S in April 2021. In 2021 the cinematic quest The New War brings the Sentients back; cross-platform play follows in 2022." },
  { when: "2019", text: "Nearly 50 million registered players, making it one of the studio's most successful games." },
  { when: "2024-2026", text: "iOS on 20 Feb 2024, Android in February 2026, and Nintendo Switch 2 on 25 Mar 2026." },
];
export interface Faction { name: string; art: string; tag: string; text: string; places: string[] }
export const FACTIONS: Faction[] = [
  { name: "Grineer", art: "Grineer", tag: "Clone empire", text: "A militarised empire of clones with huge fleets, galleons and fortresses. They fight the Corpus and the Tenno.", places: ["Earth", "Mars", "Ceres", "Kuva Fortress"] },
  { name: "Corpus", art: "Corpus", tag: "Corporation", text: "A profit-driven corporation that turns everything, including war, into business. Known for robotic units, Crewmen and Proxies.", places: ["Venus", "Jupiter", "Europa", "Neptune"] },
  { name: "Infested", art: "Infested", tag: "Living plague", text: "A technocyte plague that spreads through machines and flesh, turning both into twisted life.", places: ["Eris", "Deimos"] },
  { name: "Orokin", art: "Orokin", tag: "Fallen empire", text: "The golden empire of the past. Its ruins, towers and vaults still fill the system, and the Void keys they left behind are what opens Void relics today.", places: ["Void", "Lua"] },
  { name: "Sentient", art: "Sentient", tag: "Machines", text: "Machines the Orokin sent to the Tau system. They turned on their makers and started the Old War, and they adapt to the damage you deal.", places: ["Lua"] },
];
export interface Place { name: string; faction: string; text: string }
export const PLACES: Place[] = [
  { name: "Mercury", faction: "Grineer", text: "The closest planet to the Sun and the first stop for a new Tenno, held by the Grineer." },
  { name: "Venus", faction: "Corpus", text: "A terraformed world held by the Corpus. The Orb Vallis, with the town of Fortuna and Solaris United, is here." },
  { name: "Earth", faction: "Grineer", text: "Once the Orokin's green homeworld, now overgrown forests and Grineer forces. The town of Cetus and the Plains of Eidolon are on Earth." },
  { name: "Lua", faction: "Orokin", text: "Earth's moon, full of Orokin ruins and Sentient presence." },
  { name: "Mars", faction: "Grineer", text: "A desert world held by the Grineer." },
  { name: "Phobos", faction: "Corpus", text: "A Corpus-held moon of Mars." },
  { name: "Deimos", faction: "Infested", text: "The other moon of Mars, overrun by the Infested. The Cambion Drift and the Entrati family are here." },
  { name: "Ceres", faction: "Grineer", text: "A Grineer dwarf planet known for its shipyards." },
  { name: "Jupiter", faction: "Corpus", text: "A gas giant where the Corpus run floating Gas City stations." },
  { name: "Europa", faction: "Corpus", text: "An icy moon of Jupiter with Corpus facilities." },
  { name: "Saturn", faction: "Grineer", text: "A ringed giant held by the Grineer." },
  { name: "Uranus", faction: "Grineer", text: "An ice giant held by the Grineer." },
  { name: "Neptune", faction: "Corpus", text: "An ice giant held by the Corpus." },
  { name: "Pluto", faction: "Corpus", text: "A Corpus-held dwarf planet." },
  { name: "Sedna", faction: "Grineer", text: "A Grineer-held dwarf planet beyond Pluto." },
  { name: "Eris", faction: "Infested", text: "A dwarf planet overrun by the Infested." },
  { name: "Kuva Fortress", faction: "Grineer", text: "A Grineer stronghold tied to the Kuva source and the Kuva Liches." },
  { name: "Void", faction: "Orokin", text: "A dimension outside normal space where the Orokin kept their vaults. Void relics are opened with its fissures." },
  { name: "Zariman Ten Zero", faction: "Orokin", text: "The Orokin colony ship that was lost in the Void and is the origin of the Tenno." },
  { name: "Duviri", faction: "Other", text: "A strange land outside the Origin System where the Drifter's story takes place." },
  { name: "Höllvania", faction: "Other", text: "The 1999 town where the Hex, a group turned into Protoframes, lives." },
];
