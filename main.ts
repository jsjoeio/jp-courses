import {
  HELP_MESSAGE,
  START_WITH_NO_CONTENT_DIR,
  SUCCESS_MESSAGE,
} from "./lib/constants.ts";
import {
  downloadZipFromLink,
  handleArgs,
  isValidStartDir,
  logErrorMessage,
  removeZip,
  setDryRunEnv,
  unZipCourse,
  verifyPurchase,
} from "./lib/utils.ts";
import { startCourseServer } from "./lib/server.ts";
import { Args, ScriptFlagsAndArgs } from "./lib/types.ts";

/**
 * The main script that's called
 */
export async function main(args: string[]): Promise<void> {
  // We cast it because Deno.args is string[]
  // while our function only allows Args[]
  const scriptFlagsAndArgs: ScriptFlagsAndArgs = handleArgs(args as Args[]);

  const isHelpFlagEnabled = scriptFlagsAndArgs.flagsEnabled.help;
  const isDryRunFlagEnabled = scriptFlagsAndArgs.flagsEnabled.dryRun;
  const hasErrors = scriptFlagsAndArgs.errors.length > 0;
  const startArgPassed = scriptFlagsAndArgs.argsPassed.start;

  if (isHelpFlagEnabled) {
    console.log(HELP_MESSAGE);
    return;
  }

  if (isDryRunFlagEnabled) {
    setDryRunEnv();
  }

  if (hasErrors) {
    const errors = scriptFlagsAndArgs.errors;
    errors.forEach((e) => logErrorMessage(e));
    return;
  }

  if (startArgPassed) {
    const currentDir = Deno.cwd();
    const hasContentDir = await isValidStartDir(currentDir);
    if (!hasContentDir) {
      const errorMessage = START_WITH_NO_CONTENT_DIR(currentDir);
      logErrorMessage(errorMessage);
      return;
    }
    await startCourseServer();
    return;
  }

  // If paymentId is an empty string here
  // then we can assume the case that nothing
  // was passed and just return
  // only if it's not a dry run
  const paymentId = scriptFlagsAndArgs.argsPassed.paymentId;
  if (!isDryRunFlagEnabled && paymentId.trim() === "") {
    return;
  }

  const verifiedPurchase = await verifyPurchase(paymentId);

  if (verifiedPurchase.error) {
    logErrorMessage(verifiedPurchase.error);
    return;
  }

  if (verifiedPurchase) {
    // Download course to current directory
    await downloadZipFromLink(verifiedPurchase, "./");
  }

  // Unzip course to current directory
  await unZipCourse("course.zip", "./course");

  // Remove zip
  await removeZip("./course.zip");

  console.log(SUCCESS_MESSAGE);
}

await main(Deno.args);
