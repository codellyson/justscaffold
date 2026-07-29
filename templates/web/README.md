# __PRODUCT_NAME__

__PKG_DESCRIPTION__

A web-first consumer product: a converting landing page, ready to grow into a
service site, a small tool, a fintech flow, or a shop.

## Stack

- **React 19 + Vite**, styled with [`@codellyson/justui`](https://www.npmjs.com/package/@codellyson/justui) — the six **consumer** themes (Sunset, Ocean, Bloom, Meadow, Grape, Mono), light + dark, brand-forward, 15px.
- Semantic tokens only (`bg-bg`, `text-primary`, `bg-accent`) — no hardcoded colors.

## Develop

```sh
pnpm install
pnpm dev            # http://localhost:5173
```

## Build

```sh
pnpm build
```

## Make it yours

- **Copy** lives in `apps/web/src/App.tsx` — headline, features, pricing tiers.
- **Brand theme**: the default is Sunset. Change `defaultThemeId` in
  `apps/web/src/main.tsx`, or let visitors pick via the theme toggle.
- **Primary action**: the hero's email capture is a stub — point it at your
  waitlist, sign-up, or checkout.

## Layout

```text
apps/web/    React landing (justui consumer themes). All copy in src/App.tsx.
```
