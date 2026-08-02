import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// Chrome injects content scripts as classic scripts, not modules: an ESM
// bundle here loads and then does nothing, with no error anywhere you would
// think to look. A second build is the price of getting one IIFE out of a
// toolchain whose other entries are modules.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // The main build owns dist/ and runs first; copying public/ again here would
  // just race it.
  publicDir: false,
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: fileURLToPath(new URL("./src/content/index.ts", import.meta.url)),
      formats: ["iife"],
      name: "__CONST_NAME___CONTENT",
      fileName: () => "content.js",
    },
  },
});
