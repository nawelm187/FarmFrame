# FarmFrame v0.15 (relic vault status from a separate community dataset; unknown when missing)
<!-- v0.14.1 --> (version label on Home and Sources to tell which build is live)
<!-- v0.14 --> (Vite + React + TypeScript)
Static build, hash routes (`/#/roadmap`), no backend yet. Works on any static host; a custom domain can be used later.

Local: `npm install && npm run dev` (tests: `npm test`, types: `npm run typecheck`, build: `npm run build` -> `dist/`).
Test host: the included GitHub Actions workflow builds and publishes `dist/` (Settings > Pages > Source: GitHub Actions). Type-check and tests report but do not block publishing while iterating.
Errors: a crash shows the error text on the page instead of a blank screen. Previous single-file version is in `legacy/`. v0.14: builds count Forma from slot polarity overrides and send it to Tracking. v0.13: build requirements (owned/missing mods, endo estimate) sent to Tracking so Home and Farm pick them up. v0.12: Home restructured; "What should I farm right now?" from goals + live fissures/invasions. v0.11: Builds MVP (`/#/builds`): mod slots, capacity and validation. v0.10: ranked farming page (`/#/farm/<item>`) with stacking against your goals. v0.9: nested requirements tree, summed resources and a Master checklist on the Roadmap.
