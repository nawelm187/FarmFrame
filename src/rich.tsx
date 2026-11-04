import { Fragment, type ReactNode } from "react";
/** Puts components (a price, a link) inside a translated sentence: each {name} in the text is replaced by its node, in whatever order the language needs. */
export const rich = (s: string, v: Record<string, ReactNode>) => s.split(/(\{\w+\})/).map((p, i) => { const m = /^\{(\w+)\}$/.exec(p); return m && m[1] in v ? <Fragment key={i}>{v[m[1]]}</Fragment> : p; });
