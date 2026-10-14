/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// base "./" works under any GitHub Pages repo path.
// Tests: only the TypeScript tests under src. An old test/ folder left over from the pre-Vite site (test/logic.test.js) must not run.
// React and the router go in their own file so a new deploy of the app code does not make visitors download them again.
export default defineConfig({ base: "./", plugins: [react()], build: { rollupOptions: { output: { manualChunks: { react: ["react", "react-dom", "react-router-dom"] } } } }, test: { include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.mjs"], exclude: ["node_modules", "dist", "test", "legacy"] } });
