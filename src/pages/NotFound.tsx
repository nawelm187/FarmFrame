import { Link, useLocation } from "react-router-dom";
import { useLang, useT } from "../i18n";
/** Shown for any address that is not a page. Says what was not found instead of silently showing Home. */
export default function NotFound() {
  const { pathname } = useLocation(), t = useT(), lang = useLang();
  // The list "Home, Explore, Farm or Plan" is joined by the browser in the reader's language (commas, "or", "o", "ou", "或"...).
  const links = [["/", "home"], ["/explore", "explore"], ["/farm", "farm"], ["/plan", "plan"]] as const;
  const list = new Intl.ListFormat(lang, { type: "disjunction" }).formatToParts(links.map((_, i) => String(i)));
  return (<><h1>{t("nfTitle")}</h1><p className="lead">{t("nfNoPage")} <code>{pathname}</code>.</p>
    <p className="muted">{t("nfHint")} {list.map((p, k) => (p.type === "element" ? <Link key={k} to={links[+p.value][0]}>{t(links[+p.value][1])}</Link> : p.value))}.</p></>);
}
