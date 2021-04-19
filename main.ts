import { HELP_FLAGS, HELP_MESSAGE, PAYMENT_ID_FLAGS } from "./lib/constants.ts";
import { handleArgs, logErrorMessage } from "./lib/utils.ts";
/*
This is so awesome! Way more DRY too

Might be worth including in the TS course

Credit: https://stackoverflow.com/a/54061487/3015595
*/
export type HelpFlag = typeof HELP_FLAGS[number];
// May try and validate this later
// credit: https://stackoverflow.com/questions/51445767/how-to-define-a-regex-matched-string-type-in-typescript
export type PaymentId = string;
export type PaymentIdArg = typeof PAYMENT_ID_FLAGS[number];
export type Args = HelpFlag | PaymentIdArg | PaymentId;

type FlagEnabled = boolean;

export type ScriptFlagsAndArgs = {
  flagsEnabled: {
    help: FlagEnabled;
    dryRun: FlagEnabled;
  };
  argsPassed: {
    paymentId: PaymentId;
  };
  errors: string[];
};

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
