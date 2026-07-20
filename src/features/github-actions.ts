import type { FeatureModule } from "../core/types.js";

export const githubActions: FeatureModule = {
  id: "github-actions",
  title: "GitHub Actions CI",
  hint: "typecheck + build on push and PR",
  appliesTo: "*",
  recommended: true,

  files: (ctx) => {
    const testStep = ctx.features.includes("vitest")
      ? `
      - name: Test
        run: npm test
`
      : "";

    return [
      {
        path: ".github/workflows/ci.yml",
        contents: `# Cheap by design: typecheck and build only. Every step here should stay
# fast enough that contributors never wait on it.
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install
        run: npm ci || npm install

      - name: Typecheck
        run: npm run lint

      - name: Build
        run: npm run build
${testStep}`,
      },
    ];
  },
};
