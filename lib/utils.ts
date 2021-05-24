import {
  COULD_NOT_VERIFY_PAYMENT_ID,
  DEFAULT_PORT,
  DIRECTORY_NOT_FOUND,
  DRY_RUN_ENV_KEY,
  ERROR_MESSAGE_TEMPLATE,
  FILE_NOT_FOUND,
  INVALID_PAYMENT_ID_VALUE,
  MISSING_DOWNLOAD_LINK,
  MISSING_PAYMENT_ID_VALUE,
  PORT_ENV_KEY,
  UNSUPPORTED_ARG,
} from "./constants.ts";
import {
  Args,
  CourseConfig,
  CourseProgress,
  PaymentId,
  ScriptFlagsAndArgs,
  VerifyPurchase,
  VerifyPurchaseResponse,
} from "./types.ts";
import { exists } from "https://deno.land/std@0.93.0/fs/mod.ts";
import { blue } from "https://deno.land/std@0.93.0/fmt/colors.ts";
import { unZipFromFile } from "https://deno.land/x/zip@v1.1.1/mod.ts";
import {
  Destination,
  download,
} from "https://deno.land/x/download@v1.0.1/mod.ts";

/**
 * Logs an error message using the ERROR_MESSAGE_TEMPLATE
 * and the message passed in
 */
export function logErrorMessage(msg: string): void {
  console.error(`${ERROR_MESSAGE_TEMPLATE} ${msg}`);
}

/**
 * Exits the script with exit code 1
 */
export function exitScriptWithError() {
  Deno.exit(1);
}

/**
 * Exits the script with exit code 0
 */
export function exitScriptWithSuccess() {
  Deno.exit(0);
}

export function handleArgs(args: Args[]): ScriptFlagsAndArgs {
  const scriptFlagsAndArgs: ScriptFlagsAndArgs = {
    flagsEnabled: {
      help: false,
      dryRun: false,
    },
    argsPassed: {
      paymentId: "",
      start: false,
      test: false,
    },
    errors: [],
  };

  // This is a label for the loop
  // we do this so that we can break the outerLoop
  // from inside the switch statement
  // See: https://stackoverflow.com/questions/17072605/break-for-loop-from-inside-of-switch-case-in-javascript
  //
  outerLoop:
  for (let index = 0; index < args.length; index++) {
    // We trim in case there's extra space before or after the arg
    const arg = args[index].trim();
    switch (arg) {
      /*
        We check for the -h/--help flag first
        because we ignore all the other flags
        print the message and exit the script.
      */
      case "":
      case "-h":
      case "--help":
        scriptFlagsAndArgs.flagsEnabled.help = true;
        break outerLoop;
      case "--dryRun":
      case "--dry-run":
        scriptFlagsAndArgs.flagsEnabled.dryRun = true;
        break outerLoop;
      case "-i":
      case "--payment-id":
      case "--paymentId": {
        if (!hasNextArg(args, index)) {
          const errorMessage = MISSING_PAYMENT_ID_VALUE(arg);
          scriptFlagsAndArgs.errors.push(errorMessage);
          break outerLoop;
        }

        const paymentId = args[index + 1];
        const isValid = isValidPaymentIdValue(paymentId);
        if (!isValid) {
          const errorMessage = INVALID_PAYMENT_ID_VALUE(paymentId);
          scriptFlagsAndArgs.errors.push(errorMessage);
          break outerLoop;
        }

        scriptFlagsAndArgs.argsPassed.paymentId = paymentId;
        break;
      }
      case "start": {
        // TODO eventually, we'll have to write a separate handleStartArgs
        // which will let us add subflags to start
        scriptFlagsAndArgs.argsPassed.start = true;
        break;
      }
      case "test": {
        // TODO eventually, we'll have to write a separate handleTestArgs
        // which will let us add subflags to start
        scriptFlagsAndArgs.argsPassed.test = true;
        break;
      }

      default: {
        // Since paymentIdValue is a string
        // we can't write a specific case for it
        // but we can check here and break if it's found
        const isPaymentId = isValidPaymentIdValue(arg);
        if (isPaymentId) {
          break;
        }

        // Otherwise, it's probably and unsupported flag
        const unsupportedArgMessage = UNSUPPORTED_ARG(arg);
        scriptFlagsAndArgs.errors.push(unsupportedArgMessage);
        break outerLoop;
      }
    }
  }

  return scriptFlagsAndArgs;
}

export function hasNextArg(arr: Args[], currentIndex: number): boolean {
  const nextIndex = currentIndex + 1;

  if (arr[nextIndex]) {
    return true;
  }
  return false;
}

export function isValidPaymentIdValue(value: string): boolean {
  const pattern = /cs_live_[a-zA-Z0-9]+/g;
  const regex = new RegExp(pattern);

  return regex.test(value);
}

export async function verifyPurchase(
  paymentId: PaymentId,
): Promise<VerifyPurchase> {
  const isDryRun = getDryRunEnv() === "0";
  const verifiedPurchase: VerifyPurchase = {
    verified: false,
    downloadLink: "",
    error: null,
    paymentId,
  };

  if (isDryRun) {
    const description =
      "verifies purchase using paymentId and making request to joeprevite.com";
    logFnNameAndDescription(verifyPurchase.name, description);
    verifiedPurchase.downloadLink = "https://github.com";
    return verifiedPurchase;
  }

  if (paymentId.trim() === "") {
    verifiedPurchase.error = MISSING_PAYMENT_ID_VALUE("--paymentId");
    return verifiedPurchase;
  }

  const response = await fetch(
    `https://joeprevite.com/.netlify/functions/verify-course-purchase?paymentId=${paymentId}`,
  );

  const json: VerifyPurchaseResponse = await response.json();

  // If verified is a property, we know it was successful
  // Credit: https://stackoverflow.com/a/49363671/3015595
  if ("verified" in json) {
    verifiedPurchase.verified = json.verified;
    verifiedPurchase.downloadLink = json.downloadLink;
  } else {
    verifiedPurchase.error = COULD_NOT_VERIFY_PAYMENT_ID(paymentId);
  }

  return verifiedPurchase;
}

export async function downloadZipFromLink(
  verifiedPurchase: VerifyPurchase,
  dir: string,
): Promise<void> {
  const isDryRun = getDryRunEnv() === "0";
  if (isDryRun) {
    const description = "downloads the course zip file from github.com";
    logFnNameAndDescription(downloadZipFromLink.name, description);
    return;
  }
  const { downloadLink, paymentId } = verifiedPurchase;

  try {
    if (!downloadLink) {
      const errorMessage = MISSING_DOWNLOAD_LINK(paymentId);
      logErrorMessage(errorMessage);
      return;
    }
    const destination: Destination = {
      file: "course.zip",
      dir,
    };
    const dirExists = await exists(dir);
    if (!dirExists) {
      const errorMessage = DIRECTORY_NOT_FOUND(dir);
      logErrorMessage(errorMessage);
      return;
    }

    await download(downloadLink, destination);
    return;
  } catch (error) {
    if (error && error.message && error.message.includes("directory")) {
      const errorMessage = DIRECTORY_NOT_FOUND(dir);
      logErrorMessage(errorMessage);
      return;
    }
    logErrorMessage(error.message);
    return;
  }
}

export async function unZipCourse(
  fileName: string,
  destinationPath = "./",
) {
  const isDryRun = getDryRunEnv() === "0";
  if (isDryRun) {
    const description =
      "unzips the course into the currently directory under 'course'";
    logFnNameAndDescription(unZipCourse.name, description);
    return;
  }
  try {
    const fileExists = await exists(fileName);
    if (!fileExists) {
      const errorMessage = FILE_NOT_FOUND(fileName);
      logErrorMessage(errorMessage);
      return;
    }
    const successful = await unZipFromFile(fileName, destinationPath);
    if (!successful) {
      const errorMessage = FILE_NOT_FOUND(fileName);
      logErrorMessage(errorMessage);
      return;
    }

    // Clean up
    // We do this because I don't think unZipFromFile
    // closes resources for us
    const { resources, close } = Deno;
    const openResources = resources();
    for (const key in openResources) {
      const resourceValue = openResources[key];
      const standardDenoResources = ["stdin", "stdout", "stderr"];
      if (!standardDenoResources.includes(resourceValue)) {
        close(parseInt(key));
      }
    }
  } catch {
    const errorMessage = FILE_NOT_FOUND(fileName);
    logErrorMessage(errorMessage);
  }
}

export async function removeZip(path: string) {
  const isDryRun = getDryRunEnv() === "0";
  if (isDryRun) {
    const description =
      "removes the course.zip file from the current directory";
    logFnNameAndDescription(removeZip.name, description);
    return;
  }
  try {
    const fileExists = await exists(path);
    if (!fileExists) {
      return;
    }
    await Deno.remove(path);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Returns the environment variable
 * for DRY_RUN_ENV_KEY
 */
export function getDryRunEnv() {
  return Deno.env.get(DRY_RUN_ENV_KEY);
}

/**
 * Returns the environment variable
 * for PORT_ENV_KEY. If not existant,
 * returns DEFAULT_PORT
 */
export function getPortEnv() {
  const PORT = Deno.env.get(PORT_ENV_KEY);
  if (!PORT) {
    return DEFAULT_PORT;
  }
  return PORT;
}

/**
 * Sets the environment variable
 * DRY_RUN_ENV_KEY to "0"
 */
export function setDryRunEnv() {
  Deno.env.set(DRY_RUN_ENV_KEY, "0");
}

export function logFnNameAndDescription(fnName: string, description: string) {
  console.log(`Calling function "${fnName}" which "${description}"`);
}

/**
 * Checks whether the current directory is a valid
 * by looking for the expectedSubDir
 */
export async function isValidDir(
  currentDir: string,
  expectedSubDir: string,
): Promise<boolean | undefined> {
  try {
    return await exists(`${currentDir}/${expectedSubDir}`);
  } catch (error) {
    console.error("uh oh", error);
    return undefined;
  }
}

/**
 * Validates a course config
 */
export function isValidCourseConfig(config: CourseConfig) {
  const MINIMUM_MODULES = 1;
  const numOfModules = config.modules.length;

  if (numOfModules < MINIMUM_MODULES) {
    return false;
  }

  return true;
}

/**
 * Returns the course config
 */
export async function getCourseConfig(dir: string): Promise<CourseConfig> {
  // Source: https://www.seanmcp.com/articles/read-a-json-file-in-deno/
  const configAsString = await Deno.readTextFile(`${dir}/config.json`);
  return JSON.parse(configAsString);
}

/**
 * Gets current progress for course
 */
export async function getCourseProgress(dir: string) {
  const courseConfig = await getCourseConfig(dir);
  const progress: CourseProgress = {
    course: "",
    module: "",
    lesson: "",
    sublesson: undefined,
  };

  progress.course = courseConfig.name;

  // We use .every because it breaks when you return false
  // Source: https://masteringjs.io/tutorials/fundamentals/foreach-break
  courseConfig.modules.every((module) => {
    const isModuleComplete = module.completed;

    if (!isModuleComplete) {
      progress.module = module.title;
      return false;
    }
  });

  const currentModule =
    courseConfig.modules.filter((module) =>
      module.title === progress.module
    )[0];

  currentModule.lessons.every((lesson) => {
    const isLessonComplete = lesson.completed;

    if (!isLessonComplete) {
      progress.lesson = lesson.title;
      return false;
    }
  });

  const currentLesson =
    currentModule.lessons.filter((lesson) =>
      lesson.title === progress.lesson
    )[0];

  currentLesson.sublessons.every((sublesson) => {
    const isSublessonComplete = sublesson.completed;

    if (!isSublessonComplete) {
      progress.sublesson = sublesson.title;
      return false;
    }
  });

  return progress;
}

/**
 * Verifies practice content
 */
export async function verifyPracticeContent(dir: string): Promise<void> {
  console.log("Determining course progress...");
  const progress = await getCourseProgress(dir);

  console.log(`Course name: '${progress.course}'`);
  console.log(`Current Module: '${progress.module}'`);
  console.log(`Current Lesson: '${progress.lesson}'`);
  console.log(`Current Sublesson: '${progress.sublesson}'`);

  return undefined;
}

/**
 * Looks for a string in a file
 */
export async function hasStringMatch(
  pathToFile: string,
  answers: string[],
): Promise<boolean> {
  const fileText = await Deno.readTextFile(pathToFile);
  return hasSubstringMatch(fileText, answers);
}

/**
 * Checks for substring match
 */
export function hasSubstringMatch(str: string, matches: string[]) {
  return matches.some((match) => str.includes(match));
}
