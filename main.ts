/*
This is so awesome! Way more DRY too

Might be worth including in the TS course

Credit: https://stackoverflow.com/a/54061487/3015595
*/
type HelpFlag = typeof HELP_FLAGS[number];
// May try and validate this later
// credit: https://stackoverflow.com/questions/51445767/how-to-define-a-regex-matched-string-type-in-typescript
type PaymentId = string;
type PaymentIdArg = typeof PAYMENT_ID_FLAGS[number];
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
};

const HELP_FLAGS = ["-h", "--help"] as const;
const PAYMENT_ID_FLAGS = ["-i", "--paymentId", "--payment-id"] as const;
export const ERROR_MESSAGE_TEMPLATE = `❌ ERROR:`;
export const UNSUPPORTED_ARG = (arg: string) =>
  `Received unsupported arg or flag ${arg}.
   Please run with "--help" to see all options.`;

export const MISSING_PAYMENT_ID_VALUE = (arg: PaymentIdArg) =>
  `Missing payment id.
   ${arg} requires a value like "${arg} your_id_here123"`;
export const INVALID_PAYMENT_ID_VALUE = (value: PaymentId) =>
  `Invalid payment id.
   Received: ${value}
   A valid payment id matches this pattern: cs_live_[alphanumeric]+`;
export const HELP_MESSAGE = `
Downloads the $COURSE_NAME for paid users.

USAGE:
  $install_method [OPTIONS] (-i|--paymentId) <paymentId>

OPTIONS:
  -d, --dry-run
      Prints the commands for the download process without running them.

  ${HELP_FLAGS.join(", ")}
      Prints help information

ARGS:
  ${PAYMENT_ID_FLAGS.join(", ")}
      Required. Verifies course purchase.
      Example: $install_method --paymentId cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i

More information can be found at https://github.com/jsjoeio/jp-courses-install
`;

/**
 * The main script that's called
 */
export function main(args: string[]): void {
  // We cast it because Deno.args is string[]
  // while our function only allows Args[]
  handleArgs(args as Args[]);
}

/**
 * Throws an error message using the ERROR_MESSAGE_TEMPLATE
 * and the message passed in
 */
export function handleErrorMessage(msg: string): void {
  /*
    The first implementation threw an Error
    but that crashes the program, and we don't want that.
    Bad UX.

    Instead, we log the error and exit the process gracefully.
  */
  console.error(`${ERROR_MESSAGE_TEMPLATE} ${msg}`);
  // TODO I don't think we should exit this script here
  // it's making testing difficult
  // I should probably extract to another function
  // and test separately
  Deno.exit(1);
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
  };
  args.forEach((arg, index) => {
    switch (arg) {
      /*
        We check for the -h/--help flag first
        because we ignore all the other flags
        print the message and exit the script.
      */
      case "-h":
      case "--help":
        console.log(HELP_MESSAGE);

        scriptFlagsAndArgs.flagsEnabled.help = true;
        // Exit script successfully
        // TODO extract into function
        // return Deno.exit(0);

        break;

      case "-i":
      case "--payment-id":
      case "--paymentId": {
        if (!hasNextArg(args, index)) {
          const errorMessage = MISSING_PAYMENT_ID_VALUE(arg);
          handleErrorMessage(errorMessage);
        }

        const paymentId = args[index + 1];
        const isValid = isValidPaymentIdValue(paymentId);
        if (!isValid) {
          const errorMessage = INVALID_PAYMENT_ID_VALUE(paymentId);
          handleErrorMessage(errorMessage);
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
        handleErrorMessage(
          unsupportedArgMessage,
        );
        break;
      }
    }
  });

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

main(Deno.args);
