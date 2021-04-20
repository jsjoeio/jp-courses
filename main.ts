import { HELP_MESSAGE, MISSING_PAYMENT_ID_VALUE } from "./lib/constants.ts";
import { handleArgs, logErrorMessage, verifyPurchase } from "./lib/utils.ts";
import { Args, ScriptFlagsAndArgs } from "./lib/types.d.ts";

/**
 * The main script that's called
 */
export async function main(args: string[]): Promise<void> {
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

  // If paymentId is an empty string here
  // then we can assume the case that nothing
  // was passed and just return
  const paymentId = scriptFlagsAndArgs.argsPassed.paymentId;
  if (paymentId.trim() === "") {
    return;
  }

  const verifiedPurchase = await verifyPurchase(paymentId);

  if (verifiedPurchase.error) {
    logErrorMessage(verifiedPurchase.error);
    return;
  }
}

await main(Deno.args);
