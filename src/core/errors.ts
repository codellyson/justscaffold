export type ScaffoldErrorKind =
  | "invalid-name"
  | "target-exists"
  | "unknown-template"
  | "unknown-feature"
  | "feature-not-applicable"
  | "missing-requirement"
  | "conflict"
  | "anchor-missing"
  | "template-missing";

/**
 * Tagged error so callers can branch on `kind` instead of string-matching
 * messages, mirroring the CommandError union justdb serialises out of Rust.
 */
export class ScaffoldError extends Error {
  readonly kind: ScaffoldErrorKind;

  constructor(kind: ScaffoldErrorKind, message: string) {
    super(message);
    this.name = "ScaffoldError";
    this.kind = kind;
  }
}

export function isScaffoldError(e: unknown): e is ScaffoldError {
  return e instanceof ScaffoldError;
}

/** Remediation hints, in the spirit of justdb's getErrorHint(). */
export function errorHint(e: ScaffoldError): string | undefined {
  switch (e.kind) {
    case "target-exists":
      return "Pick a different name, or delete the directory first.";
    case "invalid-name":
      return "Use lowercase letters, digits, dashes; optionally scoped as @scope/name.";
    case "anchor-missing":
      return "This is a bug in the template, not your input — please file an issue.";
    case "missing-requirement":
    case "conflict":
      return "Re-run without --yes to pick features interactively.";
    default:
      return undefined;
  }
}
