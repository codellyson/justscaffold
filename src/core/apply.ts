import path from "node:path";
import { ScaffoldError } from "./errors.js";
import {
  copyTree,
  isEmptyDir,
  pathExists,
  readFileIfExists,
  templatesRoot,
  writeFile,
} from "./fs-utils.js";
import { applyPatch } from "./patch.js";
import { mergePkg, serializePkg } from "./pkg-merge.js";
import { resolveFeatures } from "./resolve.js";
import { sweepAnchors } from "./sweep.js";
import { isValidPackageName, tokensFor } from "./tokens.js";
import { getTemplate } from "../registry.js";
import type { PkgFragment, ScaffoldContext } from "./types.js";

export interface ScaffoldResult {
  targetDir: string;
  features: string[];
  notes: string[];
}

export async function scaffold(ctx: ScaffoldContext): Promise<ScaffoldResult> {
  if (!isValidPackageName(ctx.pkgName)) {
    throw new ScaffoldError("invalid-name", `"${ctx.pkgName}" is not a valid package name.`);
  }

  const template = getTemplate(ctx.template);
  if (!template) {
    throw new ScaffoldError("unknown-template", `Unknown template "${ctx.template}".`);
  }

  if ((await pathExists(ctx.targetDir)) && !(await isEmptyDir(ctx.targetDir))) {
    throw new ScaffoldError("target-exists", `${ctx.targetDir} already exists and is not empty.`);
  }

  const templateDir = path.join(templatesRoot(), template.dir);
  if (!(await pathExists(templateDir))) {
    throw new ScaffoldError("template-missing", `Template files not found at ${templateDir}.`);
  }

  const features = resolveFeatures(ctx.template, ctx.features);
  const tokens = tokensFor(ctx);

  await copyTree(templateDir, ctx.targetDir, tokens);

  // package.json is assembled rather than copied: the template ships a base
  // manifest and each feature merges its own deps and scripts into it.
  const basePkgRaw = await readFileIfExists(ctx.targetDir, "package.json");
  if (!basePkgRaw) {
    throw new ScaffoldError("template-missing", `Template "${template.id}" has no package.json.`);
  }
  let pkg = JSON.parse(basePkgRaw) as PkgFragment;

  const notes: string[] = [];

  for (const feature of features) {
    for (const file of feature.files?.(ctx) ?? []) {
      await writeFile(ctx.targetDir, file.path, file.contents);
    }

    if (feature.pkg) {
      pkg = mergePkg(pkg, feature.pkg(ctx));
    }

    for (const op of feature.patches?.(ctx) ?? []) {
      const current = await readFileIfExists(ctx.targetDir, op.file);
      if (current === null) {
        throw new ScaffoldError(
          "anchor-missing",
          `Feature "${feature.id}" patches "${op.file}", which the template did not create.`,
        );
      }
      await writeFile(ctx.targetDir, op.file, applyPatch(current, op));
    }

    const note = feature.postInstallNote?.(ctx);
    if (note) notes.push(note);
  }

  await writeFile(ctx.targetDir, "package.json", serializePkg(pkg));
  await sweepAnchors(ctx.targetDir);

  return { targetDir: ctx.targetDir, features: features.map((f) => f.id), notes };
}
