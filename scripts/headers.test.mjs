import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const text = readFileSync("public/_headers", "utf8"), lines = text.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
describe("public/_headers (read by Cloudflare Pages and Netlify)", () => {
  it("forbids embedding the site and sets the basic protective headers", () => {
    expect(text).toContain("frame-ancestors 'none'"); expect(text).toContain("X-Frame-Options: DENY"); expect(text).toContain("X-Content-Type-Options: nosniff");
    expect(text).toContain("Referrer-Policy:"); expect(text).toContain("Permissions-Policy:"); expect(text).toContain("Strict-Transport-Security:");
  });
  it("respects Cloudflare Pages limits (100 rules, 2000 characters per line)", () => {
    expect(lines.length).toBeLessThanOrEqual(100); expect(lines.every(l => l.length <= 2000)).toBe(true);
  });
  it("does not weaken the page policy: the header carries only frame-ancestors, never a script or connect rule", () => {
    const csp = lines.filter(l => l.trim().startsWith("Content-Security-Policy:")); expect(csp.length).toBe(1); expect(csp[0]).not.toMatch(/script-src|connect-src|default-src|unsafe/);
  });
});
