import type { FeatureModule } from "../core/types.js";
import { constantCase, unscoped } from "../core/tokens.js";

// Agent-native by design: ship the app's core as an MCP server so any MCP client
// (Claude Code et al.) can drive it. Following the family convention, the server
// is a *thin* stdio surface over the app's own HTTP API — it imports no business
// logic, it just calls the same routes the UI does.
export const mcpSurface: FeatureModule = {
  id: "mcp-surface",
  title: "MCP server",
  hint: "a thin stdio MCP server over the local API so agents can drive the app",
  appliesTo: ["tauri"],
  requires: ["web-surface"],

  files: (ctx) => {
    const bin = unscoped(ctx.pkgName);
    const ENV = constantCase(bin);
    return [
      {
        path: "packages/mcp-server/package.json",
        contents: `${JSON.stringify(
          {
            name: `@${bin}/mcp-server`,
            version: "0.1.0",
            private: true,
            type: "module",
            bin: { [`${bin}-mcp`]: "dist/index.js" },
            scripts: {
              build: "tsc -p tsconfig.json",
              dev: "tsx src/index.ts",
              lint: "tsc --noEmit -p tsconfig.json",
            },
            dependencies: {
              "@modelcontextprotocol/sdk": "^1.0.0",
              zod: "^3.23.0",
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
        path: "packages/mcp-server/tsconfig.json",
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
              skipLibCheck: true,
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
        path: "packages/mcp-server/src/index.ts",
        contents: `#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = process.env.${ENV}_API_URL ?? "http://localhost:8787";
const TOKEN = process.env.${ENV}_TOKEN ?? "";

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] });

// Never surface a raw fetch failure — rewrite it into something actionable.
async function call(path: string, init: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(init.headers);
  if (TOKEN) headers.set("Authorization", \`Bearer \${TOKEN}\`);
  let res: Response;
  try {
    res = await fetch(\`\${API_URL}\${path}\`, { ...init, headers });
  } catch {
    throw new Error(\`Could not reach the API at \${API_URL}. Start it with "pnpm dev:api".\`);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? \`API returned \${res.status}.\`);
  }
  return res.json();
}

const server = new McpServer({ name: "${bin}", version: "0.1.0" });

server.registerTool(
  "list_items",
  { description: "List the saved items.", inputSchema: {} },
  async () => {
    const data = (await call("/api/items")) as { items: unknown[] };
    return text(JSON.stringify(data.items, null, 2));
  },
);

server.registerTool(
  "add_item",
  { description: "Add an item.", inputSchema: { text: z.string().min(1) } },
  async ({ text: value }) => {
    const item = (await call("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value }),
    })) as { id: number };
    return text(\`Added item #\${item.id}.\`);
  },
);

await server.connect(new StdioServerTransport());
`,
      },
    ];
  },

  postInstallNote: (ctx) =>
    `Build the MCP server ("pnpm --filter @${unscoped(ctx.pkgName)}/mcp-server build") and register it: claude mcp add ${unscoped(ctx.pkgName)} -- node packages/mcp-server/dist/index.js`,
};
