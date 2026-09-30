# FarmFrame v0.8.1 (Vite + React + TypeScript)
Static build, hash routes (`/#/roadmap`), no backend yet. Works on any static host; a custom domain can be used later.

Local: `npm install && npm run dev` (tests: `npm test`, types: `npm run typecheck`, build: `npm run build` -> `dist/`).
Test host: the included GitHub Actions workflow builds and publishes `dist/` (Settings > Pages > Source: GitHub Actions). Type-check and tests report but do not block publishing while iterating.
Errors: a crash shows the error text on the page instead of a blank screen. Previous single-file version is in `legacy/`.
