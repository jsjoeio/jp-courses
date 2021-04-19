// Integration Tests
// Anything that isn't a full e2e but might rely on something else
// i.e. handleArgs because it calls other functions like handleErrorMessage
import {
  ERROR_MESSAGE_TEMPLATE,
  handleArgs,
  handleErrorMessage,
  HELP_MESSAGE,
  INVALID_PAYMENT_ID_VALUE,
  main,
  MISSING_PAYMENT_ID_VALUE,
  ScriptFlagsAndArgs,
  UNSUPPORTED_ARG,
} from "../main.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

// TODO move out the tests that are integration i.e. sanitizeExit: false
/*
  NOTE: we use sanitizeExit: false
  because the help flag exits the script
  and we don't want the test assertion to think
  that's a false test success

  See docs:
  https://deno.land/manual/testing#exit-sanitizer
*/
Deno.test({
  name: "main should take a --help flag",
  fn() {
    // Save the real console.log
    // to restore later
    let message = null;
    const log = console.log;

    console.log = (x) => {
      message = x;
    };

    // Call main with the --help flag
    main(["--help"]);

    console.log = log;
    assertEquals(message, HELP_MESSAGE);
  },
  sanitizeExit: false,
});

Deno.test({
  name: "main should take a -h flag (short for --help)",
  fn() {
    // Save the real console.log
    // to restore later
    let message = null;
    const log = console.log;

    console.log = (x) => {
      message = x;
    };

    // Call main with the --help flag
    main(["-h"]);

    console.log = log;
    assertEquals(message, HELP_MESSAGE);
  },
  sanitizeExit: false,
});

Deno.test({
  name: "handleArgs should take a -h flag (short for --help)",
  fn() {
    // Save the real console.log
    // to restore later
    let message = null;
    const log = console.log;

    console.log = (x) => {
      message = x;
    };

    // Call main with the --help flag
    handleArgs(["-h"]);

    console.log = log;
    assertEquals(message, HELP_MESSAGE);
  },
  sanitizeExit: false,
});

Deno.test({
  name: "handleArgs should take a --help flag",
  fn() {
    // Save the real console.log
    // to restore later
    let message = null;
    const log = console.log;

    console.log = (x) => {
      message = x;
    };

    // Call main with the --help flag
    handleArgs(["--help"]);

    console.log = log;
    assertEquals(message, HELP_MESSAGE);
  },
  sanitizeExit: false,
});

Deno.test({
  name:
    "handleArgs should log an error if --paymentId is passed without a value",
  fn() {
    // Save the real console.error
    // to restore later
    let errorMessage = null;
    const error = console.error;

    console.error = (x) => {
      errorMessage = x;
    };

    handleArgs(["--paymentId"]);

    console.error = error;
    assertEquals(
      errorMessage,
      `${ERROR_MESSAGE_TEMPLATE} ${MISSING_PAYMENT_ID_VALUE}`,
    );
  },
  sanitizeExit: false,
});

Deno.test({
  name: "main should throw an error for unsupported flags",
  fn() {
    // Save the real console.error
    // to restore later
    const arg = "--yolo";
    const expectedMesage = UNSUPPORTED_ARG(arg);
    const error = console.error;

    let errorMessage = null;

    console.error = (x) => {
      errorMessage = x;
    };

    main([arg]);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`);
  },
  sanitizeExit: false,
});

Deno.test({
  name:
    "handleErrorMessage should log message passed to it and exit gracefully",
  fn() {
    const fakeError = "no bueno";
    // Save the real console.error
    // to restore later
    let errorMessage = null;
    const error = console.error;

    console.error = (x) => {
      errorMessage = x;
    };

    handleErrorMessage(fakeError);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${fakeError}`);
  },
  sanitizeExit: false,
});

Deno.test({
  name:
    "handleArgs should log an error if --paymentId is passed without an invalid value",
  fn() {
    // Save the real console.error
    // to restore later
    let errorMessage = null;
    const error = console.error;

    console.error = (x) => {
      errorMessage = x;
    };

    handleArgs(["--paymentId", "csliveeee234523"]);

    console.error = error;
    assertEquals(
      errorMessage,
      `${ERROR_MESSAGE_TEMPLATE} ${INVALID_PAYMENT_ID_VALUE}`,
    );
  },
  sanitizeExit: false,
});

Deno.test({
  name: "handleArgs should return an object with the paymentId",
  fn() {
    const scriptFlagsAndArgs: ScriptFlagsAndArgs = handleArgs([
      "--paymentId",
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i",
    ]);
    const actualPaymentId = scriptFlagsAndArgs.argsPassed.paymentId;
    const expected =
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i";

    assertEquals(actualPaymentId, expected);
  },
  sanitizeExit: false,
});
