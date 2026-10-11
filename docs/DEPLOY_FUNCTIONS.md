# Deploying the worldstate function to Supabase

Project reference: `ibhhtmbgdksriyaecclg` (the one in `src/lib/config.ts`).

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
`build-analysis` only answers browsers on `https://nawelm187.github.io` and local dev (`localhost:5173`, `localhost:4173`). When you move to your own domain, add it as a secret before switching:
`supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com` (comma separated for several). It keeps JWT verification **on** and also needs `ANTHROPIC_API_KEY`.
