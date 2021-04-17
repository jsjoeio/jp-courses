type PaymentId = string;

enum HelpFlag {
  SHORT_FLAG = "-h",
  LONG_FLAG = "--help",
}

interface FlagAsInterface {
  SHORT_FLAG: string;
  LONG_FLAG: string;
}

interface HelpFlagAsInterface extends FlagAsInterface {
  SHORT_FLAG: "hi";
}

enum FlagEnum {
  shortFlag = "a",
  longFlag = "b",
}

const helpFlags: Map<FlagEnum, string> = new Map([
  [FlagEnum.shortFlag, "-h"],
  [FlagEnum.longFlag, "--help"],
]);

/*

TODO honestly not sure which data structure to use here

It should probably just be an object

like

flag.shortFlag = string
flag.longFlag = string

TODO

maybe create a builderFunction to build a flag?


I'm probably completely overengineering this

*/

enum PaymentIdFlag {
  "i",
  "--paymentId",
  "--payment-id",
}

type HelpFlags = "-h" | "--help";

const HELP_FLAG = Object.values(HelpFlag);

export type Args = HelpFlag | PaymentIdFlag | PaymentId;
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

  ${Object.values(HelpFlag).split(",")}
      Prints help information

ARGS:
  -i, --paymentId
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
