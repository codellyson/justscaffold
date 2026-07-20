import { promises as fs } from "node:fs";
import path from "node:path";
import { stripAnchors } from "./patch.js";

const SKIP_DIRS = new Set(["node_modules", ".git", "target", "dist"]);

const TEXT_EXT = new Set([
  ".rs",
  ".toml",
  ".html",
  ".css",
  ".tsx",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".sh",
  ".sql",
  ".txt",
  ".example",
  "",
]);

/**
 * Strip anchor comments everywhere once features are applied — including from
 * files no feature touched, which would otherwise ship their anchors.
 */
export async function sweepAnchors(root: string): Promise<void> {
  for (const file of await walk(root)) {
    if (!TEXT_EXT.has(path.extname(file))) continue;
    const raw = await fs.readFile(file, "utf8");
    const stripped = stripAnchors(raw);
    if (stripped !== raw) await fs.writeFile(file, stripped, "utf8");
  }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}
