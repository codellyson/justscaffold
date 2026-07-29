import type { FeatureModule, FileOp, ScaffoldContext } from "../core/types.js";

// Tauri needs GTK/webkit headers to compile on Linux runners; without these the
// job fails inside a C build with an error that looks nothing like a Rust one.
const LINUX_TAURI_DEPS = `      - name: Install Linux webview dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
`;

// tauri and web are pnpm workspaces; everything else is a single npm package.
// Keeping the two install/build stanzas apart is clearer than a forest of
// conditionals inside one.
const MONOREPO_TEMPLATES = new Set<string>(["tauri", "web"]);

function jsJob(ctx: ScaffoldContext): string {
  if (MONOREPO_TEMPLATES.has(ctx.template)) {
    return `  js:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile || pnpm install

      - name: Typecheck
        run: pnpm -r --parallel lint

      - name: Build
        run: pnpm -r --parallel build

      - name: Test
        run: pnpm -r --parallel test
`;
  }

  const testStep = ctx.features.includes("vitest")
    ? `
      - name: Test
        run: npm test
`
    : "";

  return `  js:
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
${testStep}`;
}

function ciWorkflow(ctx: ScaffoldContext): string {
  // cargo check, not cargo build: it catches type and borrow errors — which is
  // what breaks when a template drifts — without paying for codegen or the full
  // bundling toolchain.
  const rustJob =
    ctx.template === "tauri"
      ? `
  rust:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

${LINUX_TAURI_DEPS}
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: src-tauri

      - name: Check
        working-directory: src-tauri
        run: cargo check --locked
`
      : "";

  return `# Cheap by design: every step here is a typecheck or a build.
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
${jsJob(ctx)}${rustJob}`;
}

function releaseWorkflow(): string {
  return `# Tag-triggered desktop builds. Cutting a tag with scripts/release.sh is what
# starts this; the draft release it creates has to be published by hand.
name: Release

on:
  push:
    tags: ["v*.*.*"]

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: macos-latest
            args: "--target universal-apple-darwin"
          - platform: ubuntu-latest
            args: ""
          - platform: windows-latest
            args: ""

    runs-on: \${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: \${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}

      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: src-tauri

      - name: Install Linux webview dependencies
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

      - name: Install
        run: pnpm install --frozen-lockfile || pnpm install

      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: \${{ github.ref_name }}
          releaseName: \${{ github.ref_name }}
          releaseDraft: true
          prerelease: false
          args: \${{ matrix.args }}
`;
}

export const githubActions: FeatureModule = {
  id: "github-actions",
  title: "GitHub Actions CI",
  hint: "typecheck + build on push and PR; desktop release matrix for Tauri",
  appliesTo: "*",
  recommended: true,

  files: (ctx): FileOp[] => {
    const files: FileOp[] = [{ path: ".github/workflows/ci.yml", contents: ciWorkflow(ctx) }];

    if (ctx.template === "tauri") {
      files.push({ path: ".github/workflows/release.yml", contents: releaseWorkflow() });
    }

    return files;
  },
};
