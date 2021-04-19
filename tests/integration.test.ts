// Integration Tests
// Anything that isn't a full e2e but might rely on something else
// i.e. main because it calls other functions
import {
  ERROR_MESSAGE_TEMPLATE,
  HELP_MESSAGE,
  main,
  UNSUPPORTED_ARG,
} from "../main.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

Deno.test({
  name: "main should take a --help flag",
  only: false,
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
});

Deno.test({
  name: "main should take a -h flag (short for --help)",
  only: false,
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
});

Deno.test({
  name: "main should log an error for unsupported flags",
  only: false,
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
});
