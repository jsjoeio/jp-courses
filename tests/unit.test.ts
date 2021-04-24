// Unit Tests
// Anything that doesn't rely on something else
// i.e. a simple function like checking for next arg
import { Args, ScriptFlagsAndArgs } from "../lib/types.ts";
import {
  handleArgs,
  hasNextArg,
  isValidPaymentIdValue,
  logErrorMessage,
  verifyPurchase,
} from "../lib/utils.ts";
import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  ERROR_MESSAGE_TEMPLATE,
  INVALID_PAYMENT_ID_VALUE,
  MISSING_PAYMENT_ID_VALUE,
  UNSUPPORTED_ARG,
} from "../lib/constants.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";
import {
  describe,
  test,
} from "https://x.nest.land/hooked-describe@0.1.0/mod.ts";

describe("hasNextArg", () => {
  test("should return true if there is another arg", () => {
    const fakeArgs: Args[] = ["--paymentId", "fakeid123"];
    const currentIndex = 0;
    const actual = hasNextArg(fakeArgs, currentIndex);
    const expected = true;

    assertEquals(actual, expected);
  });
  test("should return false if there is not another arg", () => {
    const fakeArgs: Args[] = ["--paymentId"];
    const currentIndex = 0;
    const actual = hasNextArg(fakeArgs, currentIndex);
    const expected = false;

    assertEquals(actual, expected);
  });
});

describe("isValidPaymentIdValue", () => {
  test("should return false if it doesn't match the pattern", () => {
    const fakePaymentIdValue = "hello2223";
    const actual = isValidPaymentIdValue(fakePaymentIdValue);
    assertEquals(actual, false);
  });
  test("should return true if value matches pattern", () => {
    const fakePaymentIdValue =
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i";
    const actual = isValidPaymentIdValue(fakePaymentIdValue);
    assertEquals(actual, true);
  });
});

describe("constants", () => {
  test("UNSUPPORTED_ARG should return error message", () => {
    const arg = "--joe";
    const actual = UNSUPPORTED_ARG(arg);
    assertEquals(
      actual,
      `Received unsupported arg or flag ${arg}.
   Please run with "--help" to see all options.`,
    );
  });
  test("MISSING_PAYMENT_ID_VALUE should return error message", () => {
    const arg = "--paymentId";
    const actual = MISSING_PAYMENT_ID_VALUE(arg);
    assertEquals(
      actual,
      `Missing payment id.
   ${arg} requires a value like "${arg} your_id_here123"`,
    );
  });
  test("INVALID_PAYMENT_ID_VALUE should return error message", () => {
    const value = "ck_liev_dsafk5w3";
    const actual = INVALID_PAYMENT_ID_VALUE(value);
    assertEquals(
      actual,
      `Invalid payment id.
   Received: ${value}
   A valid payment id matches this pattern: cs_live_[alphanumeric]+`,
    );
  });
  test("COULD_NOT_VERIFY_PAYMENT_ID should return error message", () => {
    const value = "ck_liev_dsafk5w3";
    const actual = COULD_NOT_VERIFY_PAYMENT_ID(value);
    assertEquals(
      actual,
      `Could not verify purchase using payment id: ${value}
   Please contact joe at joe previte [dot com]`,
    );
  });
});

describe("logErrorMessage", () => {
  test("should log message passed to it", () => {
    const fakeError = "no bueno";
    // Save the real console.error
    // to restore later
    let errorMessage = null;
    const error = console.error;

    console.error = (x) => {
      errorMessage = x;
    };

    logErrorMessage(fakeError);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${fakeError}`);
  });
});

describe("handleArgs", () => {
  test("should take a -h flag (short for --help)", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs(["-h"]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.help, true);
  });
  test("should take a -h flag (short for --help)", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs(["-h"]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.help, true);
  });
  test("should take a -h flag (short for --help)", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs(["-h"]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.help, true);
  });
  test("should take a --help flag", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs(["-h"]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.help, true);
  });
  test("should enable the help flag if called with an empty string", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs([""]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.help, true);
  });
  test("should enable the help flag if called with a long empty string", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs(["      "]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.help, true);
  });
  test("have an error if --paymentId is passed without a value", () => {
    const arg = "--paymentId";
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs([arg]);
    const errorMessage = MISSING_PAYMENT_ID_VALUE(arg);

    assertEquals(scriptArgsAndFlags.errors.includes(errorMessage), true);
  });
  test("have an error if --paymentId is passed without a value", () => {
    const arg = "--paymentId";
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs([arg]);
    const errorMessage = MISSING_PAYMENT_ID_VALUE(arg);

    assertEquals(scriptArgsAndFlags.errors.includes(errorMessage), true);
  });
  test("have an error if --paymentId is passed with an invalid value", () => {
    const arg = "--paymentId";
    const invalidValue = "cs_jj_hello12432134";
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs([
      arg,
      invalidValue,
    ]);
    const errorMessage = INVALID_PAYMENT_ID_VALUE(invalidValue);

    assertEquals(scriptArgsAndFlags.errors.includes(errorMessage), true);
  });
  test("should return an object with the paymentId", () => {
    const scriptFlagsAndArgs: ScriptFlagsAndArgs = handleArgs([
      "--paymentId",
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i",
    ]);
    const actualPaymentId = scriptFlagsAndArgs.argsPassed.paymentId;
    const expected =
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i";

    assertEquals(actualPaymentId, expected);
  });
});

describe("verifyPurchase", () => {
  test("verifyPurchase should return an error if called with an empty string", async () => {
    const paymentId = "";
    const verifiedPurchase = await verifyPurchase(paymentId);
    const actualErrorMessage = verifiedPurchase.error;
    const expected = MISSING_PAYMENT_ID_VALUE("--paymentId");

    assertEquals(actualErrorMessage, expected);
  });
  test("verifyPurchase should return a VerifiedPurchase object with a downloadLink", async () => {
    const paymentId =
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i";
    const verifiedPurchase = await verifyPurchase(paymentId);
    const actualDownloadLink = verifiedPurchase.downloadLink;
    const expected =
      "https://raw.githubusercontent.com/jsjoeio/install-scripts/main/fake-course.zip";

    assertEquals(actualDownloadLink, expected);
  });
});

describe("removeZip", () => {
  test("should do nothing if zip doesn't exist", () => {
    // do nothing
  })
})
