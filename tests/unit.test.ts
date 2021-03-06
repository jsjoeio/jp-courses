// Unit Tests
// Anything that doesn't rely on something else
// i.e. a simple function like checking for next arg
import {
  Args,
  CourseConfig,
  CourseExercise,
  ScriptFlagsAndArgs,
} from "../lib/types.ts";
import {
  getCourseProgress,
  getDryRunEnv,
  getExerciseResult,
  getPortEnv,
  handleArgs,
  hasNextArg,
  hasSubStringMatch,
  isExercisePassing,
  isValidCourseConfig,
  isValidDir,
  isValidPaymentIdValue,
  logErrorMessage,
  logFnNameAndDescription,
  removeZip,
  setDryRunEnv,
  sortExercisesByNumber,
  updateCourseConfig,
  verifyExercises,
  verifyPurchase,
} from "../lib/utils.ts";
import {
  handleFileToServe,
  hasHtmlFileForDir,
  isDirectory,
} from "../lib/server.ts";
import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  DEFAULT_PORT,
  DRY_RUN_ENV_KEY,
  ERROR_MESSAGE_TEMPLATE,
  INVALID_PAYMENT_ID_VALUE,
  MISSING_PAYMENT_ID_VALUE,
  PORT_ENV_KEY,
  UNSUPPORTED_ARG,
} from "../lib/constants.ts";
import { cleanUpTmpDir, createTmpDir, getFakeCourseConfig } from "./helpers.ts";
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
  test("should take a 'test' arg", () => {
    const arg = "test";
    const scriptArgsAndFlags: ScriptFlagsAndArgs = handleArgs([
      arg,
    ]);

    assertEquals(scriptArgsAndFlags.argsPassed.test, true);
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
  test("should be DEFAULT PORT if not set", () => {
    const port = getPortEnv();
    assertEquals(port, DEFAULT_PORT);
  });
  test("should be set if set by user", () => {
    const userSetPort = "8080";
    Deno.env.set(PORT_ENV_KEY, userSetPort);
    const port = getPortEnv();
    assertEquals(port, userSetPort);
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

describe("isValidDir", () => {
  let tmpDirPath = "";
  const prefix = "isValidDir";
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
    const contentDirExists = await isValidDir(currentDir, "content");
    assertEquals(contentDirExists, false);
  });
  test("should return true if /content in currentDir", async () => {
    const currentDir = tmpDirPath;
    const contentDirExists = await isValidDir(currentDir, "content");
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

describe("isValidCourseConfig", () => {
  test("should return true if valid", () => {
    const config: CourseConfig = {
      name: "Basics of TypeScript",
      author: {
        name: "Joe Previte",
        twitter: "@jsjoeio",
        github: "@jsjoeio",
        website: "https://joeprevite.com",
      },
      modules: [
        {
          title: "How to Read TypeScript",
          number: 1,
          completed: false,
          lessons: [
            {
              title: "Annotations",
              number: 1,
              completed: false,
              sublessons: [
                {
                  title: "Parameter Type Annotations",
                  number: 1,
                  completed: false,
                  exercises: [
                    {
                      title: "Write Your Own",
                      number: 1,
                      skippable: false,
                      didSkip: undefined,
                      completed: false,
                      answerType: "subStringMatch",
                      answers: ["a: number, b: number"],
                    },
                    {
                      title: "In The Wild",
                      number: 2,
                      skippable: true,
                      didSkip: false,
                      completed: false,
                      answerType: "subStringMatch",
                      answers: ["https://github.com", "https://gitlab.com"],
                    },
                    {
                      title: "Meta",
                      number: 3,
                      skippable: true,
                      didSkip: false,
                      completed: false,
                      answerType: "subStringMatch",
                      answers: ["https://github.com", "https://gitlab.com"],
                    },
                  ],
                  quiz: [
                    {
                      title: "Do parameters always need to be annotated?",
                      number: 1,
                      skippable: false,
                      completed: false,
                      answers: ["yes"],
                    },
                    {
                      title:
                        "Type annotations are defined using what single character?",
                      number: 2,
                      skippable: false,
                      completed: false,
                      answers: [":", "colon"],
                    },
                    {
                      title:
                        "What is the type for the parameter used in the `helloWorld` example from the lesson?",
                      number: 3,
                      skippable: false,
                      completed: false,
                      answers: ["string"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    assertEquals(isValidCourseConfig(config), true);
  });
  test("should return false if invalid", () => {
    const config: CourseConfig = {
      name: "Basics of TypeScript",
      author: {
        name: "Joe Previte",
        twitter: "@jsjoeio",
        github: "@jsjoeio",
        website: "https://joeprevite.com",
      },
      modules: [],
    };
    assertEquals(isValidCourseConfig(config), false);
  });
});

describe("getCourseProgress", () => {
  let tmpDirPath = "";
  let jsonFilePath = "";
  const prefix = `getCourseProgress`;
  const course: CourseConfig = {
    name: "Basics of TypeScript",
    author: {
      name: "Joe Previte",
      twitter: "@jsjoeio",
      github: "@jsjoeio",
      website: "https://joeprevite.com",
    },
    modules: [
      {
        title: "How to Read TypeScript",
        number: 1,
        completed: false,
        lessons: [
          {
            title: "Annotations",
            number: 1,
            completed: false,
            sublessons: [
              {
                title: "Parameter Type Annotations",
                number: 1,
                completed: false,
                exercises: [
                  {
                    title: "Write Your Own",
                    number: 1,
                    skippable: false,
                    didSkip: undefined,
                    completed: false,
                    answerType: "subStringMatch",
                    answers: ["a: number, b: number"],
                  },
                  {
                    title: "In The Wild",
                    number: 2,
                    skippable: true,
                    didSkip: false,
                    completed: false,
                    answerType: "subStringMatch",
                    answers: ["https://github.com", "https://gitlab.com"],
                  },
                  {
                    title: "Meta",
                    number: 3,
                    skippable: true,
                    didSkip: false,
                    completed: false,
                    answerType: "subStringMatch",
                    answers: ["https://github.com", "https://gitlab.com"],
                  },
                ],
                quiz: [
                  {
                    title: "Do parameters always need to be annotated?",
                    number: 1,
                    skippable: false,
                    completed: false,
                    answers: ["yes"],
                  },
                  {
                    title:
                      "Type annotations are defined using what single character?",
                    number: 2,
                    skippable: false,
                    completed: false,
                    answers: [":", "colon"],
                  },
                  {
                    title:
                      "What is the type for the parameter used in the `helloWorld` example from the lesson?",
                    number: 3,
                    skippable: false,
                    completed: false,
                    answers: ["string"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    tmpDirPath = await Deno.makeTempDir({ prefix });

    jsonFilePath = `${tmpDirPath}/config.json`;
    await Deno.writeTextFile(jsonFilePath, JSON.stringify(course));
  });

  afterEach(async () => {
    // Clean up
    const tmpDirPathAsFile = await Deno.open(tmpDirPath);
    const jsonFile = await Deno.open(jsonFilePath);
    Deno.close(tmpDirPathAsFile.rid);
    Deno.close(jsonFile.rid);
    await Deno.remove(tmpDirPath, { recursive: true });
  });

  test("should find a course file", async () => {
    const hasJsonFile = await exists(jsonFilePath);

    assertEquals(hasJsonFile, true);
  });

  test("should get the current course name", async () => {
    const progress = await getCourseProgress(tmpDirPath);

    assertEquals(progress.course, "Basics of TypeScript");
  });

  test("should get the current module name", async () => {
    const progress = await getCourseProgress(tmpDirPath);

    assertEquals(progress.module, "How to Read TypeScript");
  });

  test("should get the current lesson title", async () => {
    const progress = await getCourseProgress(tmpDirPath);

    assertEquals(progress.lesson, "Annotations");
  });
  test("should get the current sublesson title", async () => {
    const progress = await getCourseProgress(tmpDirPath);

    assertEquals(progress.sublesson, "Parameter Type Annotations");
  });
});

describe("hasSubStringMatch", () => {
  test("should return true if it finds a match", () => {
    const actual = hasSubStringMatch(
      "Link(2): https://github.com/jsjoeio/typescript-thing",
      ["https://github.com", "https://gitlab.com"],
    );

    assertEquals(actual, true);
  });

  test("should return false if no matches found", () => {
    const actual = hasSubStringMatch(
      "Link(2): https://twitter.com",
      ["https://github.com", "https://gitlab.com"],
    );

    assertEquals(actual, false);
  });
});

describe("isExercisePassing", () => {
  test("should pass if answer is correct", () => {
    const exercise: CourseExercise = {
      title: "In The Wild",
      number: 2,
      skippable: true,
      didSkip: false,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    };
    const answer = "https://github.com/microsoft/TypeScript";

    const actual = isExercisePassing(exercise, answer);
    assertEquals(actual, true);
  });

  test("should pass if answer is correct for longer string", () => {
    const exercise: CourseExercise = {
      title: "Write Your Own",
      number: 1,
      skippable: false,
      didSkip: undefined,
      completed: false,
      answerType: "subStringMatch",
      answers: ["a: number, b: number"],
    };
    const answer = `
    function sum(a: number, b: number) {
      return a + b;
    }
        `;

    const actual = isExercisePassing(exercise, answer);
    assertEquals(actual, true);
  });

  test("should fail if answer is incorrect", () => {
    const exercise: CourseExercise = {
      title: "In The Wild",
      number: 2,
      skippable: true,
      didSkip: false,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    };
    const answer = "https://twitter.com/jsjoeio";

    const actual = isExercisePassing(exercise, answer);
    assertEquals(actual, false);
  });
});

describe("verifyExercises", () => {
  let tmpDirPath = "";
  let pathToExerciseFileNoAnswers = "";
  let pathToExerciseFileWithAnswers = "";
  beforeEach(async () => {
    tmpDirPath = await createTmpDir("verifyExercises");
    pathToExerciseFileNoAnswers = `${tmpDirPath}/exercises.md`;
    pathToExerciseFileWithAnswers = `${tmpDirPath}/exercises-with-answers.md`;
    await Deno.writeTextFile(pathToExerciseFileNoAnswers, "");
    await Deno.writeTextFile(
      pathToExerciseFileWithAnswers,
      "https://gitlab.com",
    );
  });

  afterEach(async () => {
    await cleanUpTmpDir(tmpDirPath);
  });

  test("should return the exercise results with passed, failed and skipped", async () => {
    const exercises: CourseExercise[] = [{
      title: "In The Wild",
      number: 2,
      skippable: true,
      didSkip: false,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    }];
    const results = await verifyExercises(
      exercises,
      pathToExerciseFileNoAnswers,
    );

    ["passed", "failed", "skipped"].forEach((property) => {
      const hasProperty = results.hasOwnProperty(property);
      assertEquals(hasProperty, true);
    });
  });

  test("should return skipped exercises if no answer", async () => {
    const exercises: CourseExercise[] = [{
      title: "In The Wild",
      number: 2,
      skippable: true,
      didSkip: false,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    }];
    const results = await verifyExercises(
      exercises,
      pathToExerciseFileNoAnswers,
    );

    assertEquals(results.skipped[0], exercises[0]);
  });

  test("should mark skipped exercises completed", async () => {
    const exercises: CourseExercise[] = [{
      title: "In The Wild",
      number: 2,
      skippable: true,
      didSkip: false,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    }];
    const results = await verifyExercises(
      exercises,
      pathToExerciseFileNoAnswers,
    );

    assertEquals(results.skipped[0]["completed"], true);
  });

  test("should mark skipped exercises with didSkip", async () => {
    const exercises: CourseExercise[] = [{
      title: "In The Wild",
      number: 2,
      skippable: true,
      didSkip: false,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    }];
    const results = await verifyExercises(
      exercises,
      pathToExerciseFileNoAnswers,
    );

    assertEquals(results.skipped[0]["didSkip"], true);
  });

  test("should return failed exercises if no answer and not skippable", async () => {
    const exercises: CourseExercise[] = [{
      title: "In The Wild",
      number: 2,
      skippable: false,
      didSkip: undefined,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    }];
    const results = await verifyExercises(
      exercises,
      pathToExerciseFileNoAnswers,
    );

    assertEquals(results.failed[0], exercises[0]);
  });

  test("should return passed exercises", async () => {
    const exercises: CourseExercise[] = [{
      title: "In The Wild",
      number: 2,
      skippable: false,
      didSkip: undefined,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    }];
    const results = await verifyExercises(
      exercises,
      pathToExerciseFileWithAnswers,
    );

    assertEquals(results.passed[0], exercises[0]);
  });

  test("should mark passed exercises completed", async () => {
    const exercises: CourseExercise[] = [{
      title: "In The Wild",
      number: 2,
      skippable: false,
      didSkip: undefined,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    }];
    const results = await verifyExercises(
      exercises,
      pathToExerciseFileWithAnswers,
    );

    assertEquals(results.passed[0]["completed"], true);
  });
});

describe("updateCourseConfig", () => {
  const fakeCourseConfig = getFakeCourseConfig();
  let tmpDirPath = "";
  let jsonFilePath = "";
  beforeEach(async () => {
    tmpDirPath = await createTmpDir("updateCourseConfig");
    jsonFilePath = `${tmpDirPath}/config.json`;
    await Deno.writeTextFile(
      jsonFilePath,
      JSON.stringify(fakeCourseConfig),
    );
  });

  afterEach(async () => {
    await cleanUpTmpDir(tmpDirPath);
  });

  test("should update the course config with exercises", async () => {
    const updatedConfig = getFakeCourseConfig();
    const sublessons = updatedConfig["modules"][0]["lessons"][0]["sublessons"];
    const firstSublesson = sublessons[0];
    firstSublesson.completed = true;
    firstSublesson.exercises.forEach((exercise) => {
      exercise.completed = true;
      return exercise;
    });

    await updateCourseConfig(updatedConfig, tmpDirPath);

    const actualUpdatedConfig = await Deno.readTextFile(jsonFilePath);

    assertEquals(actualUpdatedConfig, JSON.stringify(updatedConfig));
  });
});

describe("sortExercisesByNumber", () => {
  test("should sort exercises lowest to highest", () => {
    const exercises: CourseExercise[] = [
      {
        title: "Write Your Own",
        number: 2,
        skippable: false,
        completed: false,
        didSkip: undefined,
        answerType: "subStringMatch",
        answers: ["a: number, b: number"],
      },
      {
        title: "In The Wild",
        number: 3,
        skippable: true,
        completed: false,
        didSkip: false,
        answerType: "subStringMatch",
        answers: ["https://github.com", "https://gitlab.com"],
      },
      {
        title: "Meta",
        number: 1,
        skippable: true,
        didSkip: false,
        completed: false,
        answerType: "subStringMatch",
        answers: ["https://github.com", "https://gitlab.com"],
      },
    ];
    const sorted = sortExercisesByNumber(exercises);

    assertEquals(sorted[0].title, "Meta");
    assertEquals(sorted[1].title, "Write Your Own");
    assertEquals(sorted[2].title, "In The Wild");
  });
});

describe("getExerciseResult", () => {
  test("should return a FAIL exercise", () => {
    const exercise: CourseExercise = {
      title: "Meta",
      number: 1,
      skippable: false,
      didSkip: undefined,
      completed: false,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    };

    const actual = getExerciseResult(exercise);
    assertEquals(actual, "1. FAIL");
  });
  test("should return a SKIP exercise", () => {
    const exercise: CourseExercise = {
      title: "Meta",
      number: 1,
      skippable: true,
      didSkip: true,
      completed: true,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    };

    const actual = getExerciseResult(exercise);
    assertEquals(actual, "1. SKIP");
  });
  test("should return a PASS exercise", () => {
    const exercise: CourseExercise = {
      title: "Meta",
      number: 1,
      skippable: false,
      didSkip: undefined,
      completed: true,
      answerType: "subStringMatch",
      answers: ["https://github.com", "https://gitlab.com"],
    };

    const actual = getExerciseResult(exercise);
    assertEquals(actual, "1. PASS");
  });
});
