import type { Cat } from "./catalog";
import type { Kind } from "./build";
import type { Key } from "../i18n";
/** The singular name of a catalog category, as a translation key ("Warframe", "Weapon"...). The plural names are the menu keys (warframes, weapons...). */
export const CAT_ONE: Record<Cat, Key> = { warframe: "catWarframe", weapon: "catWeapon", mod: "catMod", companion: "catCompanion", archwing: "catArchwing", railjack: "catRailjack" };
/** The plural name of a catalog category, as a translation key (the menu names). */
export const CAT_MANY: Record<Cat, Key> = { warframe: "warframes", weapon: "weapons", mod: "mods", companion: "companions", archwing: "archwings", railjack: "railjack" };
/** The name of a build type, as a translation key (the English names live in build.ts: KIND_LABEL). */
export const KIND_KEY: Record<Kind, Key> = { warframe: "catWarframe", primary: "kPrimary", secondary: "kSecondary", melee: "kMelee", companion: "catCompanion", archwing: "catArchwing" };
