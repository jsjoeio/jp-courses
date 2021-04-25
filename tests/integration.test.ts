// Integration Tests
// Anything that isn't a full e2e but might rely on something else
// i.e. main because it calls other functions
import { main } from "../main.ts";
import {
  downloadZipFromLink,
  getDryRunEnv,
  unZipCourse,
} from "../lib/utils.ts";
import { VerifyPurchase } from "../lib/types.ts";
import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  DIRECTORY_NOT_FOUND,
  DRY_RUN_ENV_KEY,
  ERROR_MESSAGE_TEMPLATE,
  FILE_NOT_FOUND,
  HELP_MESSAGE,
  MISSING_DOWNLOAD_LINK,
  UNSUPPORTED_ARG,
} from "../lib/constants.ts";
import { exists } from "https://deno.land/std@0.93.0/fs/mod.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";
import { JSZip } from "https://deno.land/x/jszip@0.9.0/mod.ts";

import {
  afterEach,
  beforeEach,
  describe,
  test,
} from "https://x.nest.land/hooked-describe@0.1.0/mod.ts";

describe("main", () => {
  test("should log an error if cannot verify purchase", async () => {
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
  });
  test("should log an error if cannot verify purchase", async () => {
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
  });
  test("should take a --help flag", async () => {
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
  });
  test("should take a -h flag (short for --help)", async () => {
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
  });
  test("should take a --dry-run flag and set DRY_RUN", async () => {
    await main(["--dry-run"]);
    const DRY_RUN = getDryRunEnv();

    assertEquals(DRY_RUN, "0");

    // Clean up
    Deno.env.delete(DRY_RUN_ENV_KEY);
  });
  test("should take a --dryRun flag and set DRY_RUN", async () => {
    await main(["--dryRun"]);
    const DRY_RUN = getDryRunEnv();

    assertEquals(DRY_RUN, "0");

    // Clean up
    Deno.env.delete(DRY_RUN_ENV_KEY);
  });
  test("should not set DRY_RUN env if flag not passed", async () => {
    // Call main with the --help flag
    await main(["--help"]);

    const DRY_RUN = getDryRunEnv;

    assertEquals(DRY_RUN, undefined);
  });
  test("should log an error for unsupported flags", async () => {
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
  });
  test("should log the help message if called with an empty string or no args", async () => {
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
  });
  test("should download the course.zip to the directory it's running in", async () => {
    const pathToZip = "./course.zip";
    // Call main with the --help flag
    await main([
      "--paymentId",
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i",
    ]);

    const zipExists = await exists(pathToZip);
    assertEquals(zipExists, true);

    // Clean up
    Deno.remove(pathToZip);
  });
  test("should download, unzip the course and remove zip in the current directory", async () => {
    const pathToZip = "./course.zip";
    const pathToUnzipped = "./course";
    // Call main with the --help flag
    await main([
      "--paymentId",
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i",
    ]);

    const zipExists = await exists(pathToZip);
    assertEquals(zipExists, false);

    const unZippedExists = await exists(pathToUnzipped);
    assertEquals(unZippedExists, true);

    // Clean up
    Deno.remove(pathToUnzipped, { recursive: true });
  });
});

// TODO throw logs at every step and figure out why we're missing the payment id in the integration tests

describe("downloadZipFromLink", () => {
  let tmpDirPath = "";
  let pathToZip = "";
  const expectedName = "course.zip";
  const prefix = `dowloadZipFromLink`;

  beforeEach(async () => {
    tmpDirPath = await Deno.makeTempDir({ prefix });
    pathToZip = `${tmpDirPath}/${expectedName}`;
  });
  afterEach(() => {
    // Clean up
    Deno.remove(tmpDirPath, { recursive: true });
  });
  test("should error if no downloadLink", async () => {
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

    await downloadZipFromLink(fakeVerifiedPurchase, "./tmpDir");
    const expectedMessage = MISSING_DOWNLOAD_LINK(
      fakeVerifiedPurchase.paymentId,
    );

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMessage}`);
  });
  test("should error if dir doesn't exist", async () => {
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
    const expectedMessage = DIRECTORY_NOT_FOUND(
      dir,
    );
    await downloadZipFromLink(fakeVerifiedPurchase, dir);

    console.error = error;
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMessage}`);
  });
  // TODO mock download request
  test("should download zip to path passed in", async () => {
    const fakeVerifiedPurchase: VerifyPurchase = {
      paymentId: "cs_live_4321GHdfaJDK",
      verified: true,
      downloadLink:
        "https://raw.githubusercontent.com/jsjoeio/install-scripts/main/fake-course.zip",
    };
    await downloadZipFromLink(fakeVerifiedPurchase, tmpDirPath);

    const zipExists = await exists(pathToZip);
    assertEquals(zipExists, true);
  });
});

describe("unZipCourse", () => {
  const error = console.error;
  let errorMessage = "";
  let tmpDirPath = "";
  let pathToUnzippedDir = "";
  let pathToZippedDir = "";
  const expectedName = "course";
  const prefix = `unZipCourse`;

  beforeEach(async () => {
    // Create a temporary directory
    tmpDirPath = await Deno.makeTempDir({ prefix });
    // Create a fake zip file
    const zip = new JSZip();
    zip.addFile("Hello.txt", "Hello World\n");

    pathToZippedDir = `${tmpDirPath}/${expectedName}.zip`;
    await zip.writeZip(pathToZippedDir);
    pathToUnzippedDir = `${tmpDirPath}/${expectedName}`;
    console.error = (x) => {
      errorMessage = x;
    };
  });

  afterEach(async () => {
    // Clean up
    const pathToZippedDirAsFile = await Deno.open(pathToZippedDir);
    const tmpDirPathAsFile = await Deno.open(tmpDirPath);
    const unzippedExists = await exists(pathToUnzippedDir);

    if (unzippedExists) {
      const pathToUnzippedDirAsFile = await Deno.open(pathToUnzippedDir);
      Deno.close(pathToUnzippedDirAsFile.rid);
      await Deno.remove(pathToUnzippedDir, { recursive: true });
    }

    Deno.close(pathToZippedDirAsFile.rid);
    Deno.close(tmpDirPathAsFile.rid);
    await Deno.remove(pathToZippedDir, { recursive: true });
    await Deno.remove(tmpDirPath, { recursive: true });
    // NOTE: not sure if the zip package I am using leaks
    // or if it's unzipping or something
    // but this closes all resources at the end of the test
    const { resources, close } = Deno;
    const openResources = resources();
    for (const key in openResources) {
      const resourceValue = openResources[key];
      const standardDenoResources = ["stdin", "stdout", "stderr"];
      if (!standardDenoResources.includes(resourceValue)) {
        close(parseInt(key));
      }
    }
    console.error = error;
  });

  test("test should have access to a temp dir and a zip file", async () => {
    const tempDirExists = await exists(tmpDirPath);
    assertEquals(tempDirExists, true);
    const zipExists = await exists(pathToZippedDir);
    assertEquals(zipExists, true);
  });

  test("should error if zip doesn't exist", async () => {
    const fileName = "myfakecourse.zip";
    const expectedMessage = FILE_NOT_FOUND(fileName);
    await unZipCourse("myfakecourse.zip");
    assertEquals(errorMessage, `${ERROR_MESSAGE_TEMPLATE} ${expectedMessage}`);
  });
  test("should unzip the file in the directory", async () => {
    await unZipCourse(pathToZippedDir, pathToUnzippedDir);

    // Check that it exists
    const unZippedExists = await exists(pathToUnzippedDir);
    assertEquals(unZippedExists, true);
  });
});
