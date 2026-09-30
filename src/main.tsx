import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "./styles.css";
const root = document.getElementById("root")!;
root.setAttribute("data-ready", "1"); // proves the bundle loaded
createRoot(root).render(<StrictMode><ErrorBoundary><HashRouter><App /></HashRouter></ErrorBoundary></StrictMode>);
