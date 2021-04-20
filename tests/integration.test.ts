// Integration Tests
// Anything that isn't a full e2e but might rely on something else
// i.e. main because it calls other functions
import { main } from "../main.ts";
import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  ERROR_MESSAGE_TEMPLATE,
  HELP_MESSAGE,
  UNSUPPORTED_ARG,
} from "../lib/constants.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

Deno.test({
  name: "main should log an error if cannot verify purchase",
  only: false,
  async fn() {
    // TODO eventually mock fetch
    // because this will fail otherwise
    // Save the real console.error
    // to restore later
    const paymentId =
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUJqO2i";
    const args = [
      "--paymentId",
      paymentId,
    ];
    const expectedMesage = COULD_NOT_VERIFY_PAYMENT_ID(paymentId);
    const error = console.error;

    let errorMessage = null;

    console.error = (x) => {
      errorMessage = x;
    };

    await main(args);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`);
  },
});

Deno.test({
  name: "main should take a --help flag",
  only: false,
  async fn() {
    // Save the real console.log
    // to restore later
    let message = null;
    let errorMessage = null;
    const log = console.log;
    const error = console.error;

    console.log = (x) => {
      message = x;
    };
    console.error = (x) => {
      errorMessage = x;
    };

    // Call main with the --help flag
    await main(["--help"]);

    console.log = log;
    console.error = error;
    assertEquals(message, HELP_MESSAGE);
    assertEquals(errorMessage, null);
  },
});

Deno.test({
  name: "main should take a -h flag (short for --help)",
  only: false,
  async fn() {
    // Save the real console.log
    // to restore later
    let message = null;
    let errorMessage = null;
    const log = console.log;
    const error = console.error;

    console.log = (x) => {
      message = x;
    };
    console.error = (x) => {
      errorMessage = x;
    };

    // Call main with the --help flag
    await main(["-h"]);

    console.log = log;
    console.error = error;
    assertEquals(message, HELP_MESSAGE);
    assertEquals(errorMessage, null);
  },
});

Deno.test({
  name: "main should log an error for unsupported flags",
  only: false,
  async fn() {
    // Save the real console.error
    // to restore later
    const arg = "--yolo";
    const expectedMesage = UNSUPPORTED_ARG(arg);
    const error = console.error;

    let errorMessage = null;

    console.error = (x) => {
      errorMessage = x;
    };

    await main([arg]);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`);
  },
});

Deno.test({
  name:
    "main should log the help message if called with an empty string or no args",
  only: false,
  async fn() {
    // Save the real console.log
    // to restore later
    let message = null;
    let errorMessage = null;
    const log = console.log;
    const error = console.error;

    console.log = (x) => {
      message = x;
    };
    console.error = (x) => {
      errorMessage = x;
    };

    // Call main with the --help flag
    await main([""]);

    console.log = log;
    console.error = error;
    assertEquals(message, HELP_MESSAGE);
    assertEquals(errorMessage, null);
  },
});

// TODO throw logs at every step and figure out why we're missing the payment id in the integration tests
