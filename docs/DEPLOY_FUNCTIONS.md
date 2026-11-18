# Deploying the worldstate function to Supabase

Project reference: `ibhhtmbgdksriyaecclg` (the one in `src/lib/config.ts`). If the project was paused or you created a new one, follow `docs/SUPABASE_DESDE_CERO.md` first and use your new reference everywhere below.

## Option A: from the Supabase website (no installs)
1. Go to https://supabase.com/dashboard and open your project.
2. Left menu: **Edge Functions**.
3. Click **Deploy a new function** and choose **Via Editor**.
4. Delete the sample code and paste the full contents of `supabase/functions/worldstate/index.ts`.
5. Name the function exactly `worldstate` and click **Deploy function**.
6. Open the function, go to **Details** (or **Settings**) and turn **off** "Enforce JWT verification" (verify JWT). FarmFrame calls it with the public key only. Save.
7. Test: open `https://ibhhtmbgdksriyaecclg.supabase.co/functions/v1/worldstate` in the browser. You should see a list of fissures as JSON.
8. In FarmFrame, open Data Sources and press "Check all now".

## Option B: command line
1. Install Node.js, then `npm install -g supabase`.
2. `supabase login`
3. In the project folder: `supabase link --project-ref ibhhtmbgdksriyaecclg`
4. `supabase functions deploy worldstate --no-verify-jwt`

The `market` function is deployed the same way (its code is in `supabase/functions/market/index.ts`).

## build-analysis (AI) and allowed origins
Since v0.109 the web app sends the person's language to `build-analysis` and the function asks the AI to answer in it (only the 9 languages of the app are accepted; anything else is English). Redeploy this function to get replies in the person's language; an older deployed version keeps answering in English and nothing breaks.

`build-analysis` only answers browsers on `https://nawelm187.github.io` and local dev (`localhost:5173`, `localhost:4173`). When you move to your own domain, add it as a secret before switching:
`supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com` (comma separated for several). It keeps JWT verification **on** and also needs `ANTHROPIC_API_KEY`.

## Security rules every function follows (v0.123)
`market` and `worldstate` answer only the FarmFrame site (and localhost) when a browser asks, accept only GET, and slow down a flood from one address. `build-analysis` keeps JWT verification **on**, checks the person again with the auth service, and answers 401 to anyone else. `build-analysis` also spends a daily quota before the paid call and refuses to answer when the quota cannot be checked. Secrets: `ANTHROPIC_API_KEY`, optional `AI_DAILY_PER_USER`, `AI_DAILY_GLOBAL`, `ALLOWED_ORIGINS`. The full reasoning is in `docs/SEGURIDAD.md`. Every error carries the right HTTP number and a stable `code`: see `docs/ERRORES.md`. `market` also keeps a 5 minute copy and a shared limit of 2 requests per second towards warframe.market (its API allows about 3).
