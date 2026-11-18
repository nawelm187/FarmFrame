import { ChangedAnswer, GoalAnswer, ItemAnswer, LoreAnswer, MethodAnswer, NowAnswer, WhatAnswer } from "./SearchAnswers";
import ModsAnswer from "./ModsAnswer";
import type { AnswerEngine } from "./lib/useAnswerEngine";
/** The answer cards for one question. `go` runs after a link inside a card is followed (the search closes itself). */
export default function AnswerCards({ e, go }: { e: AnswerEngine; go: () => void }) {
  const { intent, loreHit, methods, u, whatName, info, itemName, target, top } = e;
  return (<div className="answers">{intent?.kind === "now" && <NowAnswer go={go} />}{intent?.kind === "changed" && <ChangedAnswer go={go} />}{intent?.kind === "mods" && <ModsAnswer key={"m" + intent.subject} subject={intent.subject} go={go} />}{intent?.kind === "lore" && <LoreAnswer key={"l" + intent.subject} subject={intent.subject} hit={loreHit} go={go} />}{methods && <MethodAnswer key={methods.map(m => m.id).join()} methods={methods} subject={intent?.kind === "method" ? u.material ?? intent.subject : ""} go={go} />}{whatName && <WhatAnswer key={"w" + whatName} name={whatName} info={info} go={go} />}{itemName && <ItemAnswer key={itemName} name={itemName} go={go} info={info} />}{target && top && <GoalAnswer key={top.doc.to} cat={target.cat} slug={target.slug} name={top.doc.title} go={go} />}</div>);
}
