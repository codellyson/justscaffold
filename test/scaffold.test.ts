import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { scaffold } from "../src/core/apply.js";
import { ScaffoldError } from "../src/core/errors.js";
import { isBinaryPath, templatesRoot } from "../src/core/fs-utils.js";
import { featuresForTemplate } from "../src/core/resolve.js";
import { listTemplates } from "../src/registry.js";
import type { ScaffoldContext, TemplateId } from "../src/core/types.js";

const roots: string[] = [];

afterAll(async () => {
  await Promise.all(roots.map((r) => fs.rm(r, { recursive: true, force: true })));
});

async function generate(
  template: TemplateId,
  features: string[],
  pkgName = "test-app",
): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "justscaffold-"));
  roots.push(root);
  const targetDir = path.join(root, "app");

  const ctx: ScaffoldContext = {
    targetDir,
    pkgName,
    description: "Generated during tests.",
    template,
    features,
    year: "2026",
  };

  await scaffold(ctx);
  return targetDir;
}

async function read(dir: string, rel: string): Promise<string> {
  return fs.readFile(path.join(dir, rel), "utf8");
}

describe.each(listTemplates())("template: $id", (template) => {
  it("generates a package.json with the requested name", async () => {
    const dir = await generate(template.id, []);
    const pkg = JSON.parse(await read(dir, "package.json"));
    expect(pkg.name).toBe("test-app");
    expect(pkg.description).toBe("Generated during tests.");
  });

  it("leaves no unsubstituted tokens or anchors behind", async () => {
    const dir = await generate(
      template.id,
      featuresForTemplate(template.id).map((f) => f.id),
    );

    for (const file of await walk(dir)) {
      if (isBinaryPath(file)) continue;
      const contents = await fs.readFile(file, "utf8");
      const rel = path.relative(dir, file);
      expect(contents, `${rel} has an unsubstituted token`).not.toMatch(/__[A-Z_]+__/);
      expect(contents, `${rel} has a leftover anchor`).not.toMatch(/@justscaffold:/);
    }
  });

  it("renames _gitignore to .gitignore", async () => {
    const dir = await generate(template.id, []);
    await expect(fs.access(path.join(dir, ".gitignore"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(dir, "_gitignore"))).rejects.toThrow();
  });
});

describe("features", () => {
  it("merges scripts and devDependencies into package.json", async () => {
    const dir = await generate("lib", ["vitest"]);
    const pkg = JSON.parse(await read(dir, "package.json"));
    expect(pkg.scripts.test).toBe("vitest run");
    expect(pkg.scripts.build).toBe("tsc -p tsconfig.json");
    expect(pkg.devDependencies).toHaveProperty("vitest");
    expect(pkg.devDependencies).toHaveProperty("typescript");
  });

  it("patches auth into the api entry point", async () => {
    const dir = await generate("api", ["auth"]);
    const entry = await read(dir, "src/index.ts");
    expect(entry).toContain('import { requireAuth } from "./auth.js"');
    expect(entry).toContain('app.use("/api/*", requireAuth)');
    await expect(fs.access(path.join(dir, "src/auth.ts"))).resolves.toBeUndefined();
  });

  it("does not add auth files when the feature is off", async () => {
    const dir = await generate("api", []);
    const entry = await read(dir, "src/index.ts");
    expect(entry).not.toContain("requireAuth");
    await expect(fs.access(path.join(dir, "src/auth.ts"))).rejects.toThrow();
  });

  it("rejects a feature that does not apply to the template", async () => {
    await expect(generate("lib", ["auth"])).rejects.toMatchObject({
      kind: "feature-not-applicable",
    });
  });

  it("rejects an unknown feature", async () => {
    await expect(generate("lib", ["nope"])).rejects.toMatchObject({ kind: "unknown-feature" });
  });

  it("keeps package.json dependency maps sorted", async () => {
    const dir = await generate("api", ["auth", "vitest"]);
    const pkg = JSON.parse(await read(dir, "package.json"));
    const keys = Object.keys(pkg.devDependencies);
    expect(keys).toEqual([...keys].sort());
  });
});

describe("tauri", () => {
  it("copies the icon byte-for-byte", async () => {
    const dir = await generate("tauri", []);
    const generated = await fs.readFile(path.join(dir, "src-tauri/icons/icon.png"));
    const original = await fs.readFile(path.join(templatesRoot(), "tauri/src-tauri/icons/icon.png"));
    expect(generated.equals(original)).toBe(true);
    // A utf8 round-trip would mangle the header rather than shortening the file.
    expect(generated.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  });

  // tauri-build fails on Windows without an .ico, regardless of what
  // bundle.icon lists. Shipping only a .png silently breaks every Windows build.
  it("ships a Windows .ico alongside the PNGs", async () => {
    const dir = await generate("tauri", []);
    const ico = await fs.readFile(path.join(dir, "src-tauri/icons/icon.ico"));
    expect(ico.readUInt16LE(0)).toBe(0); // reserved
    expect(ico.readUInt16LE(2)).toBe(1); // type: icon
    expect(ico.readUInt16LE(4)).toBeGreaterThan(0); // at least one image

    const conf = JSON.parse(await read(dir, "src-tauri/tauri.conf.json"));
    expect(conf.bundle.icon).toContain("icons/icon.ico");
  });

  it("derives a Rust-safe crate name from a scoped package name", async () => {
    const dir = await generate("tauri", [], "@acme/my-cool-app");
    const cargo = await read(dir, "src-tauri/Cargo.toml");
    expect(cargo).toContain('name = "my_cool_app"');
    expect(cargo).toContain('name = "my_cool_app_lib"');
    const mainRs = await read(dir, "src-tauri/src/main.rs");
    expect(mainRs).toContain("my_cool_app_lib::run()");
  });

  it("bumps all three version files in the release script", async () => {
    const dir = await generate("tauri", ["release-script"]);
    const script = await read(dir, "scripts/release.sh");
    expect(script).toContain("package.json");
    expect(script).toContain("src-tauri/Cargo.toml");
    expect(script).toContain("src-tauri/tauri.conf.json");
  });

  it("bumps only package.json for non-tauri templates", async () => {
    const dir = await generate("lib", ["release-script"]);
    const script = await read(dir, "scripts/release.sh");
    expect(script).not.toContain("Cargo.toml");
  });

  it("adds a cargo check job and a release workflow in CI", async () => {
    const dir = await generate("tauri", ["github-actions"]);
    expect(await read(dir, ".github/workflows/ci.yml")).toContain("cargo check --locked");
    expect(await read(dir, ".github/workflows/release.yml")).toContain("tauri-apps/tauri-action");
  });

  it("does not add a release workflow for non-tauri templates", async () => {
    const dir = await generate("api", ["github-actions"]);
    await expect(fs.access(path.join(dir, ".github/workflows/release.yml"))).rejects.toThrow();
  });
});

describe("validation", () => {
  it("rejects an invalid package name", async () => {
    await expect(generate("lib", [], "Not Valid!")).rejects.toBeInstanceOf(ScaffoldError);
  });

  it("refuses to overwrite a non-empty directory", async () => {
    const dir = await generate("lib", []);
    const ctx: ScaffoldContext = {
      targetDir: dir,
      pkgName: "test-app",
      description: "again",
      template: "lib",
      features: [],
      year: "2026",
    };
    await expect(scaffold(ctx)).rejects.toMatchObject({ kind: "target-exists" });
  });
});

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}
