import {
  Args,
  ERROR_MESSAGE_TEMPLATE,
  handleArgs,
  handleErrorMessage,
  hasNextArg,
  HELP_MESSAGE,
  main,
  MISSING_PAYMENT_ID_VALUE,
  UNSUPPORTED_ARG,
} from "../main.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

Deno.test("hello world", () => {
  const actual = () => "Hello world!";
  const expected = "Hello world!";
  assertEquals(actual(), expected);
});

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
  name: "hasNextArg should return true if there is another arg",
  fn() {
    const fakeArgs: Args[] = ["--paymentId", "fakeid123"];
    const currentIndex = 0;
    const actual = hasNextArg(fakeArgs, currentIndex);
    const expected = true;

    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "hasNextArg should return false if there is not another arg",
  fn() {
    const fakeArgs: Args[] = ["--paymentId"];
    const currentIndex = 0;
    const actual = hasNextArg(fakeArgs, currentIndex);
    const expected = false;

    assertEquals(actual, expected);
  },
});
