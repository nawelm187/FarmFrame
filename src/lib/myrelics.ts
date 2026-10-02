/** Relics the user marked as owned: name -> count. Stored locally and synced with the account like the other plan data. */
const K = "ff.relics";
export type MyRelics = Record<string, number>;
export const readRelics = (): MyRelics => { try { const v: unknown = JSON.parse(localStorage.getItem(K) || "{}"); return v && typeof v === "object" && !Array.isArray(v) ? (v as MyRelics) : {}; } catch { return {}; } };
export const writeRelics = (o: MyRelics) => { try { localStorage.setItem(K, JSON.stringify(Object.fromEntries(Object.entries(o).filter(([, n]) => n > 0)))); } catch { /* storage unavailable */ } };
