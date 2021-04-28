// End-to-End Tests
// Any tests that use the actual build
// i.e. denon build
import { exists } from "https://deno.land/std@0.93.0/fs/mod.ts";
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

import {
  afterEach,
  beforeEach,
  describe,
  test,
} from "https://x.nest.land/hooked-describe@0.1.0/mod.ts";

describe("jp courses", () => {
  beforeEach(() => {
    // Delete everything in /dist
    // Run denon build
  })

  afterEach(() => {
    // Delete everything in /dist
  })

  test("should build before each test runs", async () => {
    // TODO get local OS
    // TODO check if zip exists for that one
    const zipExists = await exists("./dist/")
    // TODO later, well refactor berfore to actually unzip
    // probably to tmp dir
  })
})