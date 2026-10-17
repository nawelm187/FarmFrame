import type { ReactNode } from "react";
import { LANGS, setLang, useLang, useT } from "./i18n";
/** Simplified flags drawn as SVG (emoji flags show as plain letters on Windows). One flag stands for one language, not a country. */
const R = (x: number, y: number, w: number, h: number, f: string, key?: number) => <rect key={key} x={x} y={y} width={w} height={h} fill={f} />;
const FLAGS: Record<string, ReactNode> = {
  en: <>{R(0, 0, 30, 20, "#fff")}{[0, 2, 4, 6, 8, 10, 12].map(i => R(0, i * 20 / 13, 30, 20 / 13, "#B22234", i))}{R(0, 0, 12, 7 * 20 / 13, "#3C3B6E")}</>,
  es: <>{R(0, 0, 30, 20, "#AA151B")}{R(0, 5, 30, 10, "#F1BF00")}</>,
  pt: <>{R(0, 0, 30, 20, "#009C3B")}<path d="M15 2 28 10 15 18 2 10z" fill="#FFDF00" /><circle cx="15" cy="10" r="4.2" fill="#002776" /></>,
  fr: <>{R(0, 0, 10, 20, "#0055A4")}{R(10, 0, 10, 20, "#fff")}{R(20, 0, 10, 20, "#EF4135")}</>,
  de: <>{R(0, 0, 30, 7, "#000")}{R(0, 7, 30, 6.5, "#DD0000")}{R(0, 13.5, 30, 6.5, "#FFCE00")}</>,
  it: <>{R(0, 0, 10, 20, "#008C45")}{R(10, 0, 10, 20, "#fff")}{R(20, 0, 10, 20, "#CD212A")}</>,
  ru: <>{R(0, 0, 30, 7, "#fff")}{R(0, 7, 30, 6.5, "#0039A6")}{R(0, 13.5, 30, 6.5, "#D52B1E")}</>,
  zh: <>{R(0, 0, 30, 20, "#DE2910")}<path d="m5 2.5 1.2 3.7h3.9l-3.2 2.3 1.2 3.7L5 9.9l-3.1 2.3 1.2-3.7L-.1 6.2h3.9z" fill="#FFDE00" /></>,
  ja: <>{R(0, 0, 30, 20, "#fff")}<circle cx="15" cy="10" r="6" fill="#BC002D" /></>,
};
/** Language flags, always at the top of every page. Choosing one loads that language and keeps it for next visit. */
export default function LangBar() {
  const cur = useLang(), t = useT();
  return (<div className="langbar" role="group" aria-label={t("langLabel")} title={t("langNote")}>
    {LANGS.map(l => <button key={l.code} type="button" className={"flag" + (l.code === cur ? " on" : "")} aria-pressed={l.code === cur} aria-label={l.name} title={l.name} lang={l.code} onClick={() => void setLang(l.code)}>
      <svg viewBox="0 0 30 20" width="24" height="16" aria-hidden="true">{FLAGS[l.code]}</svg></button>)}
  </div>);
}
