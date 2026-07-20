# __PKG_NAME__

__PKG_DESCRIPTION__

A Tauri 2 desktop app: React 19 + Vite 6 webview over a Rust backend.

## Prerequisites

Node 20+, and the Rust toolchain plus your platform's webview dependencies —
see [tauri.app/start/prerequisites](https://tauri.app/start/prerequisites/).

## Develop

```sh
npm install
npm run tauri:dev
```

`tauri:dev` starts Vite on port 3030 and opens the desktop shell against it.
`npm run dev` alone runs only the webview in a browser, which is useful for UI
work but leaves every `invoke()` call failing — the Rust side isn't there.

## Build

```sh
npm run tauri:build
```

## Icons

`src-tauri/icons/icon.png` is a placeholder. Replace it and regenerate the full
platform set — `.icns` for macOS, `.ico` for Windows:

```sh
npm run icon path/to/your-logo.png
```

Then list the generated files in `bundle.icon` in `src-tauri/tauri.conf.json`.
Shipping without this works for `tauri dev`, but macOS and Windows installers
will use the placeholder.

## Adding a command

1. Write a `#[tauri::command]` in `src-tauri/src/lib.rs` returning
   `CommandResult<T>`.
2. Register it in the `generate_handler![]` list.
3. Add a typed wrapper in `src/lib/commands.ts`.

Errors cross the boundary as a tagged union (`{ kind, message }`), so the UI can
branch on `kind` rather than string-matching messages. Keep the `CommandError`
enum and the TypeScript interface in sync — nothing enforces that automatically.
