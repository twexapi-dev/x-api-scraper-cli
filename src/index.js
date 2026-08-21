import { loadConfig } from "./config.js";
import { isHelpRequest, printCommandHelp } from "./command-help.js";
import { printHelp } from "./help.js";
import { parseGlobalArgs } from "./parser.js";
import { runCommand } from "./commands.js";
import { exitWithError } from "./utils.js";

export async function main(argv = process.argv.slice(2)) {
  const state = parseGlobalArgs(argv);
  if (state.commandArgs.length === 0) {
    printHelp();
    return;
  }

  if (isHelpRequest(state)) {
    if (!printCommandHelp(state.commandArgs)) {
      exitWithError(`Unknown command: ${state.commandArgs[0]}`, "Run x-api-scraper --help for usage.");
    }
    return;
  }

  const config = await loadConfig(state.configDir);
  await runCommand(state, config);
}
