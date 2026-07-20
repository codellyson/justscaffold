# __PKG_NAME__

__PKG_DESCRIPTION__

## Develop

```sh
npm install
npm run dev -- hello world
```

## Build and run

```sh
npm run build
node dist/index.js hello world
```

## Adding a command

Create `src/commands/<name>.ts` exporting a `defineCommand({...})`, then register
it in the `subCommands` map in `src/index.ts`.
