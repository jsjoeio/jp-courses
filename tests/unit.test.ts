// Unit Tests
// Anything that doesn't rely on something else
// i.e. a simple function like checking for next arg
import {
  Args,
  hasNextArg,
  INVALID_PAYMENT_ID_VALUE,
  isValidPaymentIdValue,
  MISSING_PAYMENT_ID_VALUE,
  UNSUPPORTED_ARG,
} from "../main.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

Deno.test({
  name: "hasNextArg should return true if there is another arg",
  fn() {
    const fakeArgs: Args[] = ["--paymentId", "fakeid123"];
    const currentIndex = 0;
    const actual = hasNextArg(fakeArgs, currentIndex);
    const expected = true;

    assertEquals(actual, expected);
  },
});

Deno.test({
  name: "hasNextArg should return false if there is not another arg",
  fn() {
    const fakeArgs: Args[] = ["--paymentId"];
    const currentIndex = 0;
    const actual = hasNextArg(fakeArgs, currentIndex);
    const expected = false;

    assertEquals(actual, expected);
  },
});

Deno.test({
  name:
    "isValidPaymentIdValue should return false if it doesn't match the pattern",
  fn() {
    const fakePaymentIdValue = "hello2223";
    const actual = isValidPaymentIdValue(fakePaymentIdValue);
    assertEquals(actual, false);
  },
});

Deno.test({
  name: "isValidPaymentIdValue should return true if value matches pattern",
  fn() {
    const fakePaymentIdValue =
      "cs_live_a1VHFUz7lYnXOL3PUus13VbktedDQDubwfew8E70EvnS1BTOfNTSUXqO0i";
    const actual = isValidPaymentIdValue(fakePaymentIdValue);
    assertEquals(actual, true);
  },
});

Deno.test({
  name: "UNSUPPORTED_ARG should return error message",
  only: false,
  fn() {
    const arg = "--joe";
    const actual = UNSUPPORTED_ARG(arg);
    assertEquals(
      actual,
      `Received unsupported arg or flag ${arg}.
   Please run with "--help" to see all options.`,
    );
  },
});

Deno.test({
  name: "MISSING_PAYMENT_ID_VALUE should return error message",
  only: false,
  fn() {
    const arg = "--paymentId";
    const actual = MISSING_PAYMENT_ID_VALUE(arg);
    assertEquals(
      actual,
      `Missing payment id.
   ${arg} requires a value like "${arg} your_id_here123"`,
    );
  },
});

Deno.test({
  name: "INVALID_PAYMENT_ID_VALUE should return error message",
  only: false,
  fn() {
    const value = "ck_liev_dsafk5w3";
    const actual = INVALID_PAYMENT_ID_VALUE(value);
    assertEquals(
      actual,
      `Invalid payment id.
   Received: ${value}
   A valid payment id matches this pattern: cs_live_[alphanumeric]+`,
    );
  },
});
