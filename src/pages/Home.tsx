import { Link } from "react-router-dom";
import { useWorld } from "../lib/data";
import { ts } from "../lib/format";
import { Countdown, Panel, Unavailable } from "./parts";
interface Cyc { state: string; expiry: string }
const isCyc = (d: unknown): d is Cyc => !!d && typeof d === "object" && typeof (d as Cyc).state === "string" && typeof (d as Cyc).expiry === "string";
interface Fis { id: string; expiry: string }
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
function Cycle({ title, k }: { title: string; k: string }) {
  const { data, status, rec } = useWorld(k, isCyc);
  if (!data) return <Unavailable title={title} status={status} why={rec?.err ? "Request failed." : "Waiting for data."} rec={rec} />;
  if (ts(data.expiry) < Date.now()) return <Unavailable title={title} status="STALE" why="Cycle data expired; refreshing." rec={rec} />;
  return <Panel title={title} status={status} rec={rec}><b>{data.state}</b><br /><Countdown exp={data.expiry} pre="ends in " /></Panel>;
}
function FissureCount() {
  const { data, status, rec } = useWorld("fissures", isFis);
  if (!data) return <Unavailable title="Void Fissures" status={status} why="No verified data." rec={rec} />;
  return <Panel title="Void Fissures" status={status} rec={rec}><div className="big">{data.filter(f => ts(f.expiry) > Date.now()).length} active</div><Link to="/fissures">Open fissure list</Link></Panel>;
}
export default function Home() {
  return (
    <>
      <h1>FarmFrame</h1>
      <p className="lead">Live Warframe data with visible provenance and freshness. Timers count down to the exact expiry supplied by the source.</p>
      <div className="grid">
        <Cycle title="Cetus (Plains)" k="cetusCycle" /><Cycle title="Orb Vallis" k="vallisCycle" />
        <Cycle title="Cambion Drift" k="cambionCycle" /><Cycle title="Zariman" k="zarimanCycle" />
        <FissureCount />
      </div>
    </>
  );
}
