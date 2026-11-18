import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONNECT, hashOf, inlineScripts, injectCsp, policy } from "./csp.mjs";
const html = readFileSync("index.html", "utf8");
describe("Content Security Policy", () => {
  it("allows the one inline start-up script by hash and no other inline script", () => {
    const scripts = inlineScripts(html); expect(scripts.length).toBe(1); expect(policy(html)).toContain(hashOf(scripts[0]));
    expect(policy(html)).not.toContain("'unsafe-eval'"); expect(policy(html).match(/script-src [^;]*/)[0]).not.toContain("unsafe-inline");
  });
  it("is closed by default and forbids plugins, base tag changes and foreign forms", () => {
    const p = policy(html); expect(p).toContain("default-src 'none'"); expect(p).toContain("object-src 'none'"); expect(p).toContain("base-uri 'self'"); expect(p).toContain("form-action 'self'");
  });
  it("lets the app reach the data sources it uses, and the account service", () => {
    const code = ["src/lib/catalog.ts", "src/lib/config.ts"].map(f => readFileSync(f, "utf8")).join("\n");
    // ".invalid" is the placeholder used when the project address is not configured; it can never resolve, so it needs no permission.
    for (const host of new Set([...code.matchAll(/https:\/\/([a-z0-9.-]+)/g)].map(m => m[1]).filter(h => !h.endsWith(".invalid")))) {
      const ok = CONNECT.some(c => c === `https://${host}` || (c.startsWith("https://*.") && host.endsWith(c.slice(9))));
      expect(ok, host).toBe(true);
    }
  });
  it("is injected into the page right after the charset, once", () => {
    const out = injectCsp(html); expect(out.match(/Content-Security-Policy/g).length).toBe(1); expect(out.indexOf("Content-Security-Policy")).toBeLessThan(out.indexOf("<script"));
    expect(html).not.toContain("Content-Security-Policy");
  });
});
