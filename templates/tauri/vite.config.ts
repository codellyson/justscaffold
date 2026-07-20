import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Match the `@/*` path mapping in tsconfig.app.json so TS and Vite agree
    // on what `@/lib/commands` resolves to.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // strictPort makes Vite refuse to silently fall back to another port if
    // 3030 is busy. Falling back would desync from tauri.conf.json's devUrl
    // and produce a white-screen webview that looks like an app bug.
    port: 3030,
    strictPort: true,
  },
  build: {
    target: "es2020",
    sourcemap: true,
  },
});
