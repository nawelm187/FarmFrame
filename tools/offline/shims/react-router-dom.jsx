// Small hash-router stand-in for react-router-dom (only what FarmFrame uses), for environments with no network. Not the real library.
import { createContext, createElement as h, useContext, useEffect, useMemo, useState, useCallback } from "react";
const Loc = createContext(null), Par = createContext({});
const read = () => { const raw = decodeURI(location.hash.slice(1) || "/"), i = raw.indexOf("?"); return i < 0 ? { pathname: raw || "/", search: "" } : { pathname: raw.slice(0, i) || "/", search: raw.slice(i) }; };
const href = to => (typeof to === "string" ? to : (to.pathname ?? "/") + (to.search ?? ""));
export function HashRouter({ children }) {
  const [loc, set] = useState(read);
  useEffect(() => { const f = () => set(read()); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  return h(Loc.Provider, { value: loc }, children);
}
const compile = p => { const keys = []; const rx = new RegExp("^" + p.replace(/\/\*$/, "(?:/(.*))?").replace(/:(\w+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "/?$"); return { rx, keys: p.endsWith("*") ? [...keys, "*"] : keys }; };
export function Routes({ children }) {
  const loc = useContext(Loc), list = [].concat(children).flat(Infinity).filter(Boolean);
  for (const r of list) { const p = r.props.path ?? "*"; const { rx, keys } = compile(p === "*" ? "/*" : p), m = rx.exec(loc.pathname); if (m) { const params = {}; keys.forEach((k, i) => { params[k] = m[i + 1] === undefined ? undefined : decodeURIComponent(m[i + 1]); }); return h(Par.Provider, { value: params }, r.props.element); } }
  return null;
}
export const Route = () => null;
export const useLocation = () => { const l = useContext(Loc); return useMemo(() => ({ ...l, hash: "", state: null, key: l.pathname + l.search }), [l]); };
export const useParams = () => useContext(Par);
export const useNavigate = () => useCallback((to, o) => { if (typeof to === "number") { history.go(to); return; } const u = "#" + href(to); if (o?.replace) location.replace(u); else location.hash = u; }, []);
export function Navigate({ to, replace }) { const nav = useNavigate(); useEffect(() => { nav(to, { replace }); }, [to]); return null; }
export const useSearchParams = () => { const l = useContext(Loc), nav = useNavigate(), sp = useMemo(() => new URLSearchParams(l.search), [l.search]);
  return [sp, (next, o) => { const n = typeof next === "function" ? next(sp) : next, s = new URLSearchParams(n).toString(); nav(l.pathname + (s ? "?" + s : ""), o); }]; };
export function Link({ to, replace, children, ...p }) { return h("a", { ...p, href: "#" + href(to) }, children); }
export function NavLink({ to, end, className, children, ...p }) { const l = useContext(Loc), t = href(to).split("?")[0], active = end || t === "/" ? l.pathname === t : l.pathname === t || l.pathname.startsWith(t + "/");
  return h("a", { ...p, href: "#" + href(to), "aria-current": active ? "page" : undefined, className: typeof className === "function" ? className({ isActive: active }) : (className ?? "") + (active ? " active" : "") }, typeof children === "function" ? children({ isActive: active }) : children); }
