import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyTokens } from "./tokens.js";

/**
 * npm strips a real `.gitignore` out of any published or git-installed
 * package, so template trees store these as `_gitignore` and we rename on the
 * way out. Same trick create-vite uses.
 */
const DOTFILE_PREFIX = "_";
const DOTFILE_NAMES = new Set([
  "_gitignore",
  "_npmrc",
  "_gitattributes",
  "_env.example",
  "_dockerignore",
]);

/**
 * Read as UTF-8 and token-substitute everything except these. Icons and fonts
 * would be silently corrupted by a utf8 round-trip.
 */
const BINARY_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".icns",
  ".webp",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".pdf",
  ".zip",
]);

export function isBinaryPath(p: string): boolean {
  return BINARY_EXT.has(path.extname(p).toLowerCase());
}

export function templatesRoot(): string {
  // dist/core/fs-utils.js -> repo root -> templates/
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "..", "..", "templates");
}

export function outputName(entry: string): string {
  return DOTFILE_NAMES.has(entry) ? `.${entry.slice(DOTFILE_PREFIX.length)}` : entry;
}

export async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function isEmptyDir(p: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(p);
    return entries.length === 0;
  } catch {
    return true;
  }
}

export async function writeFile(root: string, relPath: string, contents: string): Promise<void> {
  const full = path.join(root, relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, contents, "utf8");
}

export async function readFileIfExists(root: string, relPath: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(root, relPath), "utf8");
  } catch {
    return null;
  }
}

/** Recursively copy a template tree, renaming dotfiles and substituting tokens. */
export async function copyTree(
  from: string,
  to: string,
  tokens: Record<string, string>,
): Promise<void> {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });

  for (const entry of entries) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, outputName(entry.name));

    if (entry.isDirectory()) {
      await copyTree(src, dest, tokens);
      continue;
    }

    if (isBinaryPath(entry.name)) {
      await fs.copyFile(src, dest);
      continue;
    }

    const raw = await fs.readFile(src, "utf8");
    await fs.writeFile(dest, applyTokens(raw, tokens), "utf8");
  }
}
