// esbuild plugin and shims that stand in for Vite + three npm packages when there is NO network (see docs/ENTORNO_CLAUDE.md).
// Handles: import.meta.glob (eager ?url / ?raw, and lazy), import.meta.env, @fontsource css, react-router-dom, @supabase/supabase-js, vitest.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url)), posix = p => p.split(sep).join("/");
export const NPM_TOOLS = process.env.NPM_TOOLS || "/opt/npm-tools/node_modules";
const walk = d => { try { return readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? (n === "node_modules" ? [] : walk(p)) : [p]; }); } catch { return []; } };
const re = pat => new RegExp("^" + pat.replace(/[.+^$()|\\]/g, "\\$&").replace(/\{([^}]+)\}/g, (_, a) => "(?:" + a.split(",").join("|") + ")").replace(/\*\*\//g, "(?:.*/)?").replace(/\*/g, "[^/]*") + "$");
/** Expands one glob pattern relative to the importing file; returns [key, absolutePath][] with Vite-style keys. */
export function expand(file, pattern) {
  const base = dirname(file), parts = posix(resolve(base, pattern)).split("/"), i = parts.findIndex(p => /[*{]/.test(p));
  if (i < 0) { const f = parts.join("/"), k = posix(relative(base, f)); return existsSync(f) ? [[k.startsWith(".") ? k : "./" + k, f]] : []; }
  const fixed = parts.slice(0, i).join("/") || "/", rest = parts.slice(i).join("/"), rx = re(rest);
  return walk(fixed).filter(f => rx.test(posix(relative(fixed, f)))).sort().map(f => { const k = posix(relative(base, f)); return [k.startsWith(".") ? k : "./" + k, f]; });
}
export function viteLite({ root }) {
  const srcDir = join(root, "src"), emptyCss = join(here, "shims/empty.css");
  return { name: "vite-lite", setup(b) {
    b.onResolve({ filter: /^@fontsource/ }, () => ({ path: emptyCss }));
    b.onLoad({ filter: /\.(tsx?|jsx?|mjs)$/ }, a => {
      if (a.path.includes("node_modules")) return null;
      let s = readFileSync(a.path, "utf8"); if (!s.includes("import.meta.glob")) return null;
      s = s.replace(/import\.meta\.glob\(\s*(["'`])([^"'`]+)\1\s*(?:,\s*(\{[^}]*\}))?\s*\)/g, (_, _q, pat, opts = "{}") => {
        const files = expand(a.path, pat), eager = /eager:\s*true/.test(opts), q = /query:\s*["']\?(\w+)["']/.exec(opts)?.[1];
        const body = files.map(([k, f]) => `${JSON.stringify(k)}: ${eager ? (q === "raw" ? JSON.stringify(readFileSync(f, "utf8")) : JSON.stringify("/__src/" + posix(relative(srcDir, f)))) : `() => import(${JSON.stringify(f)})`}`).join(",\n");
        return `({${body}})`;
      });
      return { contents: s, loader: a.path.endsWith("x") ? (a.path.endsWith("tsx") ? "tsx" : "jsx") : a.path.endsWith(".ts") ? "ts" : "js", resolveDir: dirname(a.path) };
    });
  } };
}
export const alias = { "react-router-dom": join(here, "shims/react-router-dom.jsx"), "@supabase/supabase-js": join(here, "shims/supabase.js"), vitest: join(here, "vitest-shim/index.mjs") };
export const define = { "import.meta.env": JSON.stringify({ MODE: "test", DEV: false, PROD: false, BASE_URL: "/" }) };
