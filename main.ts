import { HELP_MESSAGE } from "./lib/constants.ts";
import { handleArgs, logErrorMessage } from "./lib/utils.ts";
import { Args, ScriptFlagsAndArgs } from "./lib/types.d.ts";

/**
 * The main script that's called
 */
export function main(args: string[]): void {
  // We cast it because Deno.args is string[]
  // while our function only allows Args[]
  const scriptFlagsAndArgs: ScriptFlagsAndArgs = handleArgs(args as Args[]);

  const isHelpFlagEnabled = scriptFlagsAndArgs.flagsEnabled.help;
  const hasErrors = scriptFlagsAndArgs.errors.length > 0;

  if (isHelpFlagEnabled) {
    console.log(HELP_MESSAGE);
    return;
  }

  if (hasErrors) {
    const errors = scriptFlagsAndArgs.errors;
    errors.forEach((e) => logErrorMessage(e));
    return;
  }
}

main(Deno.args);
