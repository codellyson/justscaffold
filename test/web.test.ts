import { promises as fs } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { serializeRegistry, webRegistryPath } from "../scripts/gen-web.js";
import { listTemplates } from "../src/registry.js";

const webDir = path.dirname(webRegistryPath);

// registry.js is generated at build time, so there is no committed snapshot to
// drift from. What can still rot is the contract between the two files: the
// page reads globals the generator writes, and a rename on either side ships a
// site that renders its static markup and nothing else, with no error anywhere.
describe("web builder", () => {
  it("emits every global the page reads", async () => {
    const generated = await serializeRegistry();
    const page = await fs.readFile(path.join(webDir, "index.html"), "utf8");

    for (const global of ["SCAFFOLD_REGISTRY", "JUSTUI_VAR_MAP", "JUSTUI_THEMES"]) {
      expect(generated, `generator must assign window.${global}`).toContain(`window.${global} =`);
      expect(page, `page must read window.${global}`).toContain(`window.${global}`);
    }
  });

  // The page can only offer what the generator ran the real engine over.
  it("covers every registered template", async () => {
    const registry = await parseRegistry();
    expect(registry.templates.map((t) => t.id).sort()).toEqual(
      listTemplates()
        .map((t) => t.id)
        .sort(),
    );
    for (const template of registry.templates) {
      expect(template.tree.length, `${template.id} generated an empty tree`).toBeGreaterThan(0);
    }
  });

  // The theme catalog follows the selected template, so an empty side leaves
  // the switcher blank for every template on that side.
  it("bakes both halves of the theme catalog", async () => {
    const themes = await parseThemes();
    expect(themes.filter((t) => t.category === "consumer").length).toBeGreaterThan(0);
    expect(themes.filter((t) => t.category !== "consumer").length).toBeGreaterThan(0);
    for (const theme of themes) {
      expect(Object.keys(theme.light).length, `${theme.id} has no light variant`).toBeGreaterThan(0);
      expect(Object.keys(theme.dark).length, `${theme.id} has no dark variant`).toBeGreaterThan(0);
    }
  });
});

type Registry = { templates: { id: string; tree: string[] }[] };
type Theme = {
  id: string;
  category: string;
  light: Record<string, string>;
  dark: Record<string, string>;
};

// The generator emits assignments rather than JSON, so evaluate it the way the
// page does: run it against a stand-in window and read what it stamped on.
async function evaluate(): Promise<Record<string, unknown>> {
  const source = await serializeRegistry();
  const window: Record<string, unknown> = {};
  new Function("window", source)(window);
  return window;
}

async function parseRegistry(): Promise<Registry> {
  return (await evaluate()).SCAFFOLD_REGISTRY as Registry;
}

async function parseThemes(): Promise<Theme[]> {
  return (await evaluate()).JUSTUI_THEMES as Theme[];
}
