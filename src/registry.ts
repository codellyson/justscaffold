import { auth } from "./features/auth.js";
import { docker } from "./features/docker.js";
import { githubActions } from "./features/github-actions.js";
import { releaseScript } from "./features/release-script.js";
import { vitest } from "./features/vitest.js";
import type { FeatureModule, TemplateId, TemplateModule } from "./core/types.js";

export const TEMPLATES: TemplateModule[] = [
  {
    id: "lib",
    title: "TypeScript library",
    hint: "tsc build, exports map, publishable package",
    dir: "lib",
  },
  {
    id: "cli",
    title: "CLI app",
    hint: "citty commands, bin entry, interactive prompts",
    dir: "cli",
  },
  {
    id: "mcp",
    title: "MCP server",
    hint: "stdio Model Context Protocol server with zod-validated tools",
    dir: "mcp",
  },
  {
    id: "api",
    title: "HTTP API service",
    hint: "Hono router, typed config, health check",
    dir: "api",
  },
];

/**
 * Registry order is application order — a feature registered later can
 * deterministically override an earlier one's package.json keys.
 */
const FEATURES: FeatureModule[] = [vitest, githubActions, auth, docker, releaseScript];

export function listTemplates(): TemplateModule[] {
  return TEMPLATES;
}

export function getTemplate(id: TemplateId): TemplateModule | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function listFeatures(): FeatureModule[] {
  return FEATURES;
}

export function getFeature(id: string): FeatureModule | undefined {
  return FEATURES.find((f) => f.id === id);
}
