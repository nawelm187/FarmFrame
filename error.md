npm ci && npm run typecheck && npm test && npm run build

added 112 packages, and audited 113 packages in 39s

18 packages are looking for funding
  run `npm fund` for details

8 vulnerabilities (5 moderate, 1 high, 2 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.

> farmframe@0.60.0 typecheck
> tsc --noEmit


> farmframe@0.60.0 test
> vitest run


 RUN  v2.1.9 C:/Users/IK/Desktop/farmframe

 ❯ test/logic.test.js (0)
 ✓ src/data/vendors.test.ts (2)
 ✓ src/lib/advisor.test.ts (5)
 ✓ src/lib/alerts.test.ts (1)
 ✓ src/lib/authMsg.test.ts (1)
 ✓ src/lib/build.test.ts (7)
 ✓ src/lib/calc.test.ts (2)
 ✓ src/lib/catalog.test.ts (7)
 ✓ src/lib/cloud.test.ts (3)
 ✓ src/lib/completion.test.ts (4)
 ✓ src/lib/cycles.test.ts (5)
 ✓ src/lib/descendia.test.ts (8)
 ✓ src/lib/drift.test.ts (4)
 ✓ src/lib/drops.test.ts (4)
 ✓ src/lib/enemies.test.ts (1)
 ✓ src/lib/exact.test.ts (8)
 ✓ src/lib/farm.test.ts (1)
 ✓ src/lib/farmNow.test.ts (3)
 ✓ src/lib/fav.test.ts (1)
 ✓ src/lib/format.test.ts (2)
 ✓ src/lib/freshness.test.ts (3)
 ✓ src/lib/goals.test.ts (1)
 ✓ src/lib/health.test.ts (3)
 ✓ src/lib/images.test.ts (1)
 ✓ src/lib/itemAdvice.test.ts (3)
 ✓ src/lib/lore.test.ts (4)
 ✓ src/lib/market.test.ts (4)
 ✓ src/lib/part.test.ts (4)
 ✓ src/lib/patchlogs.test.ts (4)
 ✓ src/lib/patchsummary.test.ts (11)
 ✓ src/lib/planner.test.ts (3)
 ✓ src/lib/probe.test.ts (1)
 ✓ src/lib/reqs.test.ts (2)
 ✓ src/lib/resources.test.ts (3)
 ✓ src/lib/rotations.test.ts (7)
 ✓ src/lib/search.test.ts (3)
 ✓ src/lib/text.test.ts (3)
 ✓ src/lib/track.test.ts (2)
 ✓ src/lib/trade.test.ts (3)
 ✓ src/lib/tree.test.ts (1)
 ✓ src/lib/vault.test.ts (2)
 ✓ src/lib/vendor.test.ts (3)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/logic.test.js [ test/logic.test.js ]
SyntaxError: Unexpected token '<'
 ❯ test/logic.test.js:19:9
     17| global.fetch=async(u)=>{const k=Object.keys(data).find(k=>u.endsWith("/"+k)||u.endsWith("/"+k.replace(".json",…
     18| const src=require("fs").readFileSync(require("path").join(__dirname,"..","index.html"),"utf8").match(/<script>…
     19| (0,eval)(src+`;globalThis.__t={go,D,V,search,relicOut,findOut,fresh,worldCards}`);
       |         ^
     20| __t.V.relics();__t.V.finder();__t.V.sources();
     21| setTimeout(()=>{const t=__t;const a=require("assert");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

 Test Files  1 failed | 41 passed (42)
      Tests  140 passed (140)
   Start at  06:13:53
   Duration  9.87s (transform 1.16s, setup 0ms, collect 2.73s, tests 526ms, environment 19ms, prepare 10.51s)
