import { useState } from "react";
import { GH_ALT, GH_RAW, GH_SRC, imgUrl } from "./lib/catalog";
import { parseCurrency } from "./lib/currency";
import { useMany } from "./lib/data";
function useArt() {
  const [{ rec }] = useMany([{ id: "f:Misc.json", file: "", url: GH_RAW + "Misc.json", alt: GH_ALT + "Misc.json", src: GH_SRC, win: 86_400_000 }]);
  return parseCurrency(rec?.data);
}
const Coin = ({ size, color, label }: { size: number; color: string; label: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={label}><circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" /><circle cx="12" cy="12" r="4" fill={color} fillOpacity=".35" /></svg>
);
function Money({ n, size, file, label, color }: { n: number | string; size: number; file?: string; label: string; color: string }) {
  const [bad, setBad] = useState(false);
  return (<span className="money">{n}{file && !bad
    ? <img src={imgUrl(file)} alt={label} width={size} height={size} decoding="async" onError={() => setBad(true)} />
    : <Coin size={size} color={color} label={label} />}</span>);
}
/** A platinum amount: the number followed by the platinum icon. */
export const Plat = ({ n, size = 16 }: { n: number | string; size?: number }) => <Money n={n} size={size} file={useArt()?.platinum} label="platinum" color="#9CC7E6" />;
/** A credits amount: the number followed by the credits icon. */
export const Credits = ({ n, size = 16 }: { n: number | string; size?: number }) => <Money n={n} size={size} file={useArt()?.credits} label="credits" color="#C9A24E" />;
