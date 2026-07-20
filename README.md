# justscaffold

Scaffold apps from composable templates and opt-in feature modules.

```sh
npx github:codellyson/justscaffold new my-app
```

Or interactively — omit everything and it will prompt:

```sh
npx github:codellyson/justscaffold new
```

## Usage

```sh
justscaffold new [name] [options]

  -t, --template   lib | cli | mcp | api
  -f, --features   comma-separated feature ids
      --dir        target directory (defaults to ./<name>)
  -y, --yes        skip prompts, use defaults

justscaffold list      # show templates and features
```

Non-interactive example:

```sh
justscaffold new my-api -t api -f auth,vitest,docker -y
```

## Templates

| Id | What you get |
| --- | --- |
| `lib` | TypeScript library — `tsc` build, declarations, exports map, publishable |
| `cli` | citty commands, `bin` entry, `@clack/prompts` interactivity |
| `mcp` | stdio MCP server, zod-validated tools, env-only config |
| `api` | Hono service on Node, typed config, health check, error handling |

## Features

| Id | Applies to | What it adds |
| --- | --- | --- |
| `vitest` | all | Test runner and a passing example spec |
| `github-actions` | all | CI workflow: typecheck, build, and tests if present |
| `auth` | `api` | Hashed bearer tokens, `requireAuth` middleware, token minting script |
| `docker` | `api`, `mcp` | Multi-stage Dockerfile, compose file, non-root runtime |
| `release-script` | all | Guarded version bump, tag, and push |

## How features compose

A template is a plain directory of real, compilable files under `templates/`.
A feature is a `FeatureModule` that can do three things to it:

```ts
export const auth: FeatureModule = {
  id: "auth",
  appliesTo: ["api"],

  files: () => [{ path: "src/auth.ts", contents: "..." }],   // add files
  pkg: () => ({ dependencies: { ... } }),                    // merge package.json
  patches: () => [                                           // splice into entry points
    { file: "src/index.ts", anchor: "imports", insert: `import { requireAuth } ...` },
  ],
};
```

Patches attach to **anchor comments** in the template:

```ts
import { loadConfig } from "./config.js";
// @justscaffold:imports
```

This keeps templates valid TypeScript that typechecks and runs in place —
unlike `<% if (auth) %>` conditionals, which turn templates into strings that
no compiler ever sees. Anchors are stripped from the generated output, so what
ships to the user reads like hand-written code.

Registry order in `src/registry.ts` is application order, so a feature listed
later deterministically overrides an earlier one's `package.json` keys.

## Adding a template

1. Create `templates/<id>/` with a `package.json` (using `__PKG_NAME__` and
   friends) and at least one `// @justscaffold:imports` anchor in the entry file.
2. Name dotfiles `_gitignore`, not `.gitignore` — npm strips real dotfiles from
   git-installed packages. `src/core/fs-utils.ts` renames them on the way out.
3. Register it in `TEMPLATES` in `src/registry.ts` and add the id to `TemplateId`.

The test suite picks up new templates automatically and asserts they leave no
unsubstituted tokens or leftover anchors behind.

## Adding a feature

Create `src/features/<id>.ts` exporting a `FeatureModule`, then add it to
`FEATURES` in `src/registry.ts`. Use `appliesTo` to scope it, and `requires` /
`conflicts` to express relationships with other features.

## Develop

```sh
npm install
npm run dev -- new my-app     # run from source
npm run build
npm run lint
npm test
```
