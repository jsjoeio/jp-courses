import { PaymentId, PaymentIdArg } from "./types.ts";

export const DRY_RUN_ENV_KEY = "DRY_RUN";
export const HELP_FLAGS = ["-h", "--help"] as const;
export const DRY_RUN_FLAGS = ["--dry-run", "--dryRun"] as const;
export const PAYMENT_ID_FLAGS = ["-i", "--paymentId", "--payment-id"] as const;
export const START_ARG = ["start"] as const;
export const DENO_PERMISSION_FLAGS = [
  "--allow-net",
  "--allow-read",
  "--allow-write",
  "--allow-env",
  "--unstable",
] as const;
export const ERROR_MESSAGE_TEMPLATE = `❌ ERROR:`;
export const UNSUPPORTED_ARG = (arg: string) =>
  `Received unsupported arg or flag ${arg}.
   Please run with "--help" to see all options.`;

export const MISSING_PAYMENT_ID_VALUE = (arg: PaymentIdArg = "--paymentId") =>
  `Missing payment id.
   ${arg} requires a value like "${arg} your_id_here123"`;
export const MISSING_DOWNLOAD_LINK = (paymentId: PaymentId) =>
  `Failed to download course.
   Missing download link after verifying paymentId
   Your paymentId: ${paymentId}
   Please contact joe at joe previte [dot com]`;
export const INVALID_PAYMENT_ID_VALUE = (value: PaymentId) =>
  `Invalid payment id.
   Received: ${value}
   A valid payment id matches this pattern: cs_live_[alphanumeric]+`;
export const DIRECTORY_NOT_FOUND = (dir: string) =>
  `Directory not found.
   Received: ${dir}`;
export const FILE_NOT_FOUND = (file: string) =>
  `File not found.
   Received: ${file}`;
export const FAILED_TO_DOWNLOAD_ZIP = `Failed to download zip.
   Please try again.`;
export const COULD_NOT_VERIFY_PAYMENT_ID = (value: PaymentId) =>
  `Could not verify purchase using payment id: ${value}
   Please contact joe at joe previte [dot com]`;
export const SUCCESS_MESSAGE = `✔ Successfully downloaded course! 🎉`;
export const HELP_MESSAGE = `
Downloads the $COURSE_NAME for paid users.

Uses the following permissions (Deno flags):
  ${DENO_PERMISSION_FLAGS.join(", ")}
  Read more about permissions in the README
  https://github.com/jsjoeio/jp-courses-install#permissions

USAGE:
  <$CLI_NAME> [OPTIONS] (-i|--paymentId) <paymentId>

OPTIONS:
  ${DRY_RUN_FLAGS.join(", ")}
      Prints the commands for the download process without running them.

  ${HELP_FLAGS.join(", ")}
      Prints help information

ARGS:
  ${PAYMENT_ID_FLAGS.join(", ")}
      Required. Verifies course purchase.
      Example: $install_method --paymentId cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i

More information can be found at https://github.com/jsjoeio/jp-courses-install
`;
