#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { helloCommand } from "./commands/hello.js";
// @justscaffold:imports

const main = defineCommand({
  meta: {
    name: "__BIN_NAME__",
    description: "__PKG_DESCRIPTION__",
  },
  subCommands: {
    hello: helloCommand,
    // @justscaffold:subcommands
  },
});

void runMain(main);
