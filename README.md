# FarmFrame

Unofficial, fan-made Warframe companion: what you are missing, what to farm next, where, and why. Not affiliated with Digital Extremes.

Live site: https://nawelm187.github.io/FarmFrame/

## Run it

```
npm ci
npm run dev        # local site
npm run typecheck  # types
npm test           # tests
npm run build      # production build into dist/
```

Stack: Vite, React 18, TypeScript, hash routes (`/#/roadmap`), Supabase for optional sign-in. Progress is saved in the browser (localStorage) unless you sign in.

## Where things are

| Folder | What lives there |
|---|---|
| `src/pages/` | One file per page |
| `src/data/` | Hand-typed, dated data (Helminth, guides, vendors, syndicates, mastery) with tests |
| `src/lib/` | Logic without screens: search, sources, mastery, syndicates, alerts |
| `src/assets/` | Your own pictures. Each folder has a `LEEME.txt` with the naming rule |
| `docs/` | Notes: deploy, images, security, best practices |
| `public/` | `robots.txt`, `sitemap.xml` |
| `legacy/` | The old single-file version, kept only for reference |

## Rules the project follows

- Nothing is invented. If a number is not known, the page says so. Hand-typed data carries its source URL and date, and tests check it.
- No secrets in the repo. Only the public Supabase anon key lives in `src/lib/config.ts`.
- Reuse before creating: shared pieces are in `src/ui.tsx` (page header, section tabs, meters).
- Changes are listed in [CHANGELOG.md](CHANGELOG.md). The checklist we follow is in [docs/BUENAS_PRACTICAS.md](docs/BUENAS_PRACTICAS.md).

## Publishing

GitHub Actions builds `dist/` and publishes it (Settings > Pages > Source: GitHub Actions). `ci.yml` blocks on types, tests and build; `deploy.yml` still lets types and tests report without blocking.
