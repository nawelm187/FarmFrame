// Tiny IndexedDB key-value cache for large, slow-changing datasets. Every failure degrades to "no cache".
const open = () => new Promise<IDBDatabase>((res, rej) => { const r = indexedDB.open("ff-cache", 1); r.onupgradeneeded = () => r.result.createObjectStore("kv"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
export async function cget<T>(k: string): Promise<T | undefined> {
  try { const db = await open(); return await new Promise<T | undefined>(res => { const q = db.transaction("kv").objectStore("kv").get(k); q.onsuccess = () => res(q.result as T | undefined); q.onerror = () => res(undefined); }); } catch { return undefined; }
}
export async function cset(k: string, v: unknown): Promise<void> {
  try { const db = await open(); await new Promise<void>(res => { const t = db.transaction("kv", "readwrite"); t.objectStore("kv").put(v, k); t.oncomplete = () => res(); t.onerror = () => res(); t.onabort = () => res(); }); } catch { /* cache unavailable */ }
}
