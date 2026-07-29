import type { FeatureModule } from "../core/types.js";
import { unscoped } from "../core/tokens.js";

// "Same shell, two surfaces": the same UI runs as the Tauri desktop app and as a
// plain browser SPA. What differs is one thing — the desktop authenticates with
// a bearer token from the OS keychain, the browser leans on the API's cookie.
// This feature adds a local, own-your-data API (Hono + node:sqlite, a file under
// your home dir) and the single fetch seam the UI talks through.
export const webSurface: FeatureModule = {
  id: "web-surface",
  title: "Web surface + local API",
  hint: "run the same UI in a browser against a local Hono + node:sqlite API",
  appliesTo: ["tauri"],

  pkg: (ctx) => ({
    scripts: {
      "dev:api": `pnpm --filter @${unscoped(ctx.pkgName)}/api dev`,
    },
  }),

  files: (ctx) => {
    const bin = unscoped(ctx.pkgName);
    return [
      {
        path: "apps/api/package.json",
        contents: `${JSON.stringify(
          {
            name: `@${bin}/api`,
            version: "0.1.0",
            private: true,
            type: "module",
            engines: { node: ">=22.5" },
            scripts: {
              dev: "tsx watch src/index.ts",
              build: "tsc -p tsconfig.json",
              start: "node dist/index.js",
              lint: "tsc --noEmit -p tsconfig.json",
            },
            dependencies: {
              "@hono/node-server": "^1.13.0",
              hono: "^4.6.0",
            },
            devDependencies: {
              "@types/node": "^22.10.0",
              tsx: "^4.19.0",
              typescript: "^5.7.0",
            },
          },
          null,
          2,
        )}\n`,
      },
      {
        path: "apps/api/tsconfig.json",
        contents: `${JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              lib: ["ES2022"],
              module: "NodeNext",
              moduleResolution: "NodeNext",
              outDir: "dist",
              rootDir: "src",
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              skipLibCheck: true,
              isolatedModules: true,
              declaration: false,
              sourceMap: false,
            },
            include: ["src"],
          },
          null,
          2,
        )}\n`,
      },
      {
        path: "apps/api/.env.example",
        contents: `# Empty API_TOKEN trusts localhost (dev). Set one to require a bearer token;
# the desktop app stores the matching value in the OS keychain under "bearer".
API_TOKEN=
PORT=8787
# DATA_DIR overrides where the SQLite file lives (defaults to ~/.${bin}).
# DATA_DIR=
`,
      },
      {
        path: "apps/api/src/db.ts",
        contents: `import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

// Own-your-data: the database is a plain file under your home directory. Back
// it up, move it, or delete it — it is yours, not a row in someone's cloud.
let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  const dir = process.env.DATA_DIR ?? join(homedir(), ".${bin}");
  mkdirSync(dir, { recursive: true });
  db = new DatabaseSync(join(dir, "data.db"));
  db.exec(
    \`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )\`,
  );
  return db;
}
`,
      },
      {
        path: "apps/api/src/index.ts",
        contents: `import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getDb } from "./db.js";

const PORT = Number(process.env.PORT ?? 8787);
const TOKEN = process.env.API_TOKEN ?? "";

const app = new Hono();

// An empty API_TOKEN means "trust localhost" for local dev. Set one and the
// desktop app sends the matching bearer from the keychain.
app.use("/api/*", async (c, next) => {
  if (!TOKEN) return next();
  if (c.req.header("Authorization") !== \`Bearer \${TOKEN}\`) {
    return c.json(
      {
        kind: "unauthorized",
        message: "Missing or wrong bearer token. Set the same API_TOKEN here and in the app.",
      },
      401,
    );
  }
  return next();
});

app.get("/health", (c) => c.json({ ok: true }));

app.get("/api/items", (c) => {
  const rows = getDb()
    .prepare("SELECT id, text, created_at FROM items ORDER BY created_at DESC")
    .all();
  return c.json({ items: rows });
});

app.post("/api/items", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return c.json({ kind: "invalid_input", message: "An item needs non-empty text." }, 400);
  }
  const createdAt = Date.now();
  const info = getDb()
    .prepare("INSERT INTO items (text, created_at) VALUES (?, ?)")
    .run(text, createdAt);
  return c.json({ id: Number(info.lastInsertRowid), text, created_at: createdAt }, 201);
});

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(\`api listening on http://localhost:\${info.port}\`);
});
`,
      },
      {
        path: "apps/web/src/lib/api-client.ts",
        contents: `import { isTauri } from "./runtime";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8787";

// The entire surface difference, in one place: the desktop app authenticates
// with a bearer token from the OS keychain; the browser relies on the API's own
// cookie. UI code calls apiFetch and never has to know which surface it is on.
async function bearer(): Promise<string | null> {
  if (!isTauri) return null;
  const { getSecret } = await import("./commands");
  return getSecret("bearer");
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = await bearer();
  if (token) headers.set("Authorization", \`Bearer \${token}\`);
  return fetch(\`\${API_URL}\${path}\`, {
    ...init,
    headers,
    // Cookies in the browser; bearer tokens in Tauri. Don't mix.
    credentials: isTauri ? "omit" : "include",
  });
}
`,
      },
    ];
  },

  postInstallNote: () =>
    'Start the local API with "pnpm dev:api", then "pnpm dev" (browser) or "pnpm tauri:dev" (desktop).',
};
