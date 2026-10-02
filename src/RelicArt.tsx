import { useState } from "react";
import { TierIcon } from "./Icons";
import { imgUrl } from "./lib/catalog";
import { useMany } from "./lib/data";
import { VAULT_ALT, VAULT_SRC, VAULT_URL, parseRelicImages } from "./lib/vault";
/** Real relic artwork from the warframe-items data; falls back to the tier emblem when an image is missing or fails to load. */
export default function RelicArt({ tier, name, size = 32 }: { tier: string; name?: string; size?: number }) {
  const [{ rec }] = useMany([{ id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }]);
  const [bad, setBad] = useState<string | null>(null);
  const im = parseRelicImages(rec?.data), file = (name ? im?.byRelic.get(name) : undefined) ?? im?.byTier.get(tier);
  if (!file || bad === file) return <TierIcon tier={tier} size={size} />;
  return <img className="relic-img" src={imgUrl(file)} alt={`${tier} relic`} width={size} height={size} loading="lazy" decoding="async" onError={() => setBad(file)} />;
}
