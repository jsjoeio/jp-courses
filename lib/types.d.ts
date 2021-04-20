import { HELP_FLAGS, PAYMENT_ID_FLAGS } from "./constants.ts";
/*
This is so awesome! Way more DRY too

Might be worth including in the TS course

Credit: https://stackoverflow.com/a/54061487/3015595
*/
export type HelpFlag = typeof HELP_FLAGS[number];
// May try and validate this later
// credit: https://stackoverflow.com/questions/51445767/how-to-define-a-regex-matched-string-type-in-typescript
export type PaymentId = string;
export type PaymentIdArg = typeof PAYMENT_ID_FLAGS[number];
export type Args = HelpFlag | PaymentIdArg | PaymentId;

type FlagEnabled = boolean;

export type ScriptFlagsAndArgs = {
  flagsEnabled: {
    help: FlagEnabled;
    dryRun: FlagEnabled;
  };
  argsPassed: {
    paymentId: PaymentId;
  };
  errors: string[];
};

export type VerifyPurchase = {
  verified: boolean;
  downloadLink?: string;
  error?: null | string;
  paymentId: PaymentId;
};

interface VerifyPurchaseSuccessResponse {
  verified: boolean;
  downloadLink: string;
}

interface VerifyPurchaseErrorResponse {
  error: string;
  paymentId: string;
}

export type VerifyPurchaseResponse =
  | VerifyPurchaseSuccessResponse
  | VerifyPurchaseErrorResponse;
