#!/usr/bin/env node
// Runs every *.test.ts / *.test.mjs of the project WITHOUT network: esbuild bundles each file with the stand-ins of vite-lite.mjs, node runs it.
// Usage (from the project root): node tools/offline/run-tests.mjs [filter]
// It is a stand-in for vitest: the reference stays `npm test` with the real vitest.
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, statSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { alias, define, NPM_TOOLS, viteLite } from "./vite-lite.mjs";
const esbuild = createRequire(import.meta.url)(join(NPM_TOOLS, "esbuild"));
const root = resolve(process.cwd()), filter = process.argv[2] ?? "", out = join(process.env.TMPDIR || "/tmp", "ff-tests");
const walk = d => readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? (n === "node_modules" ? [] : walk(p)) : /\.test\.(ts|tsx|mjs)$/.test(n) ? [p] : []; });
const files = ["src", "scripts"].filter(d => existsSync(join(root, d))).flatMap(d => walk(join(root, d))).filter(f => f.includes(filter)).sort();
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
let pass = 0, fail = 0, crashed = 0; const bad = [];
for (const [i, f] of files.entries()) {
  const rel = f.slice(root.length + 1), o = join(out, `${i}.mjs`);
  try { await esbuild.build({ entryPoints: [f], outfile: o, bundle: true, format: "esm", platform: "node", target: "node22", logLevel: "silent", alias, define, nodePaths: [NPM_TOOLS], plugins: [viteLite({ root })], jsx: "automatic", loader: { ".json": "json" }, banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" } }); }
  catch (e) { crashed++; bad.push(`${rel}: did not bundle (${String(e.errors?.[0]?.text ?? e.message).slice(0, 200)})`); continue; }
  const r = spawnSync("node", [o], { cwd: root, encoding: "utf8", timeout: 120000 }), line = (r.stdout ?? "").split("\n").find(l => l.startsWith("@@RESULT "));
  if (!line) { crashed++; bad.push(`${rel}: did not run (${(r.stderr || r.stdout || "no output").trim().split("\n").filter(Boolean).slice(0, 3).join(" | ").slice(0, 260)})`); continue; }
  const j = JSON.parse(line.slice(9)); pass += j.pass; fail += j.fail; j.fails.forEach(x => bad.push(`${rel}: ${x}`));
}
console.log(`\nfiles ${files.length} | passed ${pass} | failed ${fail} | did not run ${crashed}`);
bad.forEach(b => console.log(" - " + b));
process.exit(fail || crashed ? 1 : 0);
