import type { ReactNode } from "react";
import { DamageIcon } from "./DamageIcon";
import { rich } from "./lib/text";
/** Game description text with damage types as icons. Values the data source does not provide are shown as such, never invented. */
export default function GameText({ t }: { t: string }) {
  const toks = rich(t), out: ReactNode[] = [];
  toks.forEach((k, i) => {
    if (k.k === "dmg") out.push(<DamageIcon key={i} type={k.v} />);
    else if (k.k === "unk") { out.push(<span key={i} className="unk" title="The community data source does not provide this value">value unavailable</span>); const nx = toks[i + 1]; if (nx && nx.k === "t" && nx.v.startsWith("%")) nx.v = nx.v.slice(1); }
    else out.push(k.v);
  });
  return <>{out}</>;
}
