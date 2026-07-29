import { promises as fs } from "node:fs";
import { describe, expect, it } from "vitest";
import { serializeRegistry, webRegistryPath } from "../scripts/gen-web.js";

describe("web builder", () => {
  // The page ships a generated snapshot of the registry. If a template or
  // feature changes and nobody runs `npm run gen:web`, the builder silently
  // emits commands for a tool that no longer matches. This fails first.
  it("has a registry.js in sync with the source registry", async () => {
    const onDisk = await fs.readFile(webRegistryPath, "utf8");
    expect(onDisk).toBe(await serializeRegistry());
  });
});
