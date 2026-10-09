/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// base "./" works under any GitHub Pages repo path.
// Tests: only the TypeScript tests under src. An old test/ folder left over from the pre-Vite site (test/logic.test.js) must not run.
export default defineConfig({ base: "./", plugins: [react()], test: { include: ["src/**/*.test.ts", "src/**/*.test.tsx"], exclude: ["node_modules", "dist", "test", "legacy"] } });
