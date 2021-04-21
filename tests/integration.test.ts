// Integration Tests
// Anything that isn't a full e2e but might rely on something else
// i.e. main because it calls other functions
import { main } from "../main.ts";
import { downloadZipFromLink } from "../lib/utils.ts";
import { VerifyPurchase } from "../lib/types.d.ts";
import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  DIRECTORY_NOT_FOUND,
  ERROR_MESSAGE_TEMPLATE,
  HELP_MESSAGE,
  MISSING_DOWNLOAD_LINK,
  UNSUPPORTED_ARG,
} from "../lib/constants.ts";
import { exists } from "https://deno.land/std@0.93.0/fs/mod.ts";
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

Deno.test({
  name: "downloadZipFromLink should error if no downloadLink",
  only: false,
  async fn() {
    let errorMessage = null;
    const error = console.error;

    console.error = (x) => {
      errorMessage = x;
    };
    const fakeVerifiedPurchase: VerifyPurchase = {
      paymentId: "cs_live_4321GHdfaJDK",
      verified: false,
      downloadLink: "",
      error: "Not verified",
    };

    const dir = `./tests/tmpDir`;
    await downloadZipFromLink(fakeVerifiedPurchase, dir);
    const expectedMessage = MISSING_DOWNLOAD_LINK(
      fakeVerifiedPurchase.paymentId,
    );

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMessage}`);
  },
});

Deno.test({
  name: "downloadZipFromLink should error if dir doesn't exist",
  only: false,
  async fn() {
    let errorMessage = null;
    const error = console.error;

    console.error = (x) => {
      errorMessage = x;
    };
    const fakeVerifiedPurchase: VerifyPurchase = {
      paymentId: "cs_live_4321GHdfaJDK",
      verified: true,
      downloadLink:
        "https://raw.githubusercontent.com/jsjoeio/install-scripts/main/fake-course.zip",
    };

    const dir = `./notExistantDir`;
    await downloadZipFromLink(fakeVerifiedPurchase, dir);
    const expectedMessage = DIRECTORY_NOT_FOUND(
      dir,
    );

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMessage}`);
  },
});

// TODO mock download request
Deno.test({
  name: "downloadZipFromLink should download zip to path passed in",
  only: true,
  async fn() {
    const fakeVerifiedPurchase: VerifyPurchase = {
      paymentId: "cs_live_4321GHdfaJDK",
      verified: true,
      downloadLink:
        "https://raw.githubusercontent.com/jsjoeio/install-scripts/main/fake-course.zip",
    };
    const expectedName = "course.zip";
    const dir = `./tmpDir`;
    const pathToZip = `${dir}/${expectedName}`;
    await downloadZipFromLink(fakeVerifiedPurchase, dir);

    const zipExists = await exists(pathToZip);
    assertEquals(zipExists, true);

    // Clean up
    Deno.remove(pathToZip);
  },
});
