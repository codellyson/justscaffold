import { defineCommand } from "citty";
import { appliesTo } from "../core/resolve.js";
import { listFeatures, listTemplates } from "../registry.js";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List available templates and features",
  },

  run() {
    console.log("Templates:");
    for (const t of listTemplates()) {
      console.log(`  ${t.id.padEnd(6)} ${t.title} — ${t.hint}`);
    }

    console.log("\nFeatures:");
    for (const f of listFeatures()) {
      const scope =
        f.appliesTo === "*"
          ? "all"
          : listTemplates()
              .filter((t) => appliesTo(f, t.id))
              .map((t) => t.id)
              .join(",");
      const flags = [f.recommended ? "recommended" : null, `applies: ${scope}`]
        .filter(Boolean)
        .join(", ");
      console.log(`  ${f.id.padEnd(16)} ${f.title} — ${f.hint} (${flags})`);
    }
  },
});
