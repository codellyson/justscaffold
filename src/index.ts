#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { listCommand } from "./commands/list.js";
import { newCommand } from "./commands/new.js";

const main = defineCommand({
  meta: {
    name: "justscaffold",
    description: "Scaffold apps from composable templates and opt-in feature modules.",
  },
  subCommands: {
    new: newCommand,
    list: listCommand,
  },
});

void runMain(main);
