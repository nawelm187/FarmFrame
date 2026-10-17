import { Component, type ErrorInfo, type ReactNode } from "react";
import { t } from "./i18n";
/** Last safety net. Visitors get a plain message; the technical text is folded away for whoever reports the problem. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error, info: ErrorInfo) { console.error("FarmFrame crashed:", err, info.componentStack); }
  render() {
    const { err } = this.state;
    if (!err) return this.props.children;
    return (<main style={{ padding: "1.5rem", maxWidth: "50rem" }}><h1>{t("errTitle")}</h1>
      <p className="muted">{t("errBody")}</p>
      <p><button className="btn" onClick={() => location.reload()}>{t("errReload")}</button> <a className="btn" href="./">{t("errHome")}</a></p>
      <details className="err-details"><summary>{t("errDetails")}</summary>
        <pre style={{ whiteSpace: "pre-wrap", color: "#C0524A" }}>{err.name}: {err.message}{"\n"}{err.stack}</pre></details></main>);
  }
}
