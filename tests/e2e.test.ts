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
  beforeEach(async () => {
    // Create a subprocess to build projects
    const p = await Deno.run({ cmd: ["denon", "build"] });

    // Wait till it's completed
    await p.status();

    p.close();
  });

  afterEach(async () => {
    // Delete everything in /dist
    // Create a subprocess to run clean
    const p = await Deno.run({ cmd: ["denon", "clean"] });

    // Wait till it's completed
    await p.status();

    p.close();
  });

  test("should build before each test runs", async () => {
    // TODO get local OS
    // TODO check if zip exists for that one
    const VERSION = "0.0.3";
    const zipName = `jp-courses-v${VERSION}-x86_64-apple-darwin.zip`;
    const zipExists = await exists(`./dist/${zipName}`);
    assertEquals(zipExists, true);
    // TODO later, well refactor berfore to actually unzip
    // probably to tmp dir
  });
});
