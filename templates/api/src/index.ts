import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { loadConfig } from "./config.js";
// @justscaffold:imports

/**
 * `user` is declared unconditionally so the type is stable whether or not the
 * auth feature was enabled — otherwise enabling auth would require rewriting
 * this generic by hand.
 */
type Variables = {
  user?: { tokenId: string };
};

const config = loadConfig();
const app = new Hono<{ Variables: Variables }>();

app.get("/health", (c) => c.json({ ok: true, env: config.nodeEnv }));

// @justscaffold:routes

app.get("/api/items", (c) => c.json({ items: [] }));

app.notFound((c) => c.json({ error: "not_found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "internal_error" }, 500);
});

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`listening on http://localhost:${info.port}`);
});

export type AppType = typeof app;
