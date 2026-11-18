#!/usr/bin/env node
// One command, one file to send back: runs install, typecheck, tests and build, and writes reporte-farmframe.txt.
// Usage (project root, with network): node tools/report.mjs        Add --skip-install if node_modules is already there.
import { spawnSync } from "node:child_process";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
const out = [], skip = process.argv.includes("--skip-install"), run = (name, cmd) => {
  const t = Date.now(), r = spawnSync(cmd, { shell: true, encoding: "utf8", maxBuffer: 256 << 20 }), text = `${r.stdout ?? ""}\n${r.stderr ?? ""}`.trim().split("\n"), ok = r.status === 0;
  out.push(`## ${ok ? "OK  " : "FAIL"} ${name} (${Math.round((Date.now() - t) / 1000)} s)`);
  const keep = ok ? text.filter(l => /passed|failed|Tests|Test Files|built in|modules transformed|error|warn/i.test(l)).slice(-8) : text.slice(-60);
  out.push(...keep.map(l => "   " + l.slice(0, 240)), ""); console.log(`${ok ? "OK  " : "FAIL"} ${name}`);
};
const v = c => { try { return spawnSync(c, { shell: true, encoding: "utf8" }).stdout.trim(); } catch { return "?"; } };
out.push(`FarmFrame report ${new Date().toISOString()}`, `version ${JSON.parse(readFileSync("package.json", "utf8")).version}`, `node ${v("node -v")} | npm ${v("npm -v")} | ${process.platform}`, `git ${v("git log -1 --format=%h' '%s")}`, "");
if (!skip || !existsSync("node_modules")) run("npm ci", "npm ci");
run("typecheck", "npm run typecheck"); run("audit (packages that ship to visitors)", "npm audit --omit=dev --audit-level=high"); run("tests", "npm test"); run("build", "npm run build");
// The build plugin that adds the Content Security Policy cannot be tried without Vite, so look at the real output.
try { const h = readFileSync("dist/index.html", "utf8"), ok = /Content-Security-Policy/.test(h) && /script-src 'self' 'sha256-/.test(h) && /connect-src 'self'/.test(h); out.push(`## ${ok ? "OK  " : "FAIL"} Content Security Policy in dist/index.html`, ok ? "" : "   the built page has no complete policy: the plugin in vite.config.ts did not apply", ""); console.log(`${ok ? "OK  " : "FAIL"} CSP in the built page`); } catch { out.push("## FAIL Content Security Policy: dist/index.html not found", ""); }
writeFileSync("reporte-farmframe.txt", out.join("\n")); console.log("\nWritten: reporte-farmframe.txt  (send me that file)");
