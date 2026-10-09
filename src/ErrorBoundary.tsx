import { Component, type ErrorInfo, type ReactNode } from "react";
/** Last safety net. Visitors get a plain message; the technical text is folded away for whoever reports the problem. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error, info: ErrorInfo) { console.error("FarmFrame crashed:", err, info.componentStack); }
  render() {
    const { err } = this.state;
    if (!err) return this.props.children;
    return (<main style={{ padding: "1.5rem", maxWidth: "50rem" }}><h1>Something went wrong on our side</h1>
      <p className="muted">The page could not be drawn. Your saved goals and progress are still in this browser. Reloading usually fixes it; if it keeps happening, please report it with the details below.</p>
      <p><button className="btn" onClick={() => location.reload()}>Reload the page</button> <a className="btn" href="./">Go to Home</a></p>
      <details className="err-details"><summary>Technical details</summary>
        <pre style={{ whiteSpace: "pre-wrap", color: "#C0524A" }}>{err.name}: {err.message}{"\n"}{err.stack}</pre></details></main>);
  }
}
