#!/usr/bin/env node
//
// __PKG_NAME__ — an MCP server over stdio.
//
// Configure in your MCP client:
//
//   {
//     "mcpServers": {
//       "__BIN_NAME__": {
//         "command": "npx",
//         "args": ["-y", "__PKG_NAME__"],
//         "env": { "__CONST_NAME___API_URL": "https://example.com" }
//       }
//     }
//   }
//
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// @justscaffold:imports

const API_URL = (process.env.__CONST_NAME___API_URL ?? "https://example.com").replace(/\/$/, "");
const TOKEN = process.env.__CONST_NAME___TOKEN;

// stdout is the MCP transport — every diagnostic must go to stderr or it
// corrupts the protocol stream.
const log = (...args: unknown[]) => console.error("[__BIN_NAME__]", ...args);

async function api(path: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Thrown, not caught — the SDK turns this into a tool error for the client.
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}${body ? ` ${body}` : ""}`);
  }

  return res.json();
}

const server = new McpServer({ name: "__BIN_NAME__", version: "0.1.0" });

server.registerTool(
  "ping",
  {
    description: "Check that the server is reachable and echo a message back.",
    inputSchema: {
      message: z.string().describe("Text to echo back"),
    },
  },
  async ({ message }) => ({
    content: [{ type: "text", text: `pong: ${message}` }],
  }),
);

server.registerTool(
  "fetch_item",
  {
    description: "Fetch a single item by id from the configured API.",
    inputSchema: {
      id: z.string().describe("Item id"),
    },
  },
  async ({ id }) => {
    const item = await api(`/items/${encodeURIComponent(id)}`);
    return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
  },
);

// @justscaffold:tools

const transport = new StdioServerTransport();
await server.connect(transport);
log(`connected — API_URL=${API_URL}`);
