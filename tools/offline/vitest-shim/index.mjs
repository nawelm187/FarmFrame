// Minimal stand-in for vitest, ONLY for environments with no network (see docs/ENTORNO_CLAUDE.md).
// It covers the matchers this project's tests use. It is not vitest: the real `npm test` stays the reference.
import { isDeepStrictEqual } from "node:util";
const tests = [], stack = [], hooks = { beforeEach: [], afterEach: [] };
const eq = (a, b) => { if (Object.is(a, b)) return true; if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Map && b instanceof Map) return a.size === b.size && [...a].every(([k, v]) => b.has(k) && eq(v, b.get(k)));
  if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every(v => b.has(v));
  const ka = Object.keys(a).filter(k => a[k] !== undefined), kb = Object.keys(b).filter(k => b[k] !== undefined);
  return ka.length === kb.length && ka.every(k => k in b && eq(a[k], b[k])); };
const subset = (a, b) => (b && typeof b === "object" ? a && typeof a === "object" && Object.keys(b).every(k => subset(a[k], b[k])) : Object.is(a, b));
const show = v => { try { return typeof v === "string" ? JSON.stringify(v) : typeof v === "function" ? "[fn]" : JSON.stringify(v, (_, x) => (x instanceof Map ? { Map: [...x] } : x instanceof Set ? { Set: [...x] } : x === undefined ? "undefined" : x)); } catch { return String(v); } };
const make = (actual, neg = false) => {
  const chk = (ok, msg) => { if (neg ? ok : !ok) throw new Error((neg ? "not " : "") + msg); };
  const m = {
    toBe: e => chk(Object.is(actual, e), `toBe ${show(e)}, got ${show(actual)}`),
    toEqual: e => chk(eq(actual, e), `toEqual ${show(e)}, got ${show(actual)}`),
    toStrictEqual: e => chk(isDeepStrictEqual(actual, e), `toStrictEqual ${show(e)}, got ${show(actual)}`),
    toBeCloseTo: (e, d = 2) => chk(Math.abs(actual - e) < Math.pow(10, -d) / 2, `toBeCloseTo ${e} (${d}), got ${actual}`),
    toContain: e => chk(typeof actual === "string" ? actual.includes(e) : [...actual].some(x => Object.is(x, e)), `toContain ${show(e)} in ${show(actual)}`),
    toContainEqual: e => chk([...actual].some(x => eq(x, e)), `toContainEqual ${show(e)} in ${show(actual)}`),
    toHaveLength: n => chk(actual?.length === n, `toHaveLength ${n}, got ${actual?.length}`),
    toBeNull: () => chk(actual === null, `toBeNull, got ${show(actual)}`),
    toBeUndefined: () => chk(actual === undefined, `toBeUndefined, got ${show(actual)}`),
    toBeDefined: () => chk(actual !== undefined, "toBeDefined"),
    toBeTruthy: () => chk(!!actual, `toBeTruthy, got ${show(actual)}`), toBeFalsy: () => chk(!actual, `toBeFalsy, got ${show(actual)}`),
    toBeGreaterThan: n => chk(actual > n, `> ${n}, got ${actual}`), toBeGreaterThanOrEqual: n => chk(actual >= n, `>= ${n}, got ${actual}`),
    toBeLessThan: n => chk(actual < n, `< ${n}, got ${actual}`), toBeLessThanOrEqual: n => chk(actual <= n, `<= ${n}, got ${actual}`),
    toMatch: r => chk(typeof r === "string" ? actual.includes(r) : r.test(actual), `toMatch ${r}, got ${show(actual)}`),
    toMatchObject: e => chk(subset(actual, e), `toMatchObject ${show(e)}, got ${show(actual)}`),
    toBeInstanceOf: c => chk(actual instanceof c, `toBeInstanceOf ${c?.name}`),
    toHaveProperty: (k, v) => chk(actual != null && k in Object(actual) && (v === undefined || eq(actual[k], v)), `toHaveProperty ${k}`),
    toThrow: e => { let t = false, err; try { actual(); } catch (x) { t = true; err = x; } chk(t && (e === undefined || (typeof e === "string" ? String(err?.message).includes(e) : e instanceof RegExp ? e.test(String(err?.message)) : err instanceof e)), `toThrow ${e ?? ""}`); },
  };
  return m;
};
export const expect = Object.assign(actual => { const p = make(actual); p.not = make(actual, true);
  p.resolves = new Proxy({}, { get: (_, k) => async (...a) => make(await actual)[k](...a) }); p.rejects = new Proxy({}, { get: (_, k) => async (...a) => { let r; try { await actual; } catch (e) { r = e; } return make(r)[k](...a); } }); return p; }, { any: c => ({ asymmetricMatch: x => x instanceof c || typeof x === c.name.toLowerCase() }) });
const reg = (name, fn, skip) => tests.push({ name: [...stack, name].join(" > "), fn, skip, hooks: { b: [...hooks.beforeEach], a: [...hooks.afterEach] } });
export const it = Object.assign((n, f) => reg(n, f), { skip: (n, f) => reg(n, f, true), only: (n, f) => reg(n, f), todo: n => reg(n, null, true), each: rows => (n, f) => rows.forEach((r, i) => reg(n.replace("%s", Array.isArray(r) ? r[0] : r) || `${n} #${i}`, () => f(...(Array.isArray(r) ? r : [r])))) });
export const test = it;
export const describe = Object.assign((n, f) => { stack.push(n); const saved = { beforeEach: [...hooks.beforeEach], afterEach: [...hooks.afterEach] }; f(); stack.pop(); hooks.beforeEach = saved.beforeEach; hooks.afterEach = saved.afterEach; }, { skip: () => {}, only: (n, f) => describe(n, f) });
export const beforeEach = f => hooks.beforeEach.push(f), afterEach = f => hooks.afterEach.push(f), beforeAll = f => tests.push({ name: "(beforeAll)", fn: f, hooks: { b: [], a: [] } }), afterAll = () => {};
export const vi = { fn: impl => { const f = (...a) => { f.mock.calls.push(a); return impl?.(...a); }; f.mock = { calls: [] }; return f; } };
let done = false;
process.on("beforeExit", async () => { if (done) return; done = true; let pass = 0; const fails = [];
  for (const t of tests) { if (t.skip || !t.fn) continue; try { for (const b of t.hooks.b) await b(); await t.fn(); for (const a of t.hooks.a) await a(); pass++; } catch (e) { fails.push(`${t.name}: ${String(e?.message ?? e).split("\n")[0]}`); } }
  console.log("@@RESULT " + JSON.stringify({ pass, fail: fails.length, fails })); process.exitCode = fails.length ? 1 : 0; });
