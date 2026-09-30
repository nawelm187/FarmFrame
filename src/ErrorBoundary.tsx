import { Component, type ErrorInfo, type ReactNode } from "react";
export default class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error, info: ErrorInfo) { console.error("FarmFrame crashed:", err, info.componentStack); }
  render() {
    const { err } = this.state;
    if (!err) return this.props.children;
    return (<main style={{ padding: "1.5rem", maxWidth: "50rem" }}><h1>Something broke</h1>
      <p className="muted">FarmFrame hit an error while rendering. Copy the text below when reporting it.</p>
      <pre style={{ whiteSpace: "pre-wrap", color: "#C0524A" }}>{err.name}: {err.message}{"\n"}{err.stack}</pre>
      <button className="btn" onClick={() => location.reload()}>Reload</button></main>);
  }
}
