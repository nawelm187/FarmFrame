// Content Security Policy for the published site. GitHub Pages cannot send HTTP headers, so the policy goes in a <meta> tag.
// The hash of the small inline start-up script is computed at build time, so editing that script never breaks the policy.
// Only the build gets it (see vite.config.ts): the dev server needs inline scripts that this policy would block.
import { createHash } from "node:crypto";
/** Every origin the app fetches data from. Images may come from any https site, scripts only from the app itself. */
export const CONNECT = ["https://raw.githubusercontent.com", "https://cdn.jsdelivr.net", "https://api.warframestat.us", "https://drops.warframestat.us", "https://wiki.warframe.com", "https://*.supabase.co"];
export const inlineScripts = html => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
export const hashOf = code => `'sha256-${createHash("sha256").update(code).digest("base64")}'`;
export const policy = html => ["default-src 'none'", `script-src 'self' ${inlineScripts(html).map(hashOf).join(" ")}`.trim(), "style-src 'self' 'unsafe-inline'", "img-src 'self' data: https:", "font-src 'self' data:", `connect-src 'self' ${CONNECT.join(" ")}`, "base-uri 'self'", "form-action 'self'", "object-src 'none'", "manifest-src 'self'"].join("; ");
export const injectCsp = html => html.replace('<meta charset="utf-8">', `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy(html)}"><meta name="referrer" content="strict-origin-when-cross-origin">`);
