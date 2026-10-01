# FarmFrame v0.30 (full Prime set price on item pages and builds, with comparison against buying the parts)
<!-- v0.29 --> (relic expected platinum value from live market medians; market check only for tradable parts)
<!-- v0.28 --> (market price through a Supabase Edge Function; deploy supabase/functions/market)
<!-- v0.27 --> (build types: weapons, companions, archwing; strict mod compatibility; omni forma counted apart; market button off)
<!-- v0.26 --> (ducats per component, on-demand market price check labeled as dynamic market value)
<!-- v0.25 --> (build statistics from mod percentages with Explain; conditional effects reported, not guessed)
<!-- v0.24 --> (IndexedDB cache for large datasets with stale fallback, route code splitting)
<!-- v0.23 --> (accounts and cloud sync via Supabase; run supabase/schema.sql once; RLS protects per-user data)
<!-- v0.22 --> (Planner: sortie, archon hunt, steel path, nightwave, void trader with relevance to your goals; value label)
<!-- v0.21 --> (real relic artwork from warframe-items imageName, tier emblem only as fallback)
<!-- v0.20 --> (original relic tier emblems, tier filter bar in Fissures, faction markers in Invasions)
<!-- v0.19 --> (item page composition: art right with fade, large stats, depth levels)
<!-- v0.18 --> (logo + favicon, SVG nav icons, angular panels, lighter world-state strip)
<!-- v0.17 --> (skeleton loading states, Retry on failed data, honest loading vs error in Finder)
<!-- v0.16 --> (arcane slots in builds, counted in requirements and Tracking)
<!-- v0.15.1 --> (vault data now read from the warframe-items file, api /relics returned 404) (relic vault status from a separate community dataset; unknown when missing)
<!-- v0.14.1 --> (version label on Home and Sources to tell which build is live)
<!-- v0.14 --> (Vite + React + TypeScript)
Static build, hash routes (`/#/roadmap`), no backend yet. Works on any static host; a custom domain can be used later.

Local: `npm install && npm run dev` (tests: `npm test`, types: `npm run typecheck`, build: `npm run build` -> `dist/`).
Test host: the included GitHub Actions workflow builds and publishes `dist/` (Settings > Pages > Source: GitHub Actions). Type-check and tests report but do not block publishing while iterating.
Errors: a crash shows the error text on the page instead of a blank screen. Previous single-file version is in `legacy/`. v0.14: builds count Forma from slot polarity overrides and send it to Tracking. v0.13: build requirements (owned/missing mods, endo estimate) sent to Tracking so Home and Farm pick them up. v0.12: Home restructured; "What should I farm right now?" from goals + live fissures/invasions. v0.11: Builds MVP (`/#/builds`): mod slots, capacity and validation. v0.10: ranked farming page (`/#/farm/<item>`) with stacking against your goals. v0.9: nested requirements tree, summed resources and a Master checklist on the Roadmap.
