export const ERROR_MESSAGE_TEMPLATE = `❌ ERROR:`;
export const UNSUPPORTED_ARG = (arg: string) =>
  `Received unsupported arg or flag ${arg}. Please run --help to see all flags.`;
export const HELP_MESSAGE = `
Downloads the $COURSE_NAME for paid users.

USAGE:
  $install_method [OPTIONS] (-i|--paymentId) <paymentId>

OPTIONS:
  -d, --dry-run
      Prints the commands for the download process without running them.

  -h, --help
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
  args.forEach((arg) => {
    switch (arg) {
      case "--help":
        console.log(HELP_MESSAGE);
        break;

      default: {
        const unsupportedArgMessage = UNSUPPORTED_ARG(arg);
        throwErrorMessage(
          unsupportedArgMessage,
        );
        break;
      }
    }
  });
}

/**
 * Throws an error message using the ERROR_MESSAGE_TEMPLATE
 * and the message passed in
 */
export function throwErrorMessage(msg: string): Error {
  throw new Error(`${ERROR_MESSAGE_TEMPLATE} ${msg}`);
}

main(Deno.args);
