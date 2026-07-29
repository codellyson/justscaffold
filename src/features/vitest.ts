import type { FeatureModule } from "../core/types.js";

export const vitest: FeatureModule = {
  id: "vitest",
  title: "Vitest",
  hint: "test runner with a passing example spec",
  // The tauri template is a workspace and ships its own vitest in apps/web, so
  // a root-level config here would only collide with it.
  appliesTo: ["lib", "cli", "mcp", "api"],
  recommended: true,

  pkg: () => ({
    scripts: {
      test: "vitest run",
      "test:watch": "vitest",
    },
    devDependencies: {
      vitest: "^2.1.0",
    },
  }),

  files: () => [
    {
      path: "vitest.config.ts",
      contents: `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});
`,
    },
    {
      path: "test/smoke.test.ts",
      contents: `import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(true).toBe(true);
  });
});
`,
    },
  ],
};
