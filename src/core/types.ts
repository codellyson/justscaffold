export type TemplateId = "lib" | "cli" | "mcp" | "api";

export interface ScaffoldContext {
  targetDir: string;
  pkgName: string;
  description: string;
  template: TemplateId;
  features: string[];
  year: string;
}

export interface FileOp {
  /** Path relative to the generated project root. */
  path: string;
  contents: string;
}

/**
 * Injects `insert` at a named anchor comment in an already-written file.
 *
 * Anchors keep templates valid, runnable TypeScript instead of `<% if %>`
 * soup — the template compiles and can be opened directly, and features
 * splice into it afterwards.
 */
export interface PatchOp {
  /** Path relative to the generated project root. */
  file: string;
  /** Anchor name, matching a `// @justscaffold:<anchor>` line in the file. */
  anchor: string;
  insert: string;
}

/** Deep-merged into the generated package.json. */
export interface PkgFragment {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

export interface TemplateModule {
  id: TemplateId;
  title: string;
  hint: string;
  /** Directory name under `templates/`. */
  dir: string;
}

export interface FeatureModule {
  id: string;
  title: string;
  hint: string;
  /** Templates this feature can apply to, or "*" for all. */
  appliesTo: TemplateId[] | "*";
  /** Pre-selected when the user is prompted. */
  recommended?: boolean;
  /** Feature ids that must also be enabled. */
  requires?: string[];
  /** Feature ids that cannot be enabled alongside this one. */
  conflicts?: string[];
  files?(ctx: ScaffoldContext): FileOp[];
  pkg?(ctx: ScaffoldContext): PkgFragment;
  patches?(ctx: ScaffoldContext): PatchOp[];
  /** Shown after generation, e.g. "set AUTH_SECRET in .env". */
  postInstallNote?(ctx: ScaffoldContext): string | undefined;
}
