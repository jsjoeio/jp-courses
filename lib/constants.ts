import { PaymentId, PaymentIdArg } from "./types.d.ts";

export const HELP_FLAGS = ["-h", "--help"] as const;
export const PAYMENT_ID_FLAGS = ["-i", "--paymentId", "--payment-id"] as const;
export const ERROR_MESSAGE_TEMPLATE = `❌ ERROR:`;
export const UNSUPPORTED_ARG = (arg: string) =>
  `Received unsupported arg or flag ${arg}.
   Please run with "--help" to see all options.`;

export const MISSING_PAYMENT_ID_VALUE = (arg: PaymentIdArg = "--paymentId") =>
  `Missing payment id.
   ${arg} requires a value like "${arg} your_id_here123"`;
export const INVALID_PAYMENT_ID_VALUE = (value: PaymentId) =>
  `Invalid payment id.
   Received: ${value}
   A valid payment id matches this pattern: cs_live_[alphanumeric]+`;
export const COULD_NOT_VERIFY_PAYMENT_ID = (value: PaymentId) =>
  `Could not verify purchase using payment id: ${value}
   Please contact joe at joe previte [dot com]`;
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
