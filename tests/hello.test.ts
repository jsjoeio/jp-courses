import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts"

Deno.test("hello world", () => {
  const actual = () => "Hello world!"
  const expected = "Hello world!"
  assertEquals(actual, expected)
})
