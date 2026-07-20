# justscaffold

A CLI that generates projects from templates plus opt-in feature modules.

## Layout

```
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

## Workflow

```sh
npm run dev -- new my-app -t api -f auth -y   # generate from source
npm test                                       # generator tests
```

When changing a template or feature, generate a project and actually build it.
The test suite checks output shape — tokens substituted, anchors stripped,
package.json merged — but does not run `npm install` and `tsc` on the result.

## When in doubt

Prefer adding a feature module over adding a template variant. Templates are
expensive (a whole tree to maintain); features are cheap and compose.
