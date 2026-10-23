// The sentences that logic modules (not screens) produce, checked in other languages end to end: the language is really switched, the text comes
// out translated with the numbers filled in, and English is restored afterwards. Wording was written by hand from the English texts.
import { expect, it } from "vitest";
import type { Component, Entity } from "./catalog";
import { setLang, tp } from "../i18n";
import { GROUP_TITLE, nextAction, planParts } from "./exact";
import { ago, provLine, trustLine } from "./freshness";
import { completionNote } from "./completion";
import { difficulty } from "./part";
import { FIND, collect } from "./drops";
import type { RelicOpt } from "./exact";
import { READY_LABEL } from "./unlock";
import type { Relic } from "./drops";
const k = (name: string, count = 1, drops: Component["drops"] = []): Component => ({ name, count, drops, children: [] });
const rel = (name: string, rewards: [string, string, number][]): Relic => ({ name, tier: name.split(" ")[0], st: { Intact: rewards.map(([itemName, rarity, chance]) => ({ itemName, rarity, chance })), Radiant: rewards.map(([itemName, rarity, chance]) => ({ itemName, rarity, chance })) } } as unknown as Relic);
const rhino = { name: "Rhino Prime", slug: "rhino-prime", components: [k("Neuroptics", 1, [{ location: "Lith G1 Relic", type: "" }])] } as unknown as Entity;
const goal = { id: "warframe:rhino-prime", cat: "warframe" as const, slug: "rhino-prime", name: "Rhino Prime" };
const relics = [rel("Lith G1", [["Rhino Prime Neuroptics Blueprint", "Rare", 2]])];
const NOW = Date.parse("2026-10-14T12:00:00");
async function inLang<T>(code: string, f: () => T): Promise<T> { await setLang(code); try { return f(); } finally { await setLang("en"); } }
it("time and freshness lines follow the language", async () => {
  expect(await inLang("es", () => ago(NOW - 3_600_000, NOW))).toBe("hace 1 h");
  expect(await inLang("fr", () => ago(NOW - 5 * 60_000, NOW))).toBe("il y a 5 min");
  expect(await inLang("ja", () => ago(NOW - 2 * 86_400_000, NOW))).toBe("2 日前");
  expect(ago(NOW - 3_600_000, NOW)).toBe("1 h ago");
  const line = await inLang("de", () => trustLine([{ label: "Drops", status: "STALE", rec: { id: "x", data: null, at: NOW - 7_200_000, err: null, url: "", window: 1, src: "" } }], NOW).lines[0]);
  expect(line).toBe("Drops: veraltet, zuletzt abgerufen vor 2 Std.");
  expect(await inLang("es", () => provLine({ id: "x", data: null, at: NOW, err: null, url: "", window: 1, src: "", via: "cache" }, NOW))).toContain("de la caché del dispositivo");
});
it("the plan's next step and group titles are translated, with relic and mission names left as they are", async () => {
  const plans = planParts([goal], () => rhino, {}, relics, null), exp = new Date(NOW + 600_000).toISOString();
  const fis = [{ tier: "Lith", node: "Ur", missionType: "Defense", expiry: exp, isHard: false, isStorm: false }];
  const open = await inLang("es", () => nextAction(plans[0], fis, { "Lith G1": 1 }, true, NOW));
  expect(open.kind).toBe("open"); expect(open.text).toBe("Abre Lith G1 (Rare) ahora en una fisura Lith: Defense Ur");
  expect((await inLang("fr", () => nextAction(plans[0], fis, {}, true, NOW))).text).toBe("Obtenez Lith G1 (Rare), puis ouvrez-la dans une faille Lith");
  expect(nextAction(plans[0], fis, { "Lith G1": 1 }, true, NOW).text).toBe("Open Lith G1 (Rare) in a Lith fissure now: Defense Ur");
  expect(await inLang("it", () => GROUP_TITLE.now)).toBe("Disponibile ora"); expect(await inLang("zh", () => READY_LABEL.needs)).toBe("需要准备"); expect(GROUP_TITLE.now).toBe("Available now");
});
it("completion notes fill in the numbers in every language", async () => {
  const comps = [k("Neuroptics", 1), k("Systems", 1)];
  const note = await inLang("pt", () => completionNote("g", "Rhino Prime", comps, {}, { Neuroptics: 1 }, "Neuroptics"));
  expect(note?.text).toBe("Neuroptics obtida. Rhino Prime: 1/2 peças. Próxima: Systems.");
  expect(completionNote("g", "Rhino Prime", comps, {}, { Neuroptics: 1 }, "Neuroptics")?.text).toBe("Neuroptics collected. Rhino Prime: 1/2 parts. Next: Systems.");
});
it("plural forms of logic sentences: English and Russian", async () => {
  expect(tp("advItems", 1)).toBe("1 missing item can come from it"); expect(tp("advItems", 3)).toBe("3 missing items can come from it");
  const ru = await inLang("ru", () => [1, 2, 5, 21].map(n => tp("advItems", n)));
  expect(ru).toEqual(["отсюда может прийти 1 недостающий предмет", "отсюда могут прийти 2 недостающих предмета", "отсюда могут прийти 5 недостающих предметов", "отсюда может прийти 21 недостающий предмет"]);
});
it("account messages name the buttons by the labels the person actually sees", async () => {
  const { authMessage } = await import("./authMsg");
  expect(authMessage("Invalid login credentials")).toContain("\"Set or reset my password\"");
  const es = await inLang("es", () => authMessage("Invalid login credentials"));
  expect(es).toContain("\"Crear o restablecer mi contraseña\""); expect(es).not.toContain("Set or reset");
  const ja = await inLang("ja", () => authMessage("Email not confirmed"));
  expect(ja).toContain("「ログイン用リンクをメールで送る」");
});

const opt = (rarity: string, vaulted: boolean | null) => ({ name: "Lith G1", tier: "Lith", rarity, vaulted, chance: {} }) as unknown as RelicOpt;
it("part difficulty explanations: English unchanged, other languages translated with the count in the right plural form", async () => {
  expect(difficulty([opt("Rare", false)], 0).why).toBe("Its best case is a Rare reward in 1 relic you can still get.");
  expect(difficulty([opt("Common", false), opt("Common", false)], 0).why).toBe("Its best case is a Common reward in 2 relics you can still get.");
  expect(difficulty([opt("Common", true)], 0).why).toBe("Every relic that holds it is vaulted, so it no longer drops. It comes from trading with players or from Varzia.");
  expect(await inLang("es", () => difficulty([opt("Rare", false), opt("Rare", false)], 0).why)).toBe("Su mejor caso es una recompensa de rareza Raro en 2 reliquias que aún puedes conseguir.");
  expect(await inLang("ru", () => difficulty([opt("Common", false)], 0).why)).toContain("в 1 реликвии,");
  expect(await inLang("ru", () => difficulty([opt("Common", false), opt("Common", false), opt("Common", false)], 0).why)).toContain("в 3 реликвиях,");
  expect(await inLang("de", () => difficulty([], 2).why)).toBe("Es stammt aus Quellen ohne Relikte, die unten aufgeführt sind; die Schwierigkeit hängt von dieser Aktivität ab.");
  expect(await inLang("ja", () => difficulty([], 0).why)).toBe("読み込んだデータには、入手元が書かれていません。");
});

it("drop table rows: English unchanged, labels, modes, notes and gaps follow the language, and the cache is per language", async () => {
  const data = { enemyBlueprintTables: { enemyBlueprintTables: [{ enemyName: "Grineer Lancer", enemyItemDropChance: 20, items: [{ itemName: "Forma Blueprint", chance: 5, rarity: "Rare" }] }] } };
  const run = () => collect(FIND.map(f => (f.id in data ? { f, rec: { data: data[f.id as keyof typeof data] } as never, status: "FRESH" as const } : { f, rec: undefined, status: "UNAVAILABLE" as const })));
  const en = run(); expect(en.rows[0]).toMatchObject({ src: "Enemy blueprint drops", mode: "Enemy drop", note: "20% chance the enemy drops loot × 5% within its table" }); expect(en.gaps[0]).toBe("Mission rewards: unavailable");
  const es = await inLang("es", run); expect(es.rows[0]).toMatchObject({ src: "Botín de planos de enemigos", mode: "Botín de enemigo" }); expect(es.gaps[0]).toBe("Recompensas de misión: no disponible");
  expect(run().rows[0].mode).toBe("Enemy drop");
});
