import path from "node:path";
import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { scaffold } from "../core/apply.js";
import { errorHint, isScaffoldError } from "../core/errors.js";
import { featuresForTemplate } from "../core/resolve.js";
import { isValidPackageName } from "../core/tokens.js";
import { listTemplates } from "../registry.js";
import type { ScaffoldContext, TemplateId } from "../core/types.js";

export const newCommand = defineCommand({
  meta: {
    name: "new",
    description: "Scaffold a new project",
  },
  args: {
    name: {
      type: "positional",
      required: false,
      description: "Package name (also the directory name)",
    },
    template: {
      type: "string",
      alias: "t",
      description: `Template: ${listTemplates().map((t) => t.id).join(", ")}`,
    },
    features: {
      type: "string",
      alias: "f",
      description: "Comma-separated feature ids",
    },
    dir: {
      type: "string",
      description: "Target directory (defaults to ./<name>)",
    },
    yes: {
      type: "boolean",
      alias: "y",
      description: "Skip prompts; use defaults for anything not passed",
    },
  },

  async run({ args }) {
    p.intro("justscaffold");

    try {
      const pkgName = await resolveName(args.name, args.yes);
      const template = await resolveTemplate(args.template, args.yes);
      const features = await resolveFeatureSelection(template, args.features, args.yes);

      const targetDir = path.resolve(
        process.cwd(),
        args.dir ?? unscopedDir(pkgName),
      );

      const ctx: ScaffoldContext = {
        targetDir,
        pkgName,
        description: `A ${template} project.`,
        template,
        features,
        year: String(new Date().getFullYear()),
      };

      const spinner = p.spinner();
      spinner.start("Generating");
      const result = await scaffold(ctx);
      spinner.stop("Generated");

      const rel = path.relative(process.cwd(), result.targetDir);
      // A target outside cwd yields a "../../.." chain that's harder to read
      // than the absolute path; only show the relative form when it descends.
      const dest = !rel || rel.startsWith("..") ? result.targetDir : rel;
      const lines = [
        `cd ${dest}`,
        "npm install",
        "npm run build",
        ...result.notes.map((n) => `# ${n}`),
      ];
      p.note(lines.join("\n"), "Next steps");
      p.outro(`${pkgName} ready`);
    } catch (error) {
      if (isScaffoldError(error)) {
        const hint = errorHint(error);
        p.cancel(hint ? `${error.message}\n${hint}` : error.message);
        process.exitCode = 1;
        return;
      }
      throw error;
    }
  },
});

function unscopedDir(pkgName: string): string {
  return pkgName.startsWith("@") ? pkgName.slice(pkgName.indexOf("/") + 1) : pkgName;
}

async function resolveName(provided: string | undefined, yes: boolean): Promise<string> {
  if (provided) return provided;
  if (yes) return "my-app";

  const answer = await p.text({
    message: "Package name",
    placeholder: "my-app",
    defaultValue: "my-app",
    validate: (value) =>
      !value || isValidPackageName(value) ? undefined : "Invalid npm package name",
  });
  exitIfCancelled(answer);
  return answer as string;
}

async function resolveTemplate(provided: string | undefined, yes: boolean): Promise<TemplateId> {
  const templates = listTemplates();
  if (provided) return provided as TemplateId;
  if (yes) return "lib";

  const answer = await p.select({
    message: "Template",
    options: templates.map((t) => ({ value: t.id, label: t.title, hint: t.hint })),
  });
  exitIfCancelled(answer);
  return answer as TemplateId;
}

async function resolveFeatureSelection(
  template: TemplateId,
  provided: string | undefined,
  yes: boolean,
): Promise<string[]> {
  const available = featuresForTemplate(template);

  if (provided !== undefined) {
    return provided
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const recommended = available.filter((f) => f.recommended).map((f) => f.id);
  if (yes || available.length === 0) return recommended;

  const answer = await p.multiselect({
    message: "Features (space to toggle, enter to confirm)",
    required: false,
    initialValues: recommended,
    options: available.map((f) => ({ value: f.id, label: f.title, hint: f.hint })),
  });
  exitIfCancelled(answer);
  return answer as string[];
}

function exitIfCancelled(value: unknown): void {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
}
