import { ScaffoldError } from "./errors.js";
import { getFeature, listFeatures } from "../registry.js";
import type { FeatureModule, TemplateId } from "./types.js";

export function appliesTo(feature: FeatureModule, template: TemplateId): boolean {
  return feature.appliesTo === "*" || feature.appliesTo.includes(template);
}

export function featuresForTemplate(template: TemplateId): FeatureModule[] {
  return listFeatures().filter((f) => appliesTo(f, template));
}

/**
 * Validate a requested feature set and return it in registry order.
 *
 * Registry order is the application order, so a feature listed later can
 * override an earlier one's package.json keys deterministically.
 */
export function resolveFeatures(template: TemplateId, requested: string[]): FeatureModule[] {
  const selected = new Set(requested);

  for (const id of selected) {
    const feature = getFeature(id);
    if (!feature) {
      throw new ScaffoldError("unknown-feature", `Unknown feature "${id}".`);
    }
    if (!appliesTo(feature, template)) {
      throw new ScaffoldError(
        "feature-not-applicable",
        `Feature "${id}" does not apply to the "${template}" template.`,
      );
    }
  }

  // Pull in transitive requirements before checking conflicts, so a conflict
  // introduced by an auto-added dependency is still reported.
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...selected]) {
      for (const req of getFeature(id)?.requires ?? []) {
        if (!selected.has(req)) {
          if (!getFeature(req)) {
            throw new ScaffoldError(
              "missing-requirement",
              `Feature "${id}" requires "${req}", which does not exist.`,
            );
          }
          selected.add(req);
          changed = true;
        }
      }
    }
  }

  for (const id of selected) {
    for (const other of getFeature(id)?.conflicts ?? []) {
      if (selected.has(other)) {
        throw new ScaffoldError("conflict", `Features "${id}" and "${other}" cannot be combined.`);
      }
    }
  }

  return listFeatures().filter((f) => selected.has(f.id));
}
