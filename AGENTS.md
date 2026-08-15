# justscaffold

A CLI that generates projects from templates plus opt-in feature modules.

## Layout

```text
src/core/      generation engine — copy, merge, patch, validate
src/features/  one FeatureModule per file
src/commands/  citty command definitions
src/registry.ts  the only place templates and features are wired up
templates/     real, compilable project trees
test/          generator tests
```

## Stack contracts

- **Single package, no workspace.** `npx github:` runs plain `npm install` and
  the `prepare` script; it does not read `pnpm-workspace.yaml`. The `bin`, the
  runtime deps, and the build must all live in the root `package.json`. Adding
  a workspace would silently break remote installs.
- **`templates/` must be listed in `files`.** It is shipped data, not source.
- **Templates are real code, not strings.** Every file under `templates/`
  should typecheck on its own. Variation comes from anchors and feature
  modules, never from a templating language.
- **Registry order is application order.** Reordering `FEATURES` changes which
  feature wins a `package.json` key collision.

## Sharp edges

- Dotfiles in `templates/` are stored as `_gitignore`, `_npmrc`, etc. npm
  strips real dotfiles from git-installed packages. `outputName()` in
  `src/core/fs-utils.ts` renames them during generation. Feature `files()` use
  inline strings and are not shipped, so those may use real dotted names.
- `templatesRoot()` resolves `../../templates` from its own module URL, which
  lands correctly from both `src/` (tests, tsx) and `dist/` (built CLI). Moving
  the file between directory depths breaks it.
- A missing anchor throws `ScaffoldError("anchor-missing")` rather than
  silently skipping. That is deliberate: a feature that half-applies produces a
  project that compiles but behaves wrong.
- The api template declares `Variables.user` unconditionally so its Hono
  generic is stable whether or not `auth` is enabled.
- `copyTree` token-substitutes files as UTF-8; anything in `BINARY_EXT` is
  `copyFile`d instead. Adding a binary asset type without extending that set
  corrupts it silently — the file is written, just wrong.
- `tauri-build` requires `src-tauri/icons/icon.ico` on Windows regardless of
  what `bundle.icon` lists. A PNG-only icon set breaks every Windows build with
  an error raised from the build script, not from your code.
- Cargo package names may contain dashes; Rust identifiers may not. `main.rs`
  references `__CRATE_NAME___lib`, so the `crateCase()` token has to stay in
  sync with `[lib] name` in `Cargo.toml`.
- Long Windows paths can fail Rust linking with `LNK1104`. That's the
  environment, not the template — set `CARGO_TARGET_DIR` to something short.
- The extension template builds twice. Chrome injects content scripts as
  classic scripts, so `content.js` has to be an IIFE while the popup and
  service worker are ES modules, and Rollup emits one format per build.
  `vite.content.config.ts` runs second with `emptyOutDir: false`; reversing the
  order in `scripts.build` deletes the first build's output.
- Chrome resolves `popup.html`, `background.js`, and `content.js` by the exact
  name in the manifest, so the extension's Vite output must stay unhashed.
- The extension carries its version in both `package.json` and
  `public/manifest.json`, and Chrome reads only the manifest. `release-script`
  bumps the pair together — same problem Tauri has with three files.
- Tailwind must not reach `src/content/`. A content script shares one cascade
  with whatever page it is injected into, so it styles itself through a single
  scoped attribute instead. Tailwind v4 scans the project instead of reading a
  `content` list, so the exclusion is an explicit `@source not "../content"` in
  `src/styles/global.css` — deleting that line silently restyles every page the
  extension is injected into.
- The three React templates style themselves by importing
  `@codellyson/justui/tailwind.css`, which pulls in the tokens, Tailwind, the
  design config, and an `@source` over justui's `dist`. There is no
  `tailwind.config.cjs` or `postcss.config.cjs`; Tailwind runs through
  `@tailwindcss/vite`. justui ≥1.0 requires Tailwind v4 and no longer ships the
  v3 preset.

## Workflow

```sh
npm run dev -- new my-app -t api -f auth -y   # generate from source
npm test                                       # generator tests
npm run gen:web                                # rebuild web/registry.js
```

When changing a template or feature, generate a project and actually build it.
The test suite checks output shape — tokens substituted, anchors stripped,
package.json merged — but does not run `npm install` and `tsc` on the result.

### The builder page

`web/` is the static builder. It is two files: `index.html`, and a generated
`registry.js` that `scripts/gen-web.ts` produces by running the real engine
into temp dirs — so the page describes what the templates actually emit rather
than a hand-written account of them.

`registry.js` is **not committed**. Publishing the directory straight from a
checkout serves a page whose every dynamic panel is empty, and nothing on it
says why — so the deploy has to build first:

```sh
npm ci && npm run gen:web    # build
web                          # publish directory
```

`.github/workflows/deploy.yml` does exactly that and uploads the result to
Cloudflare Pages on every push to `main` that touches the page or what it is
generated from. It deploys by direct upload rather than through Cloudflare's
git integration on purpose: that integration can only be given a build command
from the dashboard, which would leave a load-bearing step outside the repo and
invisible to review.

It needs `CLOUDFLARE_API_TOKEN` (scoped `Cloudflare Pages: Edit`) and
`CLOUDFLARE_ACCOUNT_ID` as repository secrets. Without them the page is still
built — so a break in generation is still caught — and the upload is skipped
with a warning rather than failing. If the Pages project is also connected to
this repo through the dashboard, disconnect it; two deploy paths to one project
race, and the dashboard one has no build step.

The page reads `window.SCAFFOLD_REGISTRY`, `window.JUSTUI_VAR_MAP` and
`window.JUSTUI_THEMES` as plain globals from a classic script. It must not
import anything at runtime — a deploy has no `node_modules` beside it, so a
bare or relative specifier 404s, the script never runs, and the page silently
falls back to its static markup. `test/web.test.ts` asserts the generator and
the page still agree on those three names.

## When in doubt

Prefer adding a feature module over adding a template variant. Templates are
expensive (a whole tree to maintain); features are cheap and compose.
