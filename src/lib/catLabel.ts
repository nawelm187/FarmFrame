import type { Cat } from "./catalog";
import type { Key } from "../i18n";
/** The singular name of a catalog category, as a translation key ("Warframe", "Weapon"...). The plural names are the menu keys (warframes, weapons...). */
export const CAT_ONE: Record<Cat, Key> = { warframe: "catWarframe", weapon: "catWeapon", mod: "catMod", companion: "catCompanion", archwing: "catArchwing", railjack: "catRailjack" };
