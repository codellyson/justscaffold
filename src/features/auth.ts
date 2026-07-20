import type { FeatureModule } from "../core/types.js";

export const auth: FeatureModule = {
  id: "auth",
  title: "Bearer token auth",
  hint: "hashed API tokens, requireAuth middleware, /auth/whoami",
  appliesTo: ["api"],

  pkg: () => ({
    scripts: {
      "token:mint": "tsx scripts/mint-token.ts",
    },
  }),

  files: () => [
    {
      path: "src/auth.ts",
      contents: `import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Context, Next } from "hono";

const PREFIX = "sk_";

export interface AuthedUser {
  tokenId: string;
}

export function mintToken(): { token: string; hash: string } {
  const token = PREFIX + randomBytes(20).toString("hex");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Tokens are compared as SHA-256 hashes so a leaked store is not a leaked
 * credential, and via timingSafeEqual so response latency does not reveal how
 * many leading characters matched.
 */
function matches(candidateHash: string, knownHash: string): boolean {
  const a = Buffer.from(candidateHash, "hex");
  const b = Buffer.from(knownHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function allowedHashes(): string[] {
  return (process.env.API_TOKEN_HASHES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const candidate = hashToken(token);
  const known = allowedHashes();
  const hit = known.find((h) => matches(candidate, h));

  if (!hit) {
    return c.json({ error: "unauthorized" }, 401);
  }

  c.set("user", { tokenId: hit.slice(0, 8) } satisfies AuthedUser);
  await next();
}
`,
    },
    {
      path: "scripts/mint-token.ts",
      contents: `import { mintToken } from "../src/auth.js";

const { token, hash } = mintToken();

console.log("Token (give this to the client, it is not recoverable):");
console.log("  " + token);
console.log("");
console.log("Hash (append to API_TOKEN_HASHES in .env):");
console.log("  " + hash);
`,
    },
    {
      path: ".env.example",
      contents: `PORT=3000

# Comma-separated SHA-256 hashes of valid API tokens.
# Generate with: npm run token:mint
API_TOKEN_HASHES=
`,
    },
  ],

  patches: () => [
    {
      file: "src/index.ts",
      anchor: "imports",
      insert: `import { requireAuth } from "./auth.js";`,
    },
    {
      file: "src/index.ts",
      anchor: "routes",
      insert: `app.use("/api/*", requireAuth);

app.get("/auth/whoami", requireAuth, (c) => c.json({ user: c.get("user") }));`,
    },
  ],

  postInstallNote: () => 'Run "npm run token:mint" and put the hash in .env as API_TOKEN_HASHES.',
};
