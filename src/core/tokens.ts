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

const NAME_RE = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function isValidPackageName(name: string): boolean {
  return NAME_RE.test(name);
}
