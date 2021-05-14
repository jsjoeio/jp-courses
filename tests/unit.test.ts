// Unit Tests
// Anything that doesn't rely on something else
// i.e. a simple function like checking for next arg
import { Args, ScriptFlagsAndArgs } from "../lib/types.ts";
import {
  getDryRunEnv,
  getPortEnv,
  handleArgs,
  hasNextArg,
  isValidPaymentIdValue,
  isValidStartDir,
  logErrorMessage,
  logFnNameAndDescription,
  removeZip,
  setDryRunEnv,
  verifyPurchase,
} from "../lib/utils.ts";
import {
  handleFileToServe,
  hasHtmlFileForDir,
  isDirectory,
} from "../lib/server.ts";
import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  DRY_RUN_ENV_KEY,
  ERROR_MESSAGE_TEMPLATE,
  INVALID_PAYMENT_ID_VALUE,
  MISSING_PAYMENT_ID_VALUE,
  PORT_ENV_KEY,
  UNSUPPORTED_ARG,
} from "../lib/constants.ts";
import { getParentDir } from "../lib/server.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";
import { ensureDir, exists } from "https://deno.land/std@0.93.0/fs/mod.ts";
import { JSZip } from "https://deno.land/x/jszip@0.9.0/mod.ts";
import {
  afterEach,
  beforeEach,
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
  test("should take a --help flag", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs(["--help"]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.help, true);
  });
  test("should take a --dryRun flag", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs(["--dryRun"]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.dryRun, true);
  });
  test("should take a --dry-run flag", () => {
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs(["--dry-run"]);

    assertEquals(scriptArgsAndFlags.flagsEnabled.dryRun, true);
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
  test("should take a 'start' arg", () => {
    const arg = "start";
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs([
      arg,
    ]);

    assertEquals(scriptArgsAndFlags.argsPassed.start, true);
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
  let errorMessage: null | string;
  const error = console.error;
  let tmpDirPath = "";
  let pathToZip = "";
  const prefix = `removeZip`;
  const expectedName = `course`;

  beforeEach(async () => {
    errorMessage = null;
    console.error = (x) => {
      errorMessage = x;
    };

    // Create a temporary directory
    tmpDirPath = await Deno.makeTempDir({ prefix });
    // Create a fake zip file
    const zip = new JSZip();
    zip.addFile("Hello.txt", "Hello World\n");

    pathToZip = `${tmpDirPath}/${expectedName}.zip`;
    await zip.writeZip(pathToZip);
  });

  afterEach(async () => {
    errorMessage = null;
    console.error = error;
    // Clean up
    const tmpDirPathAsFile = await Deno.open(tmpDirPath);

    Deno.close(tmpDirPathAsFile.rid);
    await Deno.remove(tmpDirPath, { recursive: true });
  });

  test("should do nothing if zip doesn't exist", async () => {
    // do nothing
    const fakePath = "/fake/course.zip";
    await removeZip(fakePath);
    assertEquals(errorMessage, null);
  });

  test("should remove the zip if exists", async () => {
    // Check before we remove it
    let zipExists = await exists(pathToZip);
    assertEquals(zipExists, true);

    await removeZip(pathToZip);

    zipExists = await exists(pathToZip);
    assertEquals(zipExists, false);
  });
});

describe("DRY_RUN_ENV_KEY", () => {
  test("should be undefined if not set", () => {
    const key = getDryRunEnv();
    assertEquals(key, undefined);
  });
  test("should be set to '0' if setDryRunEnv is called", () => {
    setDryRunEnv();
    const key = getDryRunEnv();
    assertEquals(key, "0");
    // Clean up
    Deno.env.delete(DRY_RUN_ENV_KEY);
  });
});

describe("PORT_ENV_KEY", () => {
  test("should be undefined if not set", () => {
    const port = getPortEnv();
    assertEquals(port, undefined);
  });
  test("should be set if set by user", () => {
    Deno.env.set(PORT_ENV_KEY, "4507");
    const port = getPortEnv();
    assertEquals(port, "4507");
    // Clean up
    Deno.env.delete(PORT_ENV_KEY);
  });
});

describe("logFnNameAndDescription", () => {
  let message: string | null;
  const log = console.log;
  beforeEach(() => {
    message = null;

    console.log = (x) => {
      message = x;
    };
  });
  afterEach(() => {
    console.log = log;
    message = null;
  });
  test("should log to the console", () => {
    const fnName = "doTheThing";
    const description = "does the thing";
    logFnNameAndDescription(fnName, description);
    const expected = `Calling function "${fnName}" which "${description}"`;
    assertEquals(message, expected);
  });
});

describe("isValidStartDir", () => {
  let tmpDirPath = "";
  const prefix = "isValidStartDir";
  let fakeIndexFile: Deno.File;

  beforeEach(async () => {
    // Create a temporary directory
    tmpDirPath = await Deno.makeTempDir({ prefix });
    // Add a fake content dir
    await ensureDir(`${tmpDirPath}/content`);
    fakeIndexFile = await Deno.create(`${tmpDirPath}/content/index.html`);
  });

  afterEach(async () => {
    // Clean up
    const tmpDirPathAsFile = await Deno.open(tmpDirPath);

    Deno.close(tmpDirPathAsFile.rid);
    Deno.close(fakeIndexFile.rid);
    await Deno.remove(tmpDirPath, { recursive: true });
  });
  test("should return false if no /content in currentDir", async () => {
    const currentDir = Deno.cwd();
    const contentDirExists = await isValidStartDir(currentDir);
    assertEquals(contentDirExists, false);
  });
  test("should return true if /content in currentDir", async () => {
    const currentDir = tmpDirPath;
    const contentDirExists = await isValidStartDir(currentDir);
    assertEquals(contentDirExists, true);
  });
});

describe("getParentDir", () => {
  test("should return the parent directory", () => {
    const path = "/out/course";
    const actual = getParentDir(path);
    const expected = "/out";
    assertEquals(actual, expected);
  });
});

describe("isDirectory", () => {
  test("should return true if it is a directory", async () => {
    const path = `${Deno.cwd()}/tests`;
    const actual = await isDirectory(path);
    assertEquals(actual, true);
  });
  test("should return false if it is a file", async () => {
    const path = `${Deno.cwd()}/README.md`;
    const actual = await isDirectory(path);
    assertEquals(actual, false);
  });
});

describe("hasHtmlFileForDir", () => {
  let tmpDirPath = "";
  const prefix = "hasHtmlFileForDir";
  let fakeHtmlFile: Deno.File;
  let fakeCourseHtmlFile: Deno.File;

  beforeEach(async () => {
    // Create a temporary directory
    tmpDirPath = await Deno.makeTempDir({ prefix });
    // Add a fake content dir
    await ensureDir(`${tmpDirPath}/content`);

    // Add a fake course dir
    await ensureDir(`${tmpDirPath}/content/course`);
    fakeHtmlFile = await Deno.create(`${tmpDirPath}/content/index.html`);
    fakeCourseHtmlFile = await Deno.create(`${tmpDirPath}/content/course.html`);
  });

  afterEach(async () => {
    // Clean up
    const tmpDirPathAsFile = await Deno.open(tmpDirPath);

    Deno.close(tmpDirPathAsFile.rid);
    Deno.close(fakeHtmlFile.rid);
    Deno.close(fakeCourseHtmlFile.rid);
    await Deno.remove(tmpDirPath, { recursive: true });
  });
  test("should return true if there is an html file for the dir", async () => {
    const fileName = "course";
    const parentDir = `${tmpDirPath}/content`;
    const actual = await hasHtmlFileForDir(fileName, parentDir);
    assertEquals(actual, true);
  });
  test("should return false if there is not a matching html file for dir", async () => {
    const fileName = "joe";
    const parentDir = `${tmpDirPath}/content`;
    const actual = await hasHtmlFileForDir(fileName, parentDir);
    assertEquals(actual, false);
  });
});

describe("handleFileToServe", () => {
  let tmpDirPath = "";
  const prefix = "handleFileToServe";
  let fakeHtmlFile: Deno.File;
  let fakeCourseHtmlFile: Deno.File;

  beforeEach(async () => {
    // Create a temporary directory
    tmpDirPath = await Deno.makeTempDir({ prefix });
    // Add a fake content dir
    await ensureDir(`${tmpDirPath}/content`);

    // Add a fake course dir
    await ensureDir(`${tmpDirPath}/content/course`);
    fakeHtmlFile = await Deno.create(`${tmpDirPath}/content/index.html`);
    fakeCourseHtmlFile = await Deno.create(`${tmpDirPath}/content/course.html`);
  });

  afterEach(async () => {
    // Clean up
    const tmpDirPathAsFile = await Deno.open(tmpDirPath);

    Deno.close(tmpDirPathAsFile.rid);
    Deno.close(fakeHtmlFile.rid);
    Deno.close(fakeCourseHtmlFile.rid);
    await Deno.remove(tmpDirPath, { recursive: true });
  });
  test("should return the index.html at the root", async () => {
    const path = "/";
    const root = `${tmpDirPath}/content`;
    const fileToServe = await handleFileToServe(path, root);
    assertEquals(fileToServe, "index.html");
  });
  test("should return course.html at /course", async () => {
    const path = "/course";
    const root = `${tmpDirPath}/content`;
    const fileToServe = await handleFileToServe(path, root);
    assertEquals(fileToServe, "/course.html");
  });
  test("should return path in every other scenario", async () => {
    const path = "/bundle.js";
    const root = `${tmpDirPath}/content`;
    const fileToServe = await handleFileToServe(path, root);
    assertEquals(fileToServe, "/bundle.js");
  });
});
