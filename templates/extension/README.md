# __PRODUCT_NAME__

__PKG_DESCRIPTION__

A Chrome Manifest V3 extension with all three surfaces wired together: a React
popup, a background service worker, and a content script, talking over one
typed message union.

## Stack

- **React 19 + Vite**, styled with [`@codellyson/justui`](https://www.npmjs.com/package/@codellyson/justui) — consumer themes, light + dark.
- Semantic tokens only (`bg-bg`, `text-primary`, `bg-accent`) — no hardcoded colors.

## Develop

```sh
npm install
npm run dev
```

Then load it once: `chrome://extensions` → **Developer mode** on → **Load
unpacked** → pick the `dist/` folder. `npm run dev` rebuilds on save; click the
reload icon on the extension card to pick up changes to the background script or
the manifest. The popup picks up changes when you reopen it.

## Build

```sh
npm run build     # dist/ is the unpacked extension, ready to zip
```

## Layout

```text
popup.html               popup document; entry point for the React app
src/popup/               the popup UI (justui + Tailwind)
src/background/          MV3 service worker: persistence and tab events
src/content/             injected into pages; no Tailwind, one scoped style
src/lib/messages.ts      the message union both ends share
public/manifest.json     the manifest, copied to dist/ verbatim
```

## Why two Vite configs

Chrome injects content scripts as *classic* scripts, so `content.js` has to be
a single self-contained IIFE, while the popup and the service worker are ES
modules. Rollup can't emit two formats from one build, so
`vite.content.config.ts` is a second pass that writes into the same `dist/`
without emptying it. `npm run build` runs them in the right order.

## Make it yours

- **Permissions**: `public/manifest.json` requests `storage` and `activeTab`,
  and matches `<all_urls>`. Narrow `matches` to the sites you actually need —
  review time scales with what you ask for.
- **Messages**: add a variant to `Request` in `src/lib/messages.ts` and the
  compiler will point at every handler that has to grow a case.
- **Theme**: the default is Ocean. Change `defaultThemeId` in
  `src/popup/main.tsx`, or let people pick with the toggle already in the popup.

## Versioning

The version lives in **two** places — `package.json` and
`public/manifest.json` — and Chrome only reads the manifest. Generate with the
`release-script` feature and `npm run release` bumps both together; otherwise
keep them in step by hand.
