import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// base "./" works under any GitHub Pages repo path.
export default defineConfig({ base: "./", plugins: [react()] });
