import {
  ERROR_MESSAGE_TEMPLATE,
  HELP_MESSAGE,
  main,
  throwErrorMessage,
  UNSUPPORTED_ARG,
} from "../main.ts";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.93.0/testing/asserts.ts";

Deno.test("hello world", () => {
  const actual = () => "Hello world!";
  const expected = "Hello world!";
  assertEquals(actual(), expected);
});

Deno.test("main should take a --help flag", () => {
  // Save the real console.log
  // to restore later
  let message = null;
  const log = console.log;

  console.log = (x) => {
    message = x;
  };

  // Call main with the --help flag
  main(["--help"]);

  console.log = log;
  assertEquals(message, HELP_MESSAGE);
});

Deno.test("main should throw an error for unsupported flags", () => {
  const arg = "--yolo";
  const actual = () => main([arg]);
  const expectedMesage = UNSUPPORTED_ARG(arg);
  assertThrows(
    actual,
    undefined,
    `${ERROR_MESSAGE_TEMPLATE} ${expectedMesage}`,
  );
});

Deno.test("throwErrorMessage should throw message passed to it", () => {
  const actual = () => throwErrorMessage("no bueno");
  assertThrows(
    actual,
    undefined,
    `${ERROR_MESSAGE_TEMPLATE} no bueno`,
  );
});
