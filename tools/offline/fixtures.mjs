// SYNTHETIC data in the WFCD (warframe-items) format, only to exercise screens when there is no network. Names are real game names;
// numbers (drain, ranks, effects) are made up for layout testing and must never be read as game data.
const POLS = ["madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "umbra"], RAR = ["Common", "Uncommon", "Rare", "Legendary"];
const lv = (max, f) => Array.from({ length: max + 1 }, (_, r) => ({ stats: f(r) }));
const mod = (name, i, o = {}) => { const max = o.max ?? 5 + (i % 6); return { name, uniqueName: "/Lotus/Upgrades/Mods/" + name.replace(/\W/g, ""), polarity: o.pol ?? POLS[i % POLS.length], rarity: o.rar ?? RAR[i % 4], baseDrain: o.drain ?? 2 + (i % 7), fusionLimit: max, compatName: o.compat ?? "Warframe", type: o.type ?? "Warframe Mod", category: "Mods", description: o.desc ?? "", levelStats: lv(max, r => o.fx ?? [`+${(r + 1) * 10}% ${["Health", "Shields", "Armor", "Ability Efficiency", "Energy Max", "Sprint Speed"][i % 6]}`]), tradable: true, imageName: name.toLowerCase().replace(/\W+/g, "-") + ".png", ...(o.extra ?? {}) }; };
const names = ["Vitality", "Redirection", "Steel Fiber", "Flow", "Streamline", "Continuity", "Intensify", "Stretch", "Rush", "Quick Thinking", "Natural Talent", "Fleeting Expertise", "Blind Rage", "Narrow Minded", "Transient Fortitude", "Primed Continuity", "Umbral Vitality", "Umbral Fiber", "Umbral Intensify", "Augur Message", "Amalgam Organ Shatter", "Counterweight", "Collision Force", "Buzz Kill", "Blood Rush", "Carnis Mandible", "Dispatch Overdrive", "Enduring Strike", "Heavy Impact", "Maiming Strike", "Reach", "Body Count", "Condition Overload", "Primed Reach", "Berserker Fury", "Organ Shatter", "Fever Strike", "Focus Energy", "Drifting Contact", "Gladiator Might"];
export const mods = [
  ...names.map((n, i) => mod(n, i, /Strike|Reach|Rush|Kill|Impact|Counter|Collision|Shatter|Mandible|Body|Condition|Berserker|Fever|Drifting|Gladiator/.test(n) ? { compat: "Melee", type: "Melee Mod" } : {})),
  mod("Steel Charge", 3, { compat: "Aura", type: "Aura Mod", drain: -9, pol: "madurai", rar: "Common", max: 5 }), mod("Corrosive Projection", 5, { compat: "Aura", type: "Aura Mod", drain: -9, pol: "madurai", rar: "Rare", max: 5 }),
  mod("Iron Shrapnel", 2, { compat: "Rhino", type: "Warframe Mod", rar: "Rare", fx: ["+25% Armor"] }), mod("Smoke Shadow", 4, { compat: "Ash", type: "Warframe Mod", rar: "Rare", fx: ["+15% Ability Strength"] }),
  mod("Armored Agility", 2, { compat: "Warframe", type: "Warframe Mod", drain: 4, pol: "madurai", rar: "Rare", max: 5, extra: { isUtility: true } }),
  mod("Serration", 1, { compat: "Rifle", type: "Primary Mod", drain: 4, pol: "madurai", rar: "Rare", max: 10, fx: ["+165% Damage"] }), mod("Hornet Strike", 4, { compat: "Pistol", type: "Secondary Mod", drain: 2, pol: "madurai", rar: "Uncommon", max: 10, fx: ["+220% Damage"] }),
  mod("Primed Point Blank", 6, { compat: "Shotgun", type: "Primary Mod", drain: 6, pol: "madurai", rar: "Legendary", max: 10, fx: ["+165% Multishot", "+55% Damage"] }),
  mod("Iron Phoenix", 0, { compat: "Melee", type: "Stance Mod", drain: 7, pol: "vazarin", rar: "Rare", max: 3, extra: { stance: true } }),
];
const comp = (n, extra = {}) => ({ name: n, uniqueName: "/Lotus/Types/Recipes/" + n.replace(/\W/g, ""), itemCount: 1, tradable: true, ...extra });
const frame = (name, o = {}) => ({ name, uniqueName: "/Lotus/Powersuits/" + name.replace(/\W/g, ""), type: "Warframe", category: "Warframes", description: "Synthetic description for layout testing.", polarities: ["madurai", "vazarin", "naramon", "zenurik", "madurai", "naramon"], aura: "madurai", health: 370, shield: 350, armor: 225, power: 150, sprintSpeed: 1.0, masteryReq: 0, isPrime: /Prime$/.test(name), vaulted: false, tradable: false, ...o });
export const warframes = [
  frame("Ash Prime", { polarities: ["madurai", "madurai", "vazarin", "naramon", "zenurik", "naramon"], components: [comp("Blueprint"), comp("Neuroptics", { tradable: true }), comp("Chassis"), comp("Systems")] }),
  frame("Ash"), frame("Rhino"), frame("Excalibur"), frame("Volt"), frame("Mag"), frame("Saryn"), frame("Atlas Prime", { components: [comp("Blueprint"), comp("Neuroptics"), comp("Chassis"), comp("Systems")] }), frame("Narin", { isPrime: false }), frame("Jade", { aura: ["madurai", "naramon"] }),
];
export const primary = [{ name: "Soma Prime", uniqueName: "/Lotus/Weapons/SomaPrime", type: "Assault Rifle", category: "Primary", isPrime: true, vaulted: false, polarities: ["madurai", "madurai"], components: [comp("Barrel"), comp("Receiver"), comp("Stock"), comp("Blueprint")] }, { name: "Braton", uniqueName: "/Lotus/Weapons/Braton", type: "Assault Rifle", category: "Primary", polarities: ["madurai"] }];
export const melee = [{ name: "Dark Sword", uniqueName: "/Lotus/Weapons/DarkSword", type: "Sword", category: "Melee", stancePolarity: "madurai", polarities: ["madurai", "naramon"] }, { name: "Plain Blade", uniqueName: "/Lotus/Weapons/PlainBlade", type: "Sword", category: "Melee", stancePolarity: "universal" }];
// What a screen asks for -> what we answer. Anything else is refused, so the screens show their "source unavailable" state.
export const routes = [[/Mods\.json/, mods], [/Warframes\.json/, warframes], [/Primary\.json/, primary], [/Melee\.json/, melee], [/Secondary\.json/, []]];
// localStorage the screens read (see KEYS in src/lib/cloud.ts)
const slot = (m, r, p) => ({ mod: m, rank: r, ...(p ? { pol: p } : {}) }), none = () => ({ mod: null, rank: 0 });
export const seed = {
  "ff.builds": JSON.stringify([{ id: "b1", kind: "warframe", name: "Tank test", frame: "ash-prime", reactor: true, slots: [none(), slot("vitality", 10, "naramon"), slot("redirection", 10), slot("steel-fiber", 5), slot("flow", 5), slot("streamline", 5), none(), none()], special: { aura: slot("steel-charge", 3), exilus: none() } }, { id: "b2", kind: "warframe", name: "Empty build", frame: "rhino", reactor: false, slots: Array.from({ length: 8 }, none) }]),
  "ff.fav": JSON.stringify([{ id: "warframe:ash-prime", cat: "warframe", slug: "ash-prime", name: "Ash Prime" }, { id: "warframe:narin", cat: "warframe", slug: "narin", name: "Narin" }]),
  "ff.track": JSON.stringify([{ n: "Ash Prime", o: 0, t: 1 }, { n: "Ash Prime Blueprint", o: 0, t: 1, from: "Ash Prime" }, { n: "Orokin Cell", o: 2, t: 6 }]),
  "ff.goals": JSON.stringify([{ id: "g1", n: "Ash Prime", kind: "warframe", slug: "ash-prime" }]),
};
