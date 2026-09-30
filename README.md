# FarmFrame v0.5 (Vite + React + TypeScript)
Static site for GitHub Pages. Hash routes (`/#/fissures`) so deep links survive refresh without server config.

Deploy: push to `main`, then Settings > Pages > Source: **GitHub Actions**. The workflow runs tests, type-check and build.
Local: `npm install && npm run dev`. Previous single-file version kept in `legacy/`.
Ported: World State, Fissures, Invasions, Relics, Resource Finder, Tracking, Search, Sources, catalog with deep links. New: Goals + Roadmap (`/#/roadmap`) with manual progress and a first "Farm now" based on active fissures.
