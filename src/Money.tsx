import credits from "./assets/credits.png";
import platinum from "./assets/platinum.png";
import { useT } from "./i18n";
const Money = ({ n, size, src, label }: { n: number | string; size: number; src: string; label: string }) => (
  <span className="money">{n}<img src={src} alt={label} height={size} decoding="async" /></span>
);
/** A platinum amount: the number followed by the official platinum icon. */
export const Plat = ({ n, size = 16 }: { n: number | string; size?: number }) => { const t = useT(); return <Money n={n} size={size} src={platinum} label={t("mnPlat")} />; };
/** A credits amount: the number followed by the official credits icon. */
export const Credits = ({ n, size = 16 }: { n: number | string; size?: number }) => { const t = useT(); return <Money n={n} size={size} src={credits} label={t("mnCredits")} />; };
