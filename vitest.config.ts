import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Smoke tests shell out to `npm install` + `tsc` for every template/feature
    // combination, which is far slower than the 5s default.
    testTimeout: 300_000,
    hookTimeout: 300_000,
  },
});
