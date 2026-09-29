# FarmFrame (v0.4)
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
Drop-table parsers (relics, missions, enemy blueprints and items, mods, Cetus/Fortuna/Zariman bounties, sorties, objectives, syndicates) follow the structures documented in the WFCD/warframe-drop-data README and were tested with mocked data only. `resourceByAvatar.json` is not documented there, so its parser is tolerant and ignored if the shape is not recognised. If a table fails validation the page shows an explicit gap instead of guessing.
Archon Hunt has not been checked against a live response.

## Tests
`node test/logic.test.js` (Node 22; uses mocked fetch, needs no network).

## Not included yet
Item catalog, builds, market, dependency trees, AI analysis, and drops from systems outside the official tables (vendors, crafting, trading).
