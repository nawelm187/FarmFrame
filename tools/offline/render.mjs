#!/usr/bin/env node
// Builds the REAL app with esbuild + stand-ins (vite-lite.mjs), serves it, opens it in Chromium at several widths with SYNTHETIC data
// (fixtures.mjs), and reports horizontal overflow, errors and screenshots. Usage (project root): node tools/offline/render.mjs [scenarioFilter] [widths,comma]
// This shows how the screens LAY OUT. It does not prove the data is right, and it runs React 19 while the project pins React 18.
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { alias, define, NPM_TOOLS, viteLite } from "./vite-lite.mjs";
import { routes, seed } from "./fixtures.mjs";
import { injectCsp } from "../../scripts/csp.mjs";
const req = createRequire(import.meta.url), esbuild = req(join(NPM_TOOLS, "esbuild"));
const { chromium } = req(process.env.PLAYWRIGHT_DIR || "/home/claude/.npm-global/lib/node_modules/playwright");
const root = resolve(process.cwd()), dist = join(process.env.TMPDIR || "/tmp", "ff-app"), shots = process.env.SHOTS || join(process.env.TMPDIR || "/tmp", "ff-shots");
const filter = process.argv[2] ?? "", widths = (process.argv[3] ?? "320,390,768,1280").split(",").map(Number);
rmSync(dist, { recursive: true, force: true }); mkdirSync(dist, { recursive: true }); mkdirSync(shots, { recursive: true });
await esbuild.build({ entryPoints: [join(root, "src/main.tsx")], outfile: join(dist, "app.js"), bundle: true, format: "esm", platform: "browser", target: "es2022", logLevel: "error", alias, define, nodePaths: [NPM_TOOLS], plugins: [viteLite({ root })], jsx: "automatic", minify: false, sourcemap: false,
  loader: { ".json": "json", ".png": "file", ".webp": "file", ".svg": "file", ".jpg": "file", ".woff2": "file", ".woff": "file" }, assetNames: "a/[name]-[hash]", define: { ...define, "import.meta.env": JSON.stringify({ MODE: "production", DEV: false, PROD: true, BASE_URL: "/", VITE_SUPABASE_URL: "https://harness.supabase.co", VITE_SUPABASE_KEY: "harness-key" }), "process.env.NODE_ENV": '"production"' } });
writeFileSync(join(dist, "index.html"), (process.env.NO_CSP ? x => x : injectCsp)(readFileSync(join(root, "index.html"), "utf8")).replace(/<script type="module"[^>]*src="[^"]*main\.tsx"[^>]*><\/script>/, '<link rel="stylesheet" href="/app.css"><script type="module" src="/app.js"></script>'));
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".json": "application/json" };
const server = createServer((q, s) => { const u = decodeURIComponent(q.url.split("?")[0]); const f = u.startsWith("/__src/") ? join(root, "src", u.slice(7)) : join(dist, u === "/" ? "index.html" : u);
  if (existsSync(f) && !f.endsWith("/")) { s.writeHead(200, { "content-type": MIME[extname(f)] ?? "application/octet-stream" }); s.end(readFileSync(f)); } else { s.writeHead(404); s.end(); } }).listen(0);
const base = `http://localhost:${server.address().port}/`;
const scenarios0 = [
  ["home", "/"], ["warframes", "/warframes"], ["mods", "/mods"], ["mods-filtered", "/mods?pol=madurai&s=drain-desc"], ["mods-compare", "/mods?c=serration,hornet-strike,primed-point-blank"],
  ["tracking", "/tracking"], ["builds", "/builds"], ["editor", "/build/b1"], ["editor-empty", "/build/b2"],
  ["editor-sheet", "/build/b1", async p => { await p.click(".bslot:not(.k-aura):not(.k-exilus) .bempty"); await p.waitForSelector(".sheet"); }],
  ["editor-panel", "/build/b1", async p => { await p.click(".bslot .bcard >> nth=3"); await p.waitForSelector(".bpanel"); }],
  ["assistant", "/assistant"], ["assistant-ask", "/assistant", async p => { await p.click("text=what can i do now"); await p.waitForSelector(".astturn"); await p.waitForTimeout(800); }], ["assistant-follow", "/assistant", async p => { await p.fill(".astform input", "what do i need for ash prime"); await p.keyboard.press("Enter"); await p.waitForSelector(".astturn"); await p.waitForTimeout(1200); await p.fill(".astform input", "and where do i get it"); await p.keyboard.press("Enter"); await p.waitForTimeout(1500); if (!(await p.innerText(".astturn")).includes("ash prime")) throw new Error("the follow-up did not use the previous subject"); }], ["assistant-mods", "/assistant", async p => { await p.fill(".astform input", "mods for rhino"); await p.keyboard.press("Enter"); await p.waitForSelector(".astturn"); await p.waitForTimeout(1500); }], ["farm-part", "/farm/Ash%20Prime%20Blueprint"], ["farm-frame", "/farm/Ash%20Prime"], ["sources", "/sources"], ["fissures", "/fissures"],
];
// Broad sweep of every route: node tools/offline/render.mjs sweep 320   (names start with "sweep")
const sweep = ["/", "/alerts", "/builds", "/enemies", "/explore", "/farm", "/farm-plan", "/finder", "/fissures", "/guides", "/helminth", "/invasions", "/kdrives", "/lore", "/mastery", "/methods", "/parts", "/patches", "/plan", "/planner", "/profile", "/relics", "/resources", "/roadmap", "/rotations", "/sources", "/syndicates", "/tracking",
  "/warframes", "/weapons", "/mods", "/companions", "/archwings", "/railjack", "/warframe/ash-prime", "/weapon/soma-prime", "/mod/serration", "/mod/steel-charge", "/item/Orokin%20Cell", "/item/Ash%20Prime%20Blueprint", "/admin", "/assistant", "/does-not-exist"].map(p => ["sweep" + p.replace(/\W+/g, "-"), p]);
const chosen = (filter.startsWith("sweep") ? sweep : scenarios0).filter(([n]) => n.includes(filter));
const overflow = () => { const w = innerWidth, scrolls = el => { for (let e = el.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") return true; } return false; };
  return { page: document.documentElement.scrollWidth > w + 1, bad: [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > w + 1 && e.getBoundingClientRect().width > 0 && !scrolls(e)).slice(0, 4).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : "")) }; };
const browser = await chromium.launch(); let problems = 0; const rows = [], hosts = new Map();
for (const [name, path, act] of chosen) for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 }); await ctx.addInitScript(s => { for (const [k, v] of Object.entries(s)) if (!localStorage.getItem(k)) localStorage.setItem(k, v); try { localStorage.setItem("ff.lang", "en"); } catch {} }, seed);
  await ctx.route(u => !u.href.startsWith(base), r => { const url = r.request().url(), rt = r.request().resourceType(); try { const k = rt + " " + new URL(url).origin; hosts.set(k, (hosts.get(k) ?? 0) + 1); } catch {} const _u = url, hit = routes.find(([re]) => re.test(_u)); hit ? r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(hit[1]) }) : r.abort(); });
  const page = await ctx.newPage(), errs = []; page.setDefaultTimeout(6000); page.on("pageerror", e => errs.push(String(e.message).slice(0, 140))); page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|ERR_FAILED|net::/.test(m.text())) errs.push(m.text().slice(0, 140)); });
  await page.goto(base + "#" + path); await page.waitForSelector("#root h1, #root main, #root .app", { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(900);
  let step = ""; try { if (act) { step = "interaction"; await act(page); await page.waitForTimeout(400); } } catch (e) { errs.push("interaction failed: " + String(e.message).split("\n")[0].slice(0, 120)); }
  const o = await page.evaluate(overflow), boundary = await page.evaluate(() => /Something went wrong/.test(document.body.innerText)), h = await page.evaluate(() => location.hash);
  await page.screenshot({ path: join(shots, `${name}-${w}.png`), fullPage: true });
  const bad = o.page || boundary || errs.length; if (bad) problems++;
  rows.push(`${bad ? "FAIL" : "ok  "} ${name.padEnd(14)} ${String(w).padStart(4)}px ${h !== "#" + path ? "-> " + h + " " : ""}${o.page ? "[PAGE SCROLLS SIDEWAYS: " + o.bad.join(", ") + "] " : ""}${boundary ? "[ERROR SCREEN] " : ""}${errs.length ? "[" + errs.slice(0, 2).join(" | ") + "]" : ""}`);
  console.log(rows.at(-1)); await ctx.close();
}
// Optional: ASK_OUT=file.json ASK_QUERIES="q1|q2" records what the Ctrl+K search answers, to compare before and after a refactor.
if (process.env.ASK_OUT) {
  const qs = (process.env.ASK_QUERIES ?? "").split("|").filter(Boolean), res = {};
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); await ctx.addInitScript(sd => { for (const [k, v] of Object.entries(sd)) if (!localStorage.getItem(k)) localStorage.setItem(k, v); localStorage.setItem("ff.lang", "en"); }, seed);
  await ctx.route(u => !u.href.startsWith(base), r => { const hit = routes.find(([re]) => re.test(r.request().url())); hit ? r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(hit[1]) }) : r.abort(); });
  const pg = await ctx.newPage(); pg.setDefaultTimeout(8000);
  for (const q of qs) { await pg.goto(base + "#/"); await pg.waitForTimeout(500); await pg.keyboard.press("Control+k"); await pg.waitForSelector(".pal input"); await pg.fill(".pal input", q); await pg.waitForTimeout(1200); res[q] = (await pg.innerText(".pal").catch(() => "(no palette)")).replace(/\s+/g, " ").trim(); }
  writeFileSync(process.env.ASK_OUT, JSON.stringify(res, null, 1)); console.log("recorded", qs.length, "answers in", process.env.ASK_OUT);
}
await browser.close(); server.close(); if (process.env.HOSTS) console.log("\nexternal requests (type origin: count)\n" + [...hosts].sort().map(([k, n]) => `  ${k}: ${n}`).join("\n")); console.log(`\nscreens ${rows.length} | with problems ${problems} | screenshots in ${shots}`); process.exit(problems ? 1 : 0);
