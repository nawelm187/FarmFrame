import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import { CloudProvider } from "./lib/CloudProvider";
import "@fontsource-variable/inter";
import "@fontsource/orbitron/latin-600.css";
import "@fontsource/orbitron/latin-700.css";
import "./styles.css";
const root = document.getElementById("root")!;
root.setAttribute("data-ready", "1"); // proves the bundle loaded
createRoot(root).render(<StrictMode><ErrorBoundary><CloudProvider><HashRouter><App /></HashRouter></CloudProvider></ErrorBoundary></StrictMode>);
