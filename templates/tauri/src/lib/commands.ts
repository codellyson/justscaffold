import { invoke } from "@tauri-apps/api/core";

/**
 * Every Rust call goes through this module. There is no HTTP layer — keeping
 * the invoke surface in one file is what makes the Rust/TS boundary auditable.
 */

/** Mirrors the `CommandError` enum's serde tagged representation. */
export interface CommandError {
  kind: "invalid_input" | "not_found" | "internal";
  message: string;
}

export function isCommandError(e: unknown): e is CommandError {
  return typeof e === "object" && e !== null && "kind" in e && "message" in e;
}

/** Human remediation for raw backend errors, so the UI never shows a bare enum. */
export function errorHint(e: CommandError): string | undefined {
  switch (e.kind) {
    case "not_found":
      return "It may have been removed. Try refreshing.";
    case "invalid_input":
      return "Check the values you entered and try again.";
    default:
      return undefined;
  }
}

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
}

export async function getAppInfo(): Promise<AppInfo> {
  return invoke<AppInfo>("get_app_info");
}

export async function greet(name: string): Promise<string> {
  return invoke<string>("greet", { name });
}
