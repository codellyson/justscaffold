import * as p from "@clack/prompts";
import { defineCommand } from "citty";

export const helloCommand = defineCommand({
  meta: {
    name: "hello",
    description: "Greet someone",
  },
  args: {
    name: {
      type: "positional",
      required: false,
      description: "Who to greet",
    },
  },

  async run({ args }) {
    let name = args.name;

    if (!name) {
      const answer = await p.text({ message: "Who should I greet?", defaultValue: "world" });
      if (p.isCancel(answer)) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
      name = answer;
    }

    p.outro(`Hello, ${name}!`);
  },
});
