npm ci && npm run typecheck && npm test && npm run build

added 112 packages, and audited 113 packages in 46s

18 packages are looking for funding
  run `npm fund` for details

8 vulnerabilities (5 moderate, 1 high, 2 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
npm notice run farmframe@0.78.0 typecheck
npm notice run tsc --noEmit
src/lib/searchDocs.ts:7:10 - error TS6133: 'ref' is declared but its value is never read.

7 import { ref, refOf, thingRoute } from "./refs";
           ~~~


Found 1 error in src/lib/searchDocs.ts:7



added 112 packages, and audited 113 packages in 42s

18 packages are looking for funding
  run `npm fund` for details

8 vulnerabilities (5 moderate, 1 high, 2 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
npm notice run farmframe@0.78.0 typecheck
npm notice run tsc --noEmit
npm notice run farmframe@0.78.0 test
npm notice run vitest run

 RUN  v2.1.9 C:/Users/IK/Desktop/FarmFrame-main

 ✓ src/data/helminth.test.ts (4)
 ✓ src/data/syndicateInfo.test.ts (6)
 ✓ src/data/syndicateWiki.test.ts (5)
 ✓ src/data/vendors.test.ts (3)
 ✓ src/lib/advisor.test.ts (5)
 ✓ src/lib/alerts.test.ts (2)
 ✓ src/lib/authMsg.test.ts (1)
 ✓ src/lib/build.test.ts (7)
 ✓ src/lib/calc.test.ts (2)
 ✓ src/lib/catalog.test.ts (7)
 ✓ src/lib/cloud.test.ts (3)
 ✓ src/lib/completion.test.ts (4)
 ✓ src/lib/coverage.test.ts (4)
 ✓ src/lib/cycles.test.ts (5)
 ✓ src/lib/deeplinks.test.ts (1)
 ✓ src/lib/descendia.test.ts (8)
 ✓ src/lib/drift.test.ts (5)
 ✓ src/lib/drops.test.ts (6)
 ✓ src/lib/enemies.test.ts (1)
 ✓ src/lib/exact.test.ts (9)
 ✓ src/lib/farm.test.ts (1)
 ✓ src/lib/farmNow.test.ts (9)
 ✓ src/lib/fav.test.ts (1)
 ✓ src/lib/format.test.ts (2)
 ✓ src/lib/freshness.test.ts (3)
 ✓ src/lib/goals.test.ts (3)
 ✓ src/lib/health.test.ts (3)
 ✓ src/lib/images.test.ts (1)
 ✓ src/lib/imgHosts.test.ts (5)
 ✓ src/lib/itemAdvice.test.ts (3)
 ✓ src/lib/lore.test.ts (4)
 ✓ src/lib/market.test.ts (4)
 ✓ src/lib/mastery.test.ts (4)
 ✓ src/lib/methods.test.ts (3)
 ✓ src/lib/pageTitle.test.ts (1)
 ✓ src/lib/part.test.ts (4)
 ✓ src/lib/partImg.test.ts (3)
 ✓ src/lib/patchlogs.test.ts (4)
 ✓ src/lib/patchsummary.test.ts (11)
 ✓ src/lib/planner.test.ts (3)
 ✓ src/lib/probe.test.ts (1)
 ✓ src/lib/refs.test.ts (3)
 ✓ src/lib/reqs.test.ts (2)
 ✓ src/lib/resources.test.ts (3)
 ✓ src/lib/rotations.test.ts (7)
 ✓ src/lib/search.golden.test.ts (2)
 ✓ src/lib/search.test.ts (5)
 ✓ src/lib/searchDocs.test.ts (7)
 ✓ src/lib/smartSearch.test.ts (8)
 ✓ src/lib/sources.test.ts (6)
 ✓ src/lib/syndicates.test.ts (6)
 ✓ src/lib/text.test.ts (3)
 ✓ src/lib/track.test.ts (2)
 ✓ src/lib/trade.test.ts (3)
 ✓ src/lib/tree.test.ts (1)
 ✓ src/lib/unlock.test.ts (6)
 ✓ src/lib/vault.test.ts (2)
 ✓ src/lib/vendor.test.ts (3)
 ✓ src/lib/vendorSources.test.ts (2) 508ms

 Test Files  59 passed (59)
      Tests  232 passed (232)
   Start at  00:22:29
   Duration  19.40s (transform 3.32s, setup 0ms, collect 6.54s, tests 1.91s, environment 37ms, prepare 20.27s)

npm notice run farmframe@0.78.0 build
npm notice run vite build
vite v5.4.21 building for production...
✓ 353 modules transformed.
dist/index.html                                                3.68 kB │ gzip:   1.65 kB
dist/assets/holdfasts-CIp5facn.webp                            4.13 kB
dist/assets/cavia-CVOVWt2e.webp                                4.15 kB
dist/assets/conclave-BukQ_BjV.webp                             4.29 kB
dist/assets/kahls-garrison-pNzD9jUC.webp                       4.52 kB
dist/assets/necraloid-T4uGP7Ee.webp                            5.26 kB
dist/assets/blade-WLNQYHlY.webp                                5.30 kB
dist/assets/entrati-BGbPKhg0.webp                              5.57 kB
dist/assets/ventkids-BKrcKAlx.webp                             5.79 kB
dist/assets/duviri-B_eVn5PP.webp                               5.88 kB
dist/assets/nightcap-CJAjaQ2B.webp                             6.02 kB
dist/assets/orbitron-latin-700-normal-4jsRXGGJ.woff2           6.53 kB
dist/assets/orbitron-latin-600-normal-mazHmDYu.woff2           6.59 kB
dist/assets/neuroptics-CH1NMTMc.webp                           6.62 kB
dist/assets/nightwave-CatVQwzP.webp                            6.86 kB
dist/assets/void-qMBbXe-x.webp                                 7.09 kB
dist/assets/neptune-BVVZxbUo.webp                              7.19 kB
dist/assets/barrel-CyoAiZIv.webp                               7.26 kB
dist/assets/ceres-UCwC2v2W.webp                                7.27 kB
dist/assets/europa-BbH1mSfx.webp                               7.59 kB
dist/assets/systems-BEGoW1AY.webp                              8.39 kB
dist/assets/barrel-prime-D8LNcRpX.webp                         8.63 kB
dist/assets/handle-D59LmFda.webp                               8.68 kB
dist/assets/orbitron-latin-700-normal-DmYOh-W9.woff            8.97 kB
dist/assets/orbitron-latin-600-normal-75H6acHo.woff            9.04 kB
dist/assets/receiver-DsLL33GL.webp                             9.62 kB
dist/assets/neuroptics-prime-CzlV1zEF.webp                     9.83 kB
dist/assets/chassis-y6N2NAfJ.webp                              9.98 kB
dist/assets/earth-B44lr22b.webp                               10.04 kB
dist/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2       10.25 kB
dist/assets/handle-prime-BwSxFqIx.webp                        10.37 kB
dist/assets/blade-prime-C5pr6HLZ.webp                         10.39 kB
dist/assets/receiver-prime-C9ThV21Q.webp                      10.47 kB
dist/assets/stock-YxnqOmPd.webp                               10.79 kB
dist/assets/kuva-fortress-DKQwzBox.webp                       11.13 kB
dist/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2        11.23 kB
dist/assets/hollvania-r46rYMX6.webp                           11.32 kB
dist/assets/mercury-Cd616sBX.webp                             11.69 kB
dist/assets/credits-CpqpObtX.png                              12.41 kB
dist/assets/venus-e2g_89Pi.webp                               12.42 kB
dist/assets/sedna-Yq8vg6Ce.webp                               12.67 kB
dist/assets/mars-AtmSSUcZ.webp                                13.95 kB
dist/assets/zariman-DgUGzAdT.webp                             14.68 kB
dist/assets/guard-prime-BMSlHi3q.webp                         15.12 kB
dist/assets/jupiter-C9xdNh0f.webp                             15.23 kB
dist/assets/saturn-B2Cm0QxU.webp                              15.37 kB
dist/assets/pluto-BLLl--Kk.webp                               15.41 kB
dist/assets/chassis-prime-B3HAzxFP.webp                       15.41 kB
dist/assets/stock-prime-WPLzcQJg.webp                         15.63 kB
dist/assets/platinum-CgcA-6n5.png                             16.41 kB
dist/assets/sentient-BHG3JDcJ.png                             16.46 kB
dist/assets/link-prime-Cx5qajGn.webp                          16.81 kB
dist/assets/deimos-CqxI2v9B.webp                              17.26 kB
dist/assets/lua-6qtBBBIB.webp                                 18.18 kB
dist/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2         18.75 kB
dist/assets/inter-greek-wght-normal-CkhJZR-_.woff2            19.00 kB
dist/assets/systems-prime-By84zN6o.webp                       19.17 kB
dist/assets/aura-DxZyKVpb.webp                                22.81 kB
dist/assets/eris-Cwjey3_X.webp                                24.04 kB
dist/assets/archon-hunt-CmlH0x0R.png                          24.59 kB
dist/assets/steel-path-honors-BlKN39Jr.png                    25.01 kB
dist/assets/phobos-TT01yGO8.webp                              25.30 kB
dist/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2     25.96 kB
dist/assets/uranus-Cr7htjYo.webp                              26.31 kB
dist/assets/duviri-BQ7QcC3h.png                               26.91 kB
dist/assets/invasions-WNuyMTi4.png                            27.72 kB
dist/assets/narmer-CVUNq4hJ.png                               29.50 kB
dist/assets/void-fissures-BNFnsf-r.jpg                        39.21 kB
dist/assets/prime-resurgence-DH_3wNVi.png                     44.03 kB
dist/assets/infested-3Pr3J0Dd.png                             45.27 kB
dist/assets/inter-latin-wght-normal-Dx4kXJAl.woff2            48.26 kB
dist/assets/sanctuary-DjwCii4M.png                            48.93 kB
dist/assets/umbra-forma-Cvrzkx6O.webp                         56.85 kB
dist/assets/forma-Ca5zOBA4.webp                               63.29 kB
dist/assets/omni-forma-BG7quv0t.webp                          64.49 kB
dist/assets/stance-forma-D66h636W.webp                        70.22 kB
dist/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2        85.07 kB
dist/assets/darvo-CAqVczdQ.png                                87.37 kB
dist/assets/acrithis-BBkbbny1.png                             94.90 kB
dist/assets/varzia-CuSnY9CB.png                               98.54 kB
dist/assets/1999-calendar-B09sTcsN.png                       105.51 kB
dist/assets/arbitration-BEgYY84u.png                         107.97 kB
dist/assets/nightwave-BBHm1DHO.png                           116.99 kB
dist/assets/orokin-BG2b-03h.png                              125.96 kB
dist/assets/teshin-BY9scz2s.png                              149.69 kB
dist/assets/grineer-B9BhBhfR.png                             159.65 kB
dist/assets/nora-night-jxULfylq.png                          180.26 kB
dist/assets/murmur-DM2KuKvW.png                              207.64 kB
dist/assets/corpus-BmuiGXP6.png                              235.88 kB
dist/assets/archon-nira-CuvECdIX.png                         335.74 kB
dist/assets/palladino-Bf5leu3J.png                           335.84 kB
dist/assets/archon-boreal-ChHUJ0lW.png                       340.78 kB
dist/assets/archimedean-yonta-B756Lx6g.png                   385.59 kB
dist/assets/archon-amar-NAm01Stt.png                         396.91 kB
dist/assets/baro-ki-teer-Ag3qg44c.png                        633.95 kB
dist/assets/amir-nightwave-B_nOg3pm.png                    2,121.07 kB
dist/assets/cephalon-simaris-CogCzJNl.png                  3,956.60 kB
dist/assets/index-DmmvslIT.css                                58.38 kB │ gzip:  12.46 kB
dist/assets/version-UkZejiap.js                                0.03 kB │ gzip:   0.05 kB
dist/assets/RarityMark-CIocqiKm.js                             0.27 kB │ gzip:   0.23 kB
dist/assets/fav-COq9UktY.js                                    0.31 kB │ gzip:   0.23 kB
dist/assets/Money-AYUGadeW.js                                  0.45 kB │ gzip:   0.29 kB
dist/assets/track-BViEV1Sa.js                                  0.53 kB │ gzip:   0.36 kB
dist/assets/trade-CH9CRgg3.js                                  0.55 kB │ gzip:   0.33 kB
dist/assets/completion-BFaDlS4T.js                             0.58 kB │ gzip:   0.37 kB
dist/assets/RelicArt-D0RGX4OX.js                               0.59 kB │ gzip:   0.41 kB
dist/assets/NotFound-B_jVNvPq.js                               0.61 kB │ gzip:   0.34 kB
dist/assets/farm-BNjXnPHV.js                                   0.61 kB │ gzip:   0.38 kB
dist/assets/VendorList-DMsps6Fs.js                             0.64 kB │ gzip:   0.36 kB
dist/assets/refs-BTKLAl_M.js                                   0.69 kB │ gzip:   0.45 kB
dist/assets/useNeeded-vzwr5izv.js                              1.13 kB │ gzip:   0.64 kB
dist/assets/useFarmNow-o15jO35w.js                             1.17 kB │ gzip:   0.68 kB
dist/assets/vault-CJJj-rw9.js                                  1.17 kB │ gzip:   0.57 kB
dist/assets/enemies-B2aO3e9z.js                                1.20 kB │ gzip:   0.64 kB
dist/assets/goals-ntjsrgvk.js                                  1.22 kB │ gzip:   0.67 kB
dist/assets/vendorSources-Ck9Eifj7.js                          1.24 kB │ gzip:   0.71 kB
dist/assets/patchlogs-DW4uOIk-.js                              1.25 kB │ gzip:   0.73 kB
dist/assets/market-CpJdLHty.js                                 1.35 kB │ gzip:   0.75 kB
dist/assets/zariman-Diwnz1SN.js                                1.38 kB │ gzip:   0.48 kB
dist/assets/useExact-Jre7-qsC.js                               1.47 kB │ gzip:   0.79 kB
dist/assets/reqs-COxXXt-A.js                                   1.72 kB │ gzip:   0.86 kB
dist/assets/useCatalog-BING5ls9.js                             1.77 kB │ gzip:   0.97 kB
dist/assets/ModCard-BIieCyMm.js                                1.86 kB │ gzip:   1.06 kB
dist/assets/syndicateInfo-CGa6JKij.js                          1.94 kB │ gzip:   0.95 kB
dist/assets/RelicCard-DhuOEDz6.js                              2.04 kB │ gzip:   1.05 kB
dist/assets/FactionArt-BJkvuGnP.js                             2.30 kB │ gzip:   1.16 kB
dist/assets/Invasions-DGs7yWfq.js                              2.46 kB │ gzip:   1.01 kB
dist/assets/Hub-Bdv7yEH3.js                                    2.77 kB │ gzip:   1.31 kB
dist/assets/SetPrice-IgApDwRR.js                               2.79 kB │ gzip:   1.26 kB
dist/assets/ui-BwfNSnmW.js                                     2.93 kB │ gzip:   1.33 kB
dist/assets/vendors-BPPvEPzi.js                                2.93 kB │ gzip:   0.97 kB
dist/assets/resources-C-kPX-9f.js                              3.06 kB │ gzip:   1.01 kB
dist/assets/OppList-CTwlqQlS.js                                3.45 kB │ gzip:   1.37 kB
dist/assets/Methods-B9NBY5iG.js                                3.46 kB │ gzip:   1.51 kB
dist/assets/KDrives-CEDOgigM.js                                3.48 kB │ gzip:   1.55 kB
dist/assets/Finder-asV2nhfq.js                                 3.50 kB │ gzip:   1.60 kB
dist/assets/build-Cpal_o-c.js                                  3.81 kB │ gzip:   1.75 kB
dist/assets/Resources-C3OiwKJC.js                              4.12 kB │ gzip:   1.77 kB
dist/assets/PartSearch-N5j15YLD.js                             4.15 kB │ gzip:   1.84 kB
dist/assets/itemAdvice-j8rHQenX.js                             4.18 kB │ gzip:   2.02 kB
dist/assets/exact-D2gKle_Q.js                                  4.25 kB │ gzip:   1.97 kB
dist/assets/Tracking-CcBHVse6.js                               4.30 kB │ gzip:   1.72 kB
dist/assets/Enemies-DIYWA-wD.js                                4.39 kB │ gzip:   1.85 kB
dist/assets/Fissures-Bdt4v4Ph.js                               4.54 kB │ gzip:   1.69 kB
dist/assets/PartArt-D80VBlW2.js                                4.74 kB │ gzip:   2.12 kB
dist/assets/Planner-CyKr271C.js                                4.93 kB │ gzip:   1.73 kB
dist/assets/farmNow-Dd4xBOrv.js                                4.96 kB │ gzip:   2.17 kB
dist/assets/Alerts-IXnjL88U.js                                 5.45 kB │ gzip:   2.06 kB
dist/assets/Farm-0MeN0oFZ.js                                   6.47 kB │ gzip:   2.68 kB
dist/assets/ItemArt-FQ2HGBly.js                                6.64 kB │ gzip:   2.85 kB
dist/assets/Profile-iChnY5dF.js                                6.93 kB │ gzip:   2.47 kB
dist/assets/Baro-BeT-ZH4g.js                                   7.15 kB │ gzip:   3.09 kB
dist/assets/Guides-Cc_MJt8N.js                                 7.32 kB │ gzip:   2.11 kB
dist/assets/Relics-kr8xo6tl.js                                 8.42 kB │ gzip:   3.22 kB
dist/assets/Explore-C6tcY8RS.js                                8.47 kB │ gzip:   3.36 kB
dist/assets/Mastery-DmDKvBLy.js                                8.48 kB │ gzip:   3.27 kB
dist/assets/Helminth-25gHLO_1.js                              11.34 kB │ gzip:   3.43 kB
dist/assets/FarmPlan-DS8PDEWa.js                              11.51 kB │ gzip:   4.12 kB
dist/assets/Part-QCyy9lET.js                                  11.88 kB │ gzip:   4.49 kB
dist/assets/Roadmap-ZgqiQO7B.js                               12.19 kB │ gzip:   4.21 kB
dist/assets/Entity-CQ1a1UBI.js                                13.04 kB │ gzip:   5.04 kB
dist/assets/Patches-BlkCiH0P.js                               13.55 kB │ gzip:   5.26 kB
dist/assets/Syndicates-C4EnV-wZ.js                            14.56 kB │ gzip:   5.14 kB
dist/assets/Lore-RJOPe_Ec.js                                  16.59 kB │ gzip:   6.24 kB
dist/assets/guides-d6wF5bT7.js                                17.68 kB │ gzip:   7.06 kB
dist/assets/Home-a1uRYXOc.js                                  19.10 kB │ gzip:   7.09 kB
dist/assets/Sources-DdcWSBoJ.js                               20.02 kB │ gzip:   7.27 kB
dist/assets/Rotations-B81TQG2E.js                             22.24 kB │ gzip:   7.07 kB
dist/assets/Builds-DQRGbI-l.js                                23.66 kB │ gzip:   8.11 kB
dist/assets/mastery-DJ0aB8XY.js                               24.40 kB │ gzip:   7.33 kB
dist/assets/helminth-DxZma-i4.js                              25.16 kB │ gzip:   8.63 kB
dist/assets/methods-BhEsLW2C.js                               30.68 kB │ gzip:   9.94 kB
dist/assets/Palette-CCX9ApUx.js                               31.90 kB │ gzip:  12.05 kB
dist/assets/DamageIcon-DeVOmol_.js                            35.58 kB │ gzip:  25.99 kB
dist/assets/SyndicateArt-B_LpiDD8.js                          45.88 kB │ gzip:  33.64 kB
dist/assets/index-Bp-RRV_v.js                                 65.49 kB │ gzip:  23.39 kB
dist/assets/syndicateWiki-B_4Z5d8e.js                        128.82 kB │ gzip:  21.10 kB
dist/assets/react-gPj3QJXm.js                                164.65 kB │ gzip:  53.73 kB
dist/assets/supabase-C4aoN11p.js                             226.78 kB │ gzip:  58.89 kB
dist/assets/imgindex-BW-lbhZD.js                             554.36 kB │ gzip: 148.23 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 25.32s

C:\Users\IK\Desktop\FarmFrame-main>
C:\Users\IK\Desktop\FarmFrame-main>added 112 packages, and audited 113 packages in 46s
"added" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>
C:\Users\IK\Desktop\FarmFrame-main>18 packages are looking for funding
"18" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>  run `npm fund` for details
"run" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>
C:\Users\IK\Desktop\FarmFrame-main>8 vulnerabilities (5 moderate, 1 high, 2 critical)
"8" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>
C:\Users\IK\Desktop\FarmFrame-main>To address all issues (including breaking changes), run:
"To" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>  npm audit fix --force
npm warn using --force Recommended protections disabled.
npm warn audit Updating vite to 8.3.4, which is a SemVer major change.
npm warn audit Updating vitest to 5.0.4, which is a SemVer major change.
npm warn audit Updating react-router-dom to 7.18.4, which is a SemVer major change.
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: farmframe@0.78.0
npm warn Found: vite@5.4.21
npm warn node_modules/vite
npm warn   peer vite@"^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0" from @vitejs/plugin-react@4.7.0
npm warn   node_modules/@vitejs/plugin-react
npm warn     dev @vitejs/plugin-react@"^4.3.1" from the root project
npm warn   4 more (@vitest/mocker, vite-node, vitest, the root project)
npm warn
npm warn Could not resolve dependency:
npm warn peer vite@"^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0" from @vitejs/plugin-react@4.7.0
npm warn node_modules/@vitejs/plugin-react
npm warn   dev @vitejs/plugin-react@"^4.3.1" from the root project

added 15 packages, removed 23 packages, changed 15 packages, and audited 105 packages in 35s

19 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

C:\Users\IK\Desktop\FarmFrame-main>
C:\Users\IK\Desktop\FarmFrame-main>Run `npm audit` for details.
"Run" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
Unknown command: "warn"

To see a list of supported npm commands, run:
  npm help

C:\Users\IK\Desktop\FarmFrame-main>npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
Unknown command: "warn"

To see a list of supported npm commands, run:
  npm help

C:\Users\IK\Desktop\FarmFrame-main>npm warn install-scripts
Unknown command: "warn"

To see a list of supported npm commands, run:
  npm help

C:\Users\IK\Desktop\FarmFrame-main>npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
El sistema no puede encontrar el archivo especificado.

C:\Users\IK\Desktop\FarmFrame-main>npm notice run farmframe@0.78.0 typecheck
Unknown command: "notice"

To see a list of supported npm commands, run:
  npm help

C:\Users\IK\Desktop\FarmFrame-main>npm notice run tsc --noEmit
Unknown command: "notice"

To see a list of supported npm commands, run:
  npm help

C:\Users\IK\Desktop\FarmFrame-main>src/lib/searchDocs.ts:7:10 - error TS6133: 'ref' is declared but its value is never read.
"src" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>
C:\Users\IK\Desktop\FarmFrame-main>7 import { ref, refOf, thingRoute } from "./refs";
"7" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>           ~~~
"~~~" no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.

C:\Users\IK\Desktop\FarmFrame-main>
C:\Users\IK\Desktop\FarmFrame-main>
C:\Users\IK\Desktop\FarmFrame-main>Found 1 error in src/lib/searchDocs.ts:7
