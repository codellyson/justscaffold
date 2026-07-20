import { ScaffoldError } from "./errors.js";
import type { PatchOp } from "./types.js";

const ANCHOR_SOURCE = "^([ \\t]*)(?://|#)\\s*@justscaffold:([a-z0-9-]+)\\s*$";

export function anchorLine(anchor: string): string {
  return `// @justscaffold:${anchor}`;
}

/**
 * Insert `op.insert` immediately above its anchor comment, preserving the
 * anchor so later features can stack onto the same point.
 */
export function applyPatch(source: string, op: PatchOp): string {
  const found = findAnchor(source, op.anchor);
  if (!found) {
    throw new ScaffoldError(
      "anchor-missing",
      `Template file "${op.file}" has no @justscaffold:${op.anchor} anchor.`,
    );
  }

  const indented = op.insert
    .split("\n")
    .map((line) => (line.trim() === "" ? line : found.indent + line))
    .join("\n");

  return `${source.slice(0, found.start)}${indented}\n${source.slice(found.start)}`;
}

/**
 * Remove leftover anchor comments once every feature has been applied, so
 * generated projects don't ship scaffolding noise.
 */
export function stripAnchors(source: string): string {
  const line = new RegExp(ANCHOR_SOURCE);
  return source
    .split("\n")
    .filter((l) => !line.test(l))
    .join("\n");
}

export function hasAnchor(source: string, anchor: string): boolean {
  return findAnchor(source, anchor) !== null;
}

function findAnchor(source: string, anchor: string): { start: number; indent: string } | null {
  const re = new RegExp(ANCHOR_SOURCE, "gm");
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    if (match[2] === anchor) {
      return { start: match.index, indent: match[1] ?? "" };
    }
  }
  return null;
}
