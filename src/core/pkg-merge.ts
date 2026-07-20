import type { PkgFragment } from "./types.js";

const SORTED_MAPS = new Set(["dependencies", "devDependencies", "peerDependencies"]);

/**
 * Merge a feature's package.json fragment into the accumulating manifest.
 *
 * Dependency maps and `scripts` merge key-by-key; everything else replaces.
 * Later fragments win on collision — features are applied in registry order,
 * so a feature that must override an earlier one just has to be registered
 * after it.
 */
export function mergePkg(base: PkgFragment, fragment: PkgFragment): PkgFragment {
  const out: PkgFragment = { ...base };

  for (const [key, value] of Object.entries(fragment)) {
    const existing = out[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      out[key] = { ...existing, ...value };
    } else {
      out[key] = value;
    }
  }

  return out;
}

/** npm writes dependency maps sorted; match that so diffs stay clean. */
export function normalizePkg(pkg: PkgFragment): PkgFragment {
  const out: PkgFragment = {};
  for (const [key, value] of Object.entries(pkg)) {
    if (SORTED_MAPS.has(key) && isPlainObject(value)) {
      out[key] = sortKeys(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function serializePkg(pkg: PkgFragment): string {
  return `${JSON.stringify(normalizePkg(pkg), null, 2)}\n`;
}

function sortKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
