import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  DIRECTORY_NOT_FOUND,
  ERROR_MESSAGE_TEMPLATE,
  INVALID_PAYMENT_ID_VALUE,
  MISSING_DOWNLOAD_LINK,
  MISSING_PAYMENT_ID_VALUE,
  UNSUPPORTED_ARG,
} from "./constants.ts";
import {
  Args,
  PaymentId,
  ScriptFlagsAndArgs,
  VerifyPurchase,
  VerifyPurchaseResponse,
} from "./types.d.ts";
import { exists } from "https://deno.land/std@0.93.0/fs/mod.ts";
import {
  Destination,
  download,
} from "https://deno.land/x/download@v1.0.1/mod.ts";

/**
 * Logs an error message using the ERROR_MESSAGE_TEMPLATE
 * and the message passed in
 */
export function logErrorMessage(msg: string): void {
  console.error(`${ERROR_MESSAGE_TEMPLATE} ${msg}`);
}

/**
 * Exits the script with exit code 1
 */
export function exitScriptWithError() {
  Deno.exit(1);
}

/**
 * Exits the script with exit code 0
 */
export function exitScriptWithSuccess() {
  Deno.exit(0);
}

export function handleArgs(args: Args[]): ScriptFlagsAndArgs {
  const scriptFlagsAndArgs: ScriptFlagsAndArgs = {
    flagsEnabled: {
      help: false,
      dryRun: false,
    },
    argsPassed: {
      paymentId: "",
    },
    errors: [],
  };

  // This is a label for the loop
  // we do this so that we can break the outerLoop
  // from inside the switch statement
  // See: https://stackoverflow.com/questions/17072605/break-for-loop-from-inside-of-switch-case-in-javascript
  //
  outerLoop:
  for (let index = 0; index < args.length; index++) {
    // We trim in case there's extra space before or after the arg
    const arg = args[index].trim();
    switch (arg) {
      /*
        We check for the -h/--help flag first
        because we ignore all the other flags
        print the message and exit the script.
      */
      case "":
      case "-h":
      case "--help":
        scriptFlagsAndArgs.flagsEnabled.help = true;
        break outerLoop;
      case "-i":
      case "--payment-id":
      case "--paymentId": {
        if (!hasNextArg(args, index)) {
          const errorMessage = MISSING_PAYMENT_ID_VALUE(arg);
          scriptFlagsAndArgs.errors.push(errorMessage);
          break outerLoop;
        }

        const paymentId = args[index + 1];
        const isValid = isValidPaymentIdValue(paymentId);
        if (!isValid) {
          const errorMessage = INVALID_PAYMENT_ID_VALUE(paymentId);
          scriptFlagsAndArgs.errors.push(errorMessage);
          break outerLoop;
        }

        scriptFlagsAndArgs.argsPassed.paymentId = paymentId;
        break;
      }

      default: {
        // Since paymentIdValue is a string
        // we can't write a specific case for it
        // but we can check here and break if it's found
        const isPaymentId = isValidPaymentIdValue(arg);
        if (isPaymentId) {
          break;
        }

        // Otherwise, it's probably and unsupported flag
        const unsupportedArgMessage = UNSUPPORTED_ARG(arg);
        scriptFlagsAndArgs.errors.push(unsupportedArgMessage);
        break outerLoop;
      }
    }
  }

  return scriptFlagsAndArgs;
}

export function hasNextArg(arr: Args[], currentIndex: number): boolean {
  const nextIndex = currentIndex + 1;

  if (arr[nextIndex]) {
    return true;
  }
  return false;
}

export function isValidPaymentIdValue(value: string): boolean {
  const pattern = /cs_live_[a-zA-Z0-9]+/g;
  const regex = new RegExp(pattern);

  return regex.test(value);
}

export async function verifyPurchase(
  paymentId: PaymentId,
): Promise<VerifyPurchase> {
  const verifiedPurchase: VerifyPurchase = {
    verified: false,
    downloadLink: "",
    error: null,
    paymentId,
  };

  if (paymentId.trim() === "") {
    verifiedPurchase.error = MISSING_PAYMENT_ID_VALUE("--paymentId");
    return verifiedPurchase;
  }

  const response = await fetch(
    `https://joeprevite.com/.netlify/functions/verify-course-purchase?paymentId=${paymentId}`,
  );

  const json: VerifyPurchaseResponse = await response.json();

  // If verified is a property, we know it was successful
  // Credit: https://stackoverflow.com/a/49363671/3015595
  if ("verified" in json) {
    verifiedPurchase.verified = json.verified;
    verifiedPurchase.downloadLink = json.downloadLink;
  } else {
    verifiedPurchase.error = COULD_NOT_VERIFY_PAYMENT_ID(paymentId);
  }

  return verifiedPurchase;
}

export async function downloadZipFromLink(
  verifiedPurchase: VerifyPurchase,
  dir: string,
): Promise<void> {
  const { downloadLink, paymentId } = verifiedPurchase;
  if (!downloadLink) {
    const errorMessage = MISSING_DOWNLOAD_LINK(paymentId);
    logErrorMessage(errorMessage);
    return;
  }

  try {
    const destination: Destination = {
      file: "course.zip",
      dir,
    };
    const dirExists = await exists(dir);
    if (!dirExists) {
      const errorMessage = DIRECTORY_NOT_FOUND(dir);
      logErrorMessage(errorMessage);
      return;
    }

    await download(downloadLink, destination);
    return;
  } catch (error) {
    if (error && error.message && error.message.includes("directory")) {
      const errorMessage = DIRECTORY_NOT_FOUND(dir);
      logErrorMessage(errorMessage);
      return;
    }
    logErrorMessage(error.message);
    return;
  }
}
