# FarmFrame (v0.3)
Static site: no build step, no backend. It fetches live data from the browser.

## Publish on GitHub Pages
1. Create a repo and upload `index.html` (and optionally `test/`).
2. Settings > Pages > Deploy from branch > `main` / root.
3. Open the Pages URL.

## Data sources
- World state: https://api.warframestat.us/pc/{resource} (community API, unofficial).
- Relics and mission drops: https://drops.warframestat.us/data/ (official drop tables, parsed by WFCD).

## What is verified
World state shapes (fissures, cycles, sortie, nightwave, invasions, void trader, steel path, arbitration) were checked against live responses.
Relic and mission-reward parsers follow the published format of the drop-data repo and were tested with mocked data only. If a table fails validation the page shows an explicit gap instead of guessing.
Archon Hunt has not been checked against a live response.

## Tests
`node test/logic.test.js` (Node 22; uses mocked fetch, needs no network).

## Not included yet
Enemy/bounty/vendor drops, item catalog, builds, market, dependency trees, AI analysis.
