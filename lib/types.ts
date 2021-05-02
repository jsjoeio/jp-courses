import {
  DRY_RUN_FLAGS,
  HELP_FLAGS,
  PAYMENT_ID_FLAGS,
  START_ARG,
} from "./constants.ts";
/*
This is so awesome! Way more DRY too

Might be worth including in the TS course

Credit: https://stackoverflow.com/a/54061487/3015595
*/
export type HelpFlag = typeof HELP_FLAGS[number];
export type DryRunFlag = typeof DRY_RUN_FLAGS[number];
export type StartArg = typeof START_ARG[number];
// May try and validate this later
// credit: https://stackoverflow.com/questions/51445767/how-to-define-a-regex-matched-string-type-in-typescript
export type PaymentId = string;
export type PaymentIdArg = typeof PAYMENT_ID_FLAGS[number];
export type Args = HelpFlag | PaymentIdArg | PaymentId | DryRunFlag | StartArg;

type FlagOrArgEnabled = boolean;

export type ScriptFlagsAndArgs = {
  flagsEnabled: {
    help: FlagOrArgEnabled;
    dryRun: FlagOrArgEnabled;
  };
  argsPassed: {
    paymentId: PaymentId;
    start: FlagOrArgEnabled;
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
