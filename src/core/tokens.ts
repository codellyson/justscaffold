import type { ScaffoldContext } from "./types.js";

/**
 * Template files carry `__TOKEN__` placeholders rather than a templating
 * language, so every file under templates/ stays syntactically valid and can
 * be typechecked and run in place.
 */
export function tokensFor(ctx: ScaffoldContext): Record<string, string> {
  return {
    __PKG_NAME__: ctx.pkgName,
    __PKG_DESCRIPTION__: ctx.description,
    __BIN_NAME__: unscoped(ctx.pkgName),
    __CONST_NAME__: constantCase(unscoped(ctx.pkgName)),
    __CRATE_NAME__: crateCase(unscoped(ctx.pkgName)),
    __PRODUCT_NAME__: titleCase(unscoped(ctx.pkgName)),
    __YEAR__: ctx.year,
  };
}

export function applyTokens(source: string, tokens: Record<string, string>): string {
  let out = source;
  for (const [token, value] of Object.entries(tokens)) {
    out = out.split(token).join(value);
  }
  return out;
}

export function unscoped(pkgName: string): string {
  return pkgName.includes("/") ? pkgName.slice(pkgName.indexOf("/") + 1) : pkgName;
}

export function constantCase(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
}

/** Cargo package names allow dashes but Rust identifiers do not. */
export function crateCase(name: string): string {
  const snake = name.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
  return /^[0-9]/.test(snake) ? `app_${snake}` : snake;
}

export function titleCase(name: string): string {
  return name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const NAME_RE = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function isValidPackageName(name: string): boolean {
  return NAME_RE.test(name);
}
