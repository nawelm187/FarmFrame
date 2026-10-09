import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { titleFrom } from "./lib/pageTitle";
/** Sets the tab title from the page's own <h1> and moves keyboard/screen-reader focus to the page when you change page. Lazy pages render a moment later, so it looks a few times. */
export default function usePageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    let done = false;
    const apply = () => {
      const h1 = document.querySelector("main h1");
      document.title = titleFrom(h1?.textContent);
      if (h1 && !done) { done = true; const m = document.getElementById("main"); if (m && !location.hash.includes("?s=")) m.focus({ preventScroll: true }); }
    };
    const ids = [60, 400, 1500].map(ms => window.setTimeout(apply, ms));
    return () => ids.forEach(clearTimeout);
  }, [pathname]);
}
