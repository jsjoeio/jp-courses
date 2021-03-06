import {
  DRY_RUN_FLAGS,
  HELP_FLAGS,
  PAYMENT_ID_FLAGS,
  START_ARG,
  TEST_ARG,
} from "./constants.ts";
/*
This is so awesome! Way more DRY too

Might be worth including in the TS course

Credit: https://stackoverflow.com/a/54061487/3015595
*/
export type HelpFlag = typeof HELP_FLAGS[number];
export type DryRunFlag = typeof DRY_RUN_FLAGS[number];
export type StartArg = typeof START_ARG[number];
export type TestArg = typeof TEST_ARG[number];
// May try and validate this later
// credit: https://stackoverflow.com/questions/51445767/how-to-define-a-regex-matched-string-type-in-typescript
export type PaymentId = string;
export type PaymentIdArg = typeof PAYMENT_ID_FLAGS[number];
export type Args =
  | HelpFlag
  | PaymentIdArg
  | PaymentId
  | DryRunFlag
  | StartArg
  | TestArg;

type FlagOrArgEnabled = boolean;

export type ScriptFlagsAndArgs = {
  flagsEnabled: {
    help: FlagOrArgEnabled;
    dryRun: FlagOrArgEnabled;
  };
  argsPassed: {
    paymentId: PaymentId;
    start: FlagOrArgEnabled;
    test: FlagOrArgEnabled;
  };
  errors: string[];
};

export type VerifyPurchase = {
  verified: boolean;
  downloadLink?: string | URL;
  error?: null | string;
  paymentId: PaymentId;
};

interface VerifyPurchaseSuccessResponse {
  verified: boolean;
  downloadLink: string | URL;
}

interface VerifyPurchaseErrorResponse {
  error: string;
}

export type VerifyPurchaseResponse =
  | VerifyPurchaseSuccessResponse
  | VerifyPurchaseErrorResponse;

type Author = {
  name: string;
  /** The Twitter handle i.e. @jsjoeio (including "@") */
  twitter?: string;
  /** The GitHub handle i.e. jsjoeio */
  github?: string;
  website?: string;
};

type AnswerType = "subStringMatch";

export type CourseExercise = {
  title: string;
  number: number;
  skippable: boolean;
  /** If they skip it, then mark as true. and undefined if not skippable */
  didSkip: boolean | undefined;
  completed: boolean;
  answerType: AnswerType;
  answers: string[];
};

export type CourseExerciseResults = {
  passed: CourseExercise[];
  failed: CourseExercise[];
  skipped: CourseExercise[];
};

type CourseQuizQuestion = {
  title: string;
  number: number;
  skippable: boolean;
  completed: false;
  answers: string[];
};

type CourseSublesson = {
  title: string;
  number: number;
  completed: boolean;
  exercises: CourseExercise[];
  quiz: CourseQuizQuestion[];
};

type CourseLesson = {
  title: string;
  number: number;
  completed: boolean;
  sublessons: CourseSublesson[];
};

type CourseModule = {
  /** Title for the module */
  title: string;
  number: number;
  completed: boolean;
  lessons: CourseLesson[];
};

export interface CourseConfig {
  /** The name of the course */
  name: string;
  author: Author;
  modules: CourseModule[];
}

export type CourseProgress = {
  course: string;
  module: string;
  lesson: string;
  /** Sublessons aren't required,
   * hence why it may be undefined */
  sublesson: string | undefined;
};
