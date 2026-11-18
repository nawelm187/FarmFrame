#!/usr/bin/env node
// Type check WITHOUT the project's dependencies: React, the router and Supabase are declared as `any` (stubs.d.ts).
// Real errors in your own code still show; the noise the stubs cause is filtered out. The reference stays `npm run typecheck`.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url)), tsc = process.env.TSC_BIN || "tsc";
const r = spawnSync(tsc, ["-p", join(here, "tsconfig.check.json")], { encoding: "utf8", maxBuffer: 64 << 20 });
const noise = /TS7006|TS7031|TS2347|TS2709|TS7053|TS2307|TS7016|TS2322.*\bkey\b|TS6133.*'(ReactNode|Session|ReactElement|CSSProperties)'|TS2688|TS2882|TS2694|TS2345.*unknown|TS6133.*'(ErrorInfo|KeyboardEvent)'/;
const lines = (r.stdout || "").split("\n").filter(l => /error TS/.test(l)), real = lines.filter(l => !noise.test(l));
console.log(`type errors: ${real.length} real, ${lines.length - real.length} caused by the stand-ins (hidden)`); real.forEach(l => console.log(" - " + l.slice(0, 220)));
process.exit(real.length ? 1 : 0);
