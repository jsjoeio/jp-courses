/*
This is so awesome! Way more DRY too

Might be worth including in the TS course

Credit: https://stackoverflow.com/a/54061487/3015595
*/
type HelpFlag = typeof HELP_FLAGS[number];
// May try and validate this later
// credit: https://stackoverflow.com/questions/51445767/how-to-define-a-regex-matched-string-type-in-typescript
type PaymentId = string;
type PaymentIdFlag = typeof PAYMENT_ID_FLAGS[number];
export type Args = HelpFlag | PaymentIdFlag | PaymentId;

const HELP_FLAGS = ["-h", "--help"] as const;
const PAYMENT_ID_FLAGS = ["-i", "--paymentId", "--payment-id"] as const;
export const ERROR_MESSAGE_TEMPLATE = `❌ ERROR:`;
export const UNSUPPORTED_ARG = (arg: string) =>
  `Received unsupported arg or flag ${arg}.
   Please run with "--help" to see all flags.`;

export const MISSING_PAYMENT_ID_VALUE = (arg: PaymentIdFlag) =>
  `Missing payment id.
   ${arg} requires a value like "${arg} your_id_here123"`;
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
  Deno.exit(1);
}

export function handleArgs(args: Args[]) {
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
        // Exit script successfully
        return Deno.exit(0);

      case "-i":
      case "--payment-id":
      case "--paymentId": {
        if (!hasNextArg(args, index)) {
          const errorMessage = MISSING_PAYMENT_ID_VALUE(arg);
          handleErrorMessage(errorMessage);
        }

        // TODO check if next value is a validPaymentId

        // if it's there, return it somehow.
        console.log("TODO implement happy case");
        break;
      }

      default: {
        const unsupportedArgMessage = UNSUPPORTED_ARG(arg);
        handleErrorMessage(
          unsupportedArgMessage,
        );
        break;
      }
    }
  });
}

export function hasNextArg(arr: Args[], currentIndex: number): boolean {
  // const length = arr.length;
  const nextIndex = currentIndex + 1;

  if (arr[nextIndex]) {
    return true;
  }
  return false;
}

main(Deno.args);
