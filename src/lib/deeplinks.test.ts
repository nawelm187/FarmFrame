import { expect, it } from "vitest";
import { PAGES } from "./search";
const files = import.meta.glob("../App.tsx", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
/** Every page the search offers must be a real route, so a search result never lands on "Page not found". */
it("search pages point at routes that exist in App.tsx", () => {
  const app = Object.values(files)[0] ?? "";
  expect(app.length > 100).toBe(true);
  for (const [to] of PAGES) { const path = to.split("?")[0]; expect(app.includes(`"${path}"`) || app.includes(`path={\`${path}`), path).toBe(true); }
});
